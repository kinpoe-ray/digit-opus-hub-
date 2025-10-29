/**
 * Task Queue Implementation using Bull
 */

import Bull, { Queue, Job, JobOptions } from 'bull';
import { RedisOptions } from 'ioredis';
import { TaskJobData, TaskJobResult } from './types';
import { Priority } from '@prisma/client';
import logger, { queueLogger } from '../lib/logger';

// Priority 映射到 Bull 的优先级（数字越小优先级越高）
const PRIORITY_MAP: Record<Priority, number> = {
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
};

export class TaskQueue {
  private queue: Queue<TaskJobData>;
  private readonly queueName = 'ai-tasks';

  constructor(redisUrl?: string) {
    const redisOptions = this.parseRedisUrl(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');

    this.queue = new Bull<TaskJobData>(this.queueName, {
      redis: redisOptions,
      defaultJobOptions: {
        attempts: 3, // 最多重试3次
        backoff: {
          type: 'exponential',
          delay: 2000, // 初始延迟2秒
        },
        removeOnComplete: 100, // 保留最近100个已完成任务
        removeOnFail: 200, // 保留最近200个失败任务
      },
    });

    this.setupEventListeners();
  }

  /**
   * 解析 Redis URL
   */
  private parseRedisUrl(url: string): RedisOptions {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 6379,
      password: urlObj.password || undefined,
      db: parseInt(urlObj.pathname.slice(1)) || 0,
      maxRetriesPerRequest: null, // Bull 需要
    };
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.queue.on('completed', (job: Job<TaskJobData>) => {
      queueLogger.completed(job.data.taskId, { agentId: job.data.agentId });
    });

    this.queue.on('failed', (job: Job<TaskJobData>, err: Error) => {
      queueLogger.failed(job.data.taskId, err);
    });

    this.queue.on('stalled', (job: Job<TaskJobData>) => {
      queueLogger.stalled(job.data.taskId);
    });

    this.queue.on('error', (error: Error) => {
      logger.error('Queue error', { error: error.message, stack: error.stack });
    });
  }

  /**
   * 添加任务到队列
   */
  public async addTask(data: TaskJobData): Promise<Job<TaskJobData>> {
    const jobOptions: JobOptions = {
      priority: PRIORITY_MAP[data.priority],
      jobId: data.taskId, // 使用 taskId 作为 jobId，防止重复
      timeout: 300000, // 5分钟超时
    };

    queueLogger.added(data.taskId, { agentId: data.agentId, priority: data.priority });
    return this.queue.add(data, jobOptions);
  }

  /**
   * 处理任务（由 Worker 调用）
   */
  public process(concurrency: number, processor: (job: Job<TaskJobData>) => Promise<TaskJobResult>): void {
    this.queue.process(concurrency, processor);
  }

  /**
   * 获取任务状态
   */
  public async getJobStatus(taskId: string): Promise<{
    state: string;
    progress: any;
    result?: TaskJobResult;
    failedReason?: string;
  } | null> {
    const job = await this.queue.getJob(taskId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return { state, progress, result, failedReason };
  }

  /**
   * 取消任务
   */
  public async cancelTask(taskId: string): Promise<boolean> {
    const job = await this.queue.getJob(taskId);
    if (!job) return false;

    await job.remove();
    return true;
  }

  /**
   * 重试失败的任务
   */
  public async retryTask(taskId: string): Promise<boolean> {
    const job = await this.queue.getJob(taskId);
    if (!job) return false;

    await job.retry();
    return true;
  }

  /**
   * 获取队列统计
   */
  public async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
      this.queue.getPausedCount(),
    ]);

    return { waiting, active, completed, failed, delayed, paused };
  }

  /**
   * 暂停队列
   */
  public async pause(): Promise<void> {
    await this.queue.pause();
  }

  /**
   * 恢复队列
   */
  public async resume(): Promise<void> {
    await this.queue.resume();
  }

  /**
   * 清空队列
   */
  public async empty(): Promise<void> {
    await this.queue.empty();
  }

  /**
   * 清空所有已完成的任务
   */
  public async clean(grace: number = 0, status: 'completed' | 'failed' = 'completed'): Promise<void> {
    await this.queue.clean(grace, status);
  }

  /**
   * 关闭队列
   */
  public async close(): Promise<void> {
    await this.queue.close();
  }

  /**
   * 获取队列实例（用于高级操作）
   */
  public getQueue(): Queue<TaskJobData> {
    return this.queue;
  }
}
