// AI 集成
import { registerProviders } from './integrations/register';
import { TaskService } from './services/taskService';
import { processTask } from './queues/processors/taskProcessor';
import logger from './lib/logger';
import app from './app';

// 注册 AI Providers
registerProviders();

const PORT = process.env.PORT || 3000;

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
