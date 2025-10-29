# digit-opus-hub

**数字员工管理中台** - 企业级 AI Agent 编排和管理平台

> 🚀 让每个组织都能轻松管理和编排 AI 数字员工，实现业务自动化和智能协作

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ 核心功能

- 🤖 **Agent 管理**: 统一管理所有 AI 数字员工的生命周期
- 📋 **任务编排**: 智能任务分配和多 Agent 协作
- 📊 **实时监控**: Dashboard 展示 Agent 状态和性能指标
- 🔄 **工作流引擎**: 可视化编排复杂业务流程
- 🔒 **企业级安全**: 权限管理、审计日志、数据加密
- 🎯 **多 LLM 支持**: OpenAI, Anthropic, 自定义模型

---

## 🏗️ 技术架构

### 前端
- **React 18** + **TypeScript** + **Vite**
- **Ant Design** UI 组件库
- **Zustand** 状态管理
- **TanStack Query** 数据请求
- **React Flow** 工作流编辑器

### 后端
- **Node.js 20** + **Express.js** + **TypeScript**
- **Prisma** ORM
- **PostgreSQL** 数据库
- **Redis** 缓存和队列
- **Bull** 任务队列
- **OpenAI SDK** / **LangChain**

### DevOps
- **Docker** + **Docker Compose**
- **Prisma Migrations** 数据库版本控制
- **Winston** 日志系统
- **Swagger** API 文档

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- PostgreSQL >= 15
- Redis >= 7
- OpenAI API Key（可选）

### 方式 1: Docker 快速部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/digit-opus-hub.git
cd digit-opus-hub

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置

# 3. 启动所有服务
docker-compose up -d

# 4. 运行数据库迁移
docker-compose exec server npm run db:migrate

# 5. 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3000
# API 文档: http://localhost:3000/api-docs
```

### 方式 2: 本地开发

```bash
# 1. 安装依赖
npm run install:all

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 启动 PostgreSQL 和 Redis
# 可以使用 Docker 或本地安装

# 4. 运行数据库迁移
cd server && npx prisma migrate dev

# 5. 启动开发服务器（前后端）
npm run dev

# 前端运行在 http://localhost:5173
# 后端运行在 http://localhost:3000
```

---

## 📁 项目结构

```
digit-opus-hub/
├── client/                 # React 前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand stores
│   │   ├── api/           # API 请求
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── types/         # TypeScript 类型
│   │   └── App.tsx        # 应用入口
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Node.js 后端服务
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── utils/         # 工具函数
│   │   └── index.ts       # 入口文件
│   ├── prisma/
│   │   └── schema.prisma  # 数据库 Schema
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                   # 文档
│   ├── prd.md             # 产品需求文档
│   ├── architecture/      # 架构设计
│   └── design/            # UI/UX 设计
│
├── docker-compose.yml      # Docker 编排
├── .env.example            # 环境变量模板
├── package.json            # 根 package.json
└── README.md               # 本文件
```

---

## 📖 文档

- [产品需求文档 (PRD)](./prd.md)
- [业务分析报告](./docs/business-analysis.md)
- [AI Agent 技术方案](./docs/architecture/ai-agent-system.md)
- [后端 API 设计](./docs/architecture/backend-api.md)
- [UI/UX 设计文档](./docs/design/ui-ux-design.md)
- [API 文档](http://localhost:3000/api-docs) (运行后访问)

---

## 🔑 环境变量配置

关键环境变量说明（详见 `.env.example`）:

```bash
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/digit_opus_hub

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=sk-...

# 应用配置
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 仅运行后端测试
npm run server:test

# 仅运行前端测试
npm run client:test

# 测试覆盖率
npm run test:coverage
```

---

## 🚢 部署

### 生产环境部署

```bash
# 1. 构建应用
npm run build

# 2. 使用 PM2 运行后端
cd server
pm2 start dist/index.js --name digit-opus-hub-server

# 3. 前端部署到 CDN（例如 Vercel, Netlify）
cd client
npm run build
# 部署 dist/ 目录
```

### 使用 Docker 部署

```bash
# 生产环境 Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📄 License

本项目基于 MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Prisma](https://www.prisma.io/)
- [Ant Design](https://ant.design/)
- [OpenAI](https://openai.com/)

---

## 📧 联系我们

- 项目主页: https://github.com/your-org/digit-opus-hub
- 问题反馈: https://github.com/your-org/digit-opus-hub/issues
- 邮箱: contact@digit-opus-hub.com

---

**Built with ❤️ by digit-opus-hub Team**
