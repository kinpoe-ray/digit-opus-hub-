import { Router, RequestHandler } from 'express';
import { TaskService } from '../services/taskService';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();
const taskService = new TaskService();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: 获取仪表板统计数据
 *     tags: [Dashboard]
 */
const getStatsHandler: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const stats = await taskService.getDashboardStats(authReq.user.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: '获取统计数据失败' });
  }
};

router.get('/stats', authenticate, getStatsHandler);

export default router;
