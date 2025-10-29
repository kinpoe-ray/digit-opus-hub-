/**
 * Task Queue Types
 */

import { Priority } from '@prisma/client';

export interface TaskJobData {
  taskId: string;
  agentId: string;
  input: any;
  priority: Priority;
}

export interface TaskJobResult {
  taskId: string;
  success: boolean;
  output?: any;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
}

export enum TaskQueueEvent {
  COMPLETED = 'completed',
  FAILED = 'failed',
  PROGRESS = 'progress',
  STALLED = 'stalled',
  ERROR = 'error',
}
