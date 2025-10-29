import { Router, RequestHandler } from 'express';
import { TaskService } from '../services/taskService';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();
const taskService = new TaskService();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: 获取任务列表
 *     tags: [Tasks]
 */
const getTasksHandler: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { status, agentId, priority, page, limit, search } = req.query;
    const result = await taskService.getTasks(authReq.user.userId, {
      status: status as string,
      agentId: agentId as string,
      priority: priority as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: '获取任务列表失败' });
  }
};

router.get('/', authenticate, getTasksHandler);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: 创建新任务
 *     tags: [Tasks]
 */
const createTaskHandler: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, description, type, priority, agentId, input } = req.body;
    const task = await taskService.createTask({
      title,
      description,
      type,
      priority,
      agentId,
      input,
      userId: authReq.user.userId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: '创建任务失败' });
  }
};

router.post('/', authenticate, createTaskHandler);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: 获取任务详情
 *     tags: [Tasks]
 */
const getTaskByIdHandler: RequestHandler = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: '获取任务失败' });
  }
};

router.get('/:id', authenticate, getTaskByIdHandler);

/**
 * @swagger
 * /api/tasks/{id}/cancel:
 *   post:
 *     summary: 取消任务
 *     tags: [Tasks]
 */
const cancelTaskHandler: RequestHandler = async (req, res) => {
  try {
    const task = await taskService.cancelTask(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: '取消任务失败' });
  }
};

router.post('/:id/cancel', authenticate, cancelTaskHandler);

export default router;
