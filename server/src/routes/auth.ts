import { Router, RequestHandler } from 'express';
import { UserService } from '../services/userService';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 */
const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: '请提供邮箱和密码' });
      return;
    }

    const result = await userService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || '登录失败' });
  }
};

router.post('/login', loginHandler);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 */
const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: '请提供完整信息' });
      return;
    }

    await userService.createUser({ email, password, name });
    const result = await userService.login(email, password);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || '注册失败' });
  }
};

router.post('/register', registerHandler);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Auth]
 */
const getMeHandler: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await userService.getUserById(authReq.user.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败' });
  }
};

router.get('/me', authenticate, getMeHandler);

export default router;
