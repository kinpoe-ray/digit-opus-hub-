import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('开始初始化数据库...');

  // 创建演示用户
  const passwordHash = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      name: '演示用户',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ 创建演示用户:', user.email);

  // 创建演示 Agents
  const agent1 = await prisma.agent.upsert({
    where: { id: 'agent-1' },
    update: {},
    create: {
      id: 'agent-1',
      name: '客服助手',
      type: 'CUSTOMER_SERVICE',
      description: '处理客户咨询和售后问题',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
      },
      status: 'ACTIVE',
      ownerId: user.id,
      totalTasks: 156,
      successRate: 94.5,
    },
  });

  const agent2 = await prisma.agent.upsert({
    where: { id: 'agent-2' },
    update: {},
    create: {
      id: 'agent-2',
      name: '内容创作者',
      type: 'CONTENT_CREATOR',
      description: '生成营销文案和产品介绍',
      config: {
        model: 'gpt-4',
        temperature: 0.9,
        maxTokens: 3000,
      },
      status: 'ACTIVE',
      ownerId: user.id,
      totalTasks: 89,
      successRate: 98.2,
    },
  });

  console.log('✅ 创建演示 Agents:', agent1.name, agent2.name);

  // 创建演示任务
  const task1 = await prisma.task.create({
    data: {
      name: '生成产品介绍文案',
      description: '为新产品生成吸引人的介绍文案',
      status: 'COMPLETED',
      priority: 'NORMAL',
      input: { product: '智能手表', features: ['健康监测', '消息通知', '运动追踪'] },
      output: {
        content: '这是一款革命性的智能手表，集健康监测、消息通知和运动追踪于一体...',
      },
      agentId: agent2.id,
      createdBy: user.id,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 1800000),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      name: '客户咨询回复',
      description: '回复客户关于退货政策的咨询',
      status: 'COMPLETED',
      priority: 'HIGH',
      input: { question: '请问退货政策是什么？' },
      output: {
        answer:
          '我们提供7天无理由退货服务，商品需保持原包装和吊牌完整。退货时请联系客服获取退货地址。',
      },
      agentId: agent1.id,
      createdBy: user.id,
      startedAt: new Date(Date.now() - 600000),
      completedAt: new Date(Date.now() - 300000),
    },
  });

  console.log('✅ 创建演示任务:', task1.name, task2.name);

  console.log('🎉 数据库初始化完成！');
  console.log('');
  console.log('演示账号：');
  console.log('  邮箱: demo@example.com');
  console.log('  密码: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
