import { Router, RequestHandler } from 'express';
import { AgentService } from '../services/agentService';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();
const agentService = new AgentService();

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: 获取 Agent 列表
 *     tags: [Agents]
 */
const getAgentsHandler: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { type, status, page, limit, search } = req.query;
    const result = await agentService.getAgents(authReq.user.userId, {
      type: type as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: '获取 Agent 列表失败' });
  }
};

router.get('/', authenticate, getAgentsHandler);

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: 创建新 Agent
 *     tags: [Agents]
 */
const createAgentHandler: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, type, description, config, status } = req.body;
    const agent = await agentService.createAgent({
      name,
      type,
      description,
      config,
      status,
      ownerId: authReq.user.userId,
    });

    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: '创建 Agent 失败' });
  }
};

router.post('/', authenticate, createAgentHandler);

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: 获取 Agent 详情
 *     tags: [Agents]
 */
const getAgentByIdHandler: RequestHandler = async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);

    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: '获取 Agent 失败' });
  }
};

router.get('/:id', authenticate, getAgentByIdHandler);

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: 更新 Agent
 *     tags: [Agents]
 */
const updateAgentHandler: RequestHandler = async (req, res) => {
  try {
    const { name, type, description, config, status } = req.body;
    const agent = await agentService.updateAgent(req.params.id, {
      name,
      type,
      description,
      config,
      status,
    });

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: '更新 Agent 失败' });
  }
};

router.put('/:id', authenticate, updateAgentHandler);

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: 删除 Agent
 *     tags: [Agents]
 */
const deleteAgentHandler: RequestHandler = async (req, res) => {
  try {
    await agentService.deleteAgent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: '删除 Agent 失败' });
  }
};

router.delete('/:id', authenticate, deleteAgentHandler);

/**
 * @swagger
 * /api/agents/{id}/toggle:
 *   post:
 *     summary: 启用/禁用 Agent
 *     tags: [Agents]
 */
const toggleAgentHandler: RequestHandler = async (req, res) => {
  try {
    const agent = await agentService.toggleAgent(req.params.id);
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ message: error.message || '切换状态失败' });
  }
};

router.post('/:id/toggle', authenticate, toggleAgentHandler);

export default router;
