/**
 * Winston Logger Configuration
 * Structured logging with multiple transports
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = process.env.LOG_DIR || 'logs';

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台输出格式（更易读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      msg += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// 创建 Winston logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'digit-opus-hub' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),

    // 错误日志文件（每日轮转）
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),

    // 所有日志文件（每日轮转）
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
    }),

    // 任务执行日志（单独文件）
    new DailyRotateFile({
      filename: path.join(logDir, 'tasks-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '50m',
      maxFiles: '14d',
      format: logFormat,
    }),
  ],

  // 防止未捕获的异常导致进程退出
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],

  // 防止未处理的 Promise rejection
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// 在开发环境下，添加更详细的错误堆栈
if (process.env.NODE_ENV === 'development') {
  logger.debug('🔧 Logger initialized in development mode');
}

// 导出便捷方法
export default logger;

// 任务日志专用方法
export const taskLogger = {
  started: (taskId: string, agentId: string, meta?: any) => {
    logger.info('Task started', { taskId, agentId, ...meta, category: 'task' });
  },
  completed: (taskId: string, agentId: string, duration: number, meta?: any) => {
    logger.info('Task completed', { taskId, agentId, duration, ...meta, category: 'task' });
  },
  failed: (taskId: string, agentId: string, error: Error, meta?: any) => {
    logger.error('Task failed', { taskId, agentId, error: error.message, stack: error.stack, ...meta, category: 'task' });
  },
  progress: (taskId: string, progress: number, meta?: any) => {
    logger.debug('Task progress', { taskId, progress, ...meta, category: 'task' });
  },
};

// AI 调用日志专用方法
export const aiLogger = {
  request: (provider: string, model: string, meta?: any) => {
    logger.info('AI request', { provider, model, ...meta, category: 'ai' });
  },
  response: (provider: string, model: string, usage: any, meta?: any) => {
    logger.info('AI response', { provider, model, usage, ...meta, category: 'ai' });
  },
  error: (provider: string, model: string, error: Error, meta?: any) => {
    logger.error('AI error', { provider, model, error: error.message, stack: error.stack, ...meta, category: 'ai' });
  },
};

// 队列日志专用方法
export const queueLogger = {
  added: (jobId: string, data: any) => {
    logger.info('Job added to queue', { jobId, data, category: 'queue' });
  },
  processing: (jobId: string) => {
    logger.debug('Job processing', { jobId, category: 'queue' });
  },
  completed: (jobId: string, result: any) => {
    logger.info('Job completed', { jobId, result, category: 'queue' });
  },
  failed: (jobId: string, error: Error) => {
    logger.error('Job failed', { jobId, error: error.message, stack: error.stack, category: 'queue' });
  },
  stalled: (jobId: string) => {
    logger.warn('Job stalled', { jobId, category: 'queue' });
  },
};
