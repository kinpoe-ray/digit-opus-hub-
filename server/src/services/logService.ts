/**
 * Log Service
 * 管理系统日志记录
 */

import prisma from '../lib/prisma';
import { LogLevel } from '@prisma/client';

export class LogService {
  /**
   * 创建日志
   */
  async createLog(data: {
    level: LogLevel;
    message: string;
    metadata?: any;
    taskId?: string;
    agentId?: string;
  }) {
    return prisma.log.create({
      data: {
        level: data.level,
        message: data.message,
        metadata: data.metadata,
        taskId: data.taskId,
        agentId: data.agentId,
      },
    });
  }

  /**
   * 获取任务日志
   */
  async getTaskLogs(taskId: string) {
    return prisma.log.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取 Agent 日志
   */
  async getAgentLogs(agentId: string, limit: number = 100) {
    return prisma.log.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * 获取错误日志
   */
  async getErrorLogs(limit: number = 100) {
    return prisma.log.findMany({
      where: { level: LogLevel.ERROR },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * 清理旧日志（保留最近 N 天）
   */
  async cleanOldLogs(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * 记录 INFO 日志
   */
  async info(message: string, metadata?: any, taskId?: string, agentId?: string) {
    return this.createLog({
      level: LogLevel.INFO,
      message,
      metadata,
      taskId,
      agentId,
    });
  }

  /**
   * 记录 WARN 日志
   */
  async warn(message: string, metadata?: any, taskId?: string, agentId?: string) {
    return this.createLog({
      level: LogLevel.WARN,
      message,
      metadata,
      taskId,
      agentId,
    });
  }

  /**
   * 记录 ERROR 日志
   */
  async error(message: string, metadata?: any, taskId?: string, agentId?: string) {
    return this.createLog({
      level: LogLevel.ERROR,
      message,
      metadata,
      taskId,
      agentId,
    });
  }

  /**
   * 记录 DEBUG 日志
   */
  async debug(message: string, metadata?: any, taskId?: string, agentId?: string) {
    return this.createLog({
      level: LogLevel.DEBUG,
      message,
      metadata,
      taskId,
      agentId,
    });
  }
}
