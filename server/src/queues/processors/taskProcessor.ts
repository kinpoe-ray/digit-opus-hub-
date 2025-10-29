/**
 * Task Processor
 * 处理队列中的任务，调用真实 AI 执行
 */

import { Job } from 'bull';
import { TaskJobData, TaskJobResult } from '../types';
import prisma from '../../lib/prisma';
import { ProviderFactory } from '../../integrations/factory';
import { AIProviderType, AIModel, AIRequest } from '../../integrations/types';
import { TaskStatus } from '@prisma/client';
import logger, { taskLogger, aiLogger } from '../../lib/logger';

export async function processTask(job: Job<TaskJobData>): Promise<TaskJobResult> {
  const { taskId, agentId, input } = job.data;
  const startTime = Date.now();

  try {
    taskLogger.started(taskId, agentId, { input });

    // 更新任务状态为 RUNNING
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    // 获取 Agent 配置
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // 解析 Agent 配置
    const config = agent.config as any;
    const providerType: AIProviderType = config.provider || AIProviderType.OPENAI;
    const model: AIModel = config.model || AIModel.GPT_3_5_TURBO;
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    // 创建 Provider
    const provider = ProviderFactory.create(providerType, {
      apiKey: apiKey!,
      timeout: 60000,
      maxRetries: 3,
    });

    // 构造 AI 请求
    const aiRequest: AIRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: config.systemPrompt || `You are ${agent.name}, ${agent.description}`,
        },
        {
          role: 'user',
          content: typeof input === 'string' ? input : JSON.stringify(input),
        },
      ],
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2000,
    };

    // 执行 AI 请求
    aiLogger.request(providerType, model, { taskId, agentId });
    const { response, metrics } = await provider.executeWithMetrics(aiRequest);
    aiLogger.response(providerType, model, metrics.usage, { taskId, duration: metrics.duration });

    // 创建日志记录
    await prisma.log.create({
      data: {
        level: 'INFO',
        message: `Task ${taskId} completed successfully`,
        metadata: {
          taskId,
          agentId,
          provider: providerType,
          model,
          duration: metrics.duration,
          usage: {
            promptTokens: metrics.usage.promptTokens,
            completionTokens: metrics.usage.completionTokens,
            totalTokens: metrics.usage.totalTokens,
            estimatedCost: metrics.usage.estimatedCost,
          },
        },
        taskId,
        agentId,
      },
    });

    // 更新任务状态
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        output: {
          content: response.content,
          finishReason: response.finishReason,
        },
        completedAt: new Date(),
      },
    });

    // 更新 Agent 统计
    await updateAgentStats(agentId, true);

    const duration = Date.now() - startTime;
    taskLogger.completed(taskId, agentId, duration, { usage: metrics.usage });

    return {
      taskId,
      success: true,
      output: {
        content: response.content,
        finishReason: response.finishReason,
      },
      usage: {
        promptTokens: metrics.usage.promptTokens,
        completionTokens: metrics.usage.completionTokens,
        totalTokens: metrics.usage.totalTokens,
        cost: metrics.usage.estimatedCost,
      },
    };
  } catch (error: any) {
    taskLogger.failed(taskId, agentId, error);

    // 记录错误日志
    await prisma.log.create({
      data: {
        level: 'ERROR',
        message: `Task ${taskId} failed: ${error.message}`,
        metadata: {
          taskId,
          agentId,
          error: error.stack,
        },
        taskId,
        agentId,
      },
    });

    // 更新任务状态为失败
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      },
    });

    // 更新 Agent 统计
    await updateAgentStats(agentId, false);

    return {
      taskId,
      success: false,
      error: error.message,
    };
  }
}

/**
 * 更新 Agent 统计信息
 */
async function updateAgentStats(agentId: string, success: boolean): Promise<void> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) return;

  const totalTasks = agent.totalTasks + 1;
  const successfulTasks = success ? (agent.totalTasks * agent.successRate / 100) + 1 : (agent.totalTasks * agent.successRate / 100);
  const successRate = (successfulTasks / totalTasks) * 100;

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      totalTasks,
      successRate: Math.round(successRate * 10) / 10,
    },
  });
}
