import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// 导入路由
import authRoutes from './routes/auth';
import agentRoutes from './routes/agents';
import taskRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import monitoringRoutes from './routes/monitoring';

// 导入中间件
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';

// AI 集成
import { registerProviders } from './integrations/register';
import { TaskService } from './services/taskService';
import { processTask } from './queues/processors/taskProcessor';
import logger from './lib/logger';

dotenv.config();

// 注册 AI Providers
registerProviders();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// 请求解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志和限流
app.use(requestLogger);
app.use(rateLimiter);

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Swagger 文档
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'digit-opus-hub API',
      version: '1.0.0',
      description: '数字员工管理中台 API 文档',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: '开发环境',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// 初始化任务队列和 Worker
const queue = TaskService.initQueue();
queue.process(2, processTask); // 2个并发 worker
logger.info('✅ Task Worker started with concurrency: 2');

// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📚 API docs available at http://localhost:${PORT}/api-docs`);
  logger.info('🔥 AI Task Queue is ready!');
});

export default app;
