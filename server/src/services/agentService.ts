import prisma from '../lib/prisma';
import { AgentStatus } from '@prisma/client';

export class AgentService {
  async getAgents(userId: string, options?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { ownerId: userId };

    if (options?.type) {
      where.type = options.type;
    }
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { type: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.agent.count({ where }),
    ]);

    return {
      data: agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAgentById(id: string) {
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return agent;
  }

  async createAgent(data: {
    name: string;
    type: string;
    description?: string;
    config?: any;
    status?: AgentStatus;
    ownerId: string;
  }) {
    const agent = await prisma.agent.create({
      data: {
        ...data,
        config: data.config || {},
        status: data.status || AgentStatus.INACTIVE,
      },
    });

    return agent;
  }

  async updateAgent(id: string, data: Partial<{
    name: string;
    type: string;
    description?: string;
    config?: any;
    status?: AgentStatus;
  }>) {
    const agent = await prisma.agent.update({
      where: { id },
      data,
    });

    return agent;
  }

  async deleteAgent(id: string) {
    await prisma.agent.delete({
      where: { id },
    });
  }

  async toggleAgent(id: string) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new Error('Agent not found');
    }

    const newStatus =
      agent.status === AgentStatus.ACTIVE ? AgentStatus.INACTIVE : AgentStatus.ACTIVE;

    return await prisma.agent.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async updateAgentStats(agentId: string) {
    const tasks = await prisma.task.findMany({
      where: { agentId },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        totalTasks,
        successRate,
      },
    });
  }
}
