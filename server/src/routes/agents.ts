import express from 'express';
import { authenticate } from '../middleware/auth';
import { AgentController } from '../controllers/agentController';

const router = express.Router();
const agentController = new AgentController();

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: 获取 Agent 列表
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功返回 Agent 列表
 */
router.get('/', authenticate, agentController.getAgents);

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: 创建新 Agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Agent 创建成功
 */
router.post('/', authenticate, agentController.createAgent);

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: 获取 Agent 详情
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功返回 Agent 详情
 */
router.get('/:id', authenticate, agentController.getAgentById);

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: 更新 Agent
 *     tags: [Agents]
 */
router.put('/:id', authenticate, agentController.updateAgent);

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: 删除 Agent
 *     tags: [Agents]
 */
router.delete('/:id', authenticate, agentController.deleteAgent);

/**
 * @swagger
 * /api/agents/{id}/toggle:
 *   post:
 *     summary: 启用/禁用 Agent
 *     tags: [Agents]
 */
router.post('/:id/toggle', authenticate, agentController.toggleAgent);

export default router;
