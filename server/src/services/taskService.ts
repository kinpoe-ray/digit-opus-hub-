import prisma from '../lib/prisma';
import { TaskStatus, Priority } from '@prisma/client';
import { AgentService } from './agentService';
import { TaskQueue } from '../queues';
import logger from '../lib/logger';

const agentService = new AgentService();
let taskQueue: TaskQueue | null = null;

// 初始化日志
if (process.env.NODE_ENV === 'development') {
  logger.debug('TaskService module loaded');
}

export class TaskService {
  /**
   * 初始化任务队列
   */
  static initQueue() {
    if (!taskQueue) {
      taskQueue = new TaskQueue();
      logger.info('✅ Task Queue initialized');
    }
    return taskQueue;
  }

  /**
   * 获取队列实例
   */
  private getQueue(): TaskQueue {
    if (!taskQueue) {
      return TaskService.initQueue();
    }
    return taskQueue;
  }

  async getTasks(userId: string, options?: {
    status?: string;
    agentId?: string;
    priority?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { createdBy: userId };

    if (options?.status) {
      where.status = options.status;
    }
    if (options?.agentId) {
      where.agentId = options.agentId;
    }
    if (options?.priority) {
      where.priority = options.priority;
    }
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    // 转换字段名以匹配前端期望
    return {
      data: tasks.map((task) => ({
        ...task,
        title: task.name,
        userId: task.createdBy,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        agent: true,
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!task) return null;

    return {
      ...task,
      title: task.name,
      userId: task.createdBy,
    };
  }

  async createTask(data: {
    title: string;
    description?: string;
    type?: string;
    priority: Priority;
    input: any;
    agentId: string;
    userId: string;
  }) {
    const task = await prisma.task.create({
      data: {
        name: data.title,
        description: data.description,
        priority: data.priority,
        input: data.input,
        status: TaskStatus.PENDING,
        agentId: data.agentId,
        createdBy: data.userId,
      },
    });

    // 添加到队列执行
    try {
      const queue = this.getQueue();
      await queue.addTask({
        taskId: task.id,
        agentId: task.agentId,
        input: task.input,
        priority: task.priority,
      });
      logger.info(`✅ Task ${task.id} added to queue`);
    } catch (error) {
      logger.error(`❌ Failed to add task ${task.id} to queue`, { error, taskId: task.id });
      // 标记任务为失败
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.FAILED,
          error: 'Failed to add to queue',
        },
      });
    }

    return {
      ...task,
      title: task.name,
      userId: task.createdBy,
    };
  }

  async updateTask(id: string, data: Partial<{
    title?: string;
    description?: string;
    status?: TaskStatus;
    output?: any;
    error?: any;
  }>) {
    const updateData: any = {};

    if (data.title) updateData.name = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.output) updateData.output = data.output;
    if (data.error) updateData.error = data.error;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // 更新 Agent 统计
    await agentService.updateAgentStats(task.agentId);

    return {
      ...task,
      title: task.name,
      userId: task.createdBy,
    };
  }

  async cancelTask(id: string) {
    // 尝试从队列中取消
    try {
      const queue = this.getQueue();
      await queue.cancelTask(id);
      logger.info(`✅ Task ${id} cancelled from queue`);
    } catch (error) {
      logger.warn(`⚠️  Failed to cancel task ${id} from queue`, { error, taskId: id });
    }

    // 更新数据库状态
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.CANCELLED,
      },
    });

    return {
      ...task,
      title: task.name,
      userId: task.createdBy,
    };
  }

  /**
   * 重试失败的任务
   */
  async retryTask(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // 重置状态
    await prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.PENDING,
        error: undefined,
        output: undefined,
        startedAt: undefined,
        completedAt: undefined,
      },
    });

    // 重新添加到队列
    const queue = this.getQueue();
    await queue.addTask({
      taskId: task.id,
      agentId: task.agentId,
      input: task.input,
      priority: task.priority,
    });

    return {
      ...task,
      status: TaskStatus.PENDING,
      title: task.name,
      userId: task.createdBy,
    };
  }

  /**
   * 获取队列统计
   */
  async getQueueStats() {
    const queue = this.getQueue();
    return queue.getStats();
  }

  async getDashboardStats(userId: string) {
    const agents = await prisma.agent.findMany({
      where: { ownerId: userId },
    });

    const tasks = await prisma.task.findMany({
      where: { createdBy: userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter((t) => new Date(t.createdAt) >= today);

    const totalAgents = agents.length;
    const activeAgents = agents.filter((a) => a.status === 'ACTIVE').length;
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(
      (t) => t.status === 'PENDING' || t.status === 'RUNNING'
    ).length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const failedTasks = tasks.filter((t) => t.status === 'FAILED').length;
    const successRate =
      totalTasks > 0 ? (completedTasks / (completedTasks + failedTasks)) * 100 : 0;

    return {
      totalAgents,
      activeAgents,
      totalTasks,
      activeTasks,
      completedTasks,
      failedTasks,
      successRate: Math.round(successRate * 10) / 10,
      todayTasks: todayTasks.length,
    };
  }
}
