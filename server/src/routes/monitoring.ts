import { Router, RequestHandler } from 'express';
import { TaskService } from '../services/taskService';
import os from 'os';
import logger from '../lib/logger';

const router = Router();
const taskService = new TaskService();

/**
 * @swagger
 * /api/monitoring/health:
 *   get:
 *     summary: 系统健康检查
 *     tags: [Monitoring]
 */
const healthCheckHandler: RequestHandler = async (_req, res) => {
  try {
    const queue = taskService['getQueue']();
    const queueStats = await queue.getStats();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg(),
      },
      queue: {
        active: queueStats.active,
        waiting: queueStats.waiting,
        failed: queueStats.failed,
      },
    };

    res.json(health);
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      message: 'Service unhealthy',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/monitoring/metrics:
 *   get:
 *     summary: 系统性能指标
 *     tags: [Monitoring]
 */
const metricsHandler: RequestHandler = async (_req, res) => {
  try {
    const queue = taskService['getQueue']();
    const queueStats = await queue.getStats();

    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      queue: {
        waiting: queueStats.waiting,
        active: queueStats.active,
        completed: queueStats.completed,
        failed: queueStats.failed,
        delayed: queueStats.delayed,
        paused: queueStats.paused,
      },
      process: {
        pid: process.pid,
        title: process.title,
        cwd: process.cwd(),
      },
    };

    res.json(metrics);
  } catch (error: any) {
    logger.error('Metrics collection failed', { error: error.message });
    res.status(500).json({ message: '获取指标失败', error: error.message });
  }
};

/**
 * @swagger
 * /api/monitoring/queue:
 *   get:
 *     summary: 队列详细状态
 *     tags: [Monitoring]
 */
const queueStatusHandler: RequestHandler = async (_req, res) => {
  try {
    const queue = taskService['getQueue']();
    const stats = await queue.getStats();

    res.json({
      timestamp: new Date().toISOString(),
      stats,
      health: stats.active > 0 || stats.waiting > 0 ? 'processing' : 'idle',
      totalProcessed: stats.completed + stats.failed,
      successRate: stats.completed > 0
        ? ((stats.completed / (stats.completed + stats.failed)) * 100).toFixed(2)
        : '0.00',
    });
  } catch (error: any) {
    logger.error('Queue status check failed', { error: error.message });
    res.status(500).json({ message: '获取队列状态失败', error: error.message });
  }
};

router.get('/health', healthCheckHandler);
router.get('/metrics', metricsHandler);
router.get('/queue', queueStatusHandler);

export default router;
