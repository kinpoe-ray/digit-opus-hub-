# digit-opus-hub

**数字员工管理中台** - 企业级 AI Agent 编排和管理平台

> 🚀 让每个组织都能轻松管理和编排 AI 数字员工，实现业务自动化和智能协作

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ 核心功能

- 🤖 **Agent 管理**: 统一管理所有 AI 数字员工的生命周期，支持创建、配置、启停
- 📋 **任务编排**: 智能任务分配和多 Agent 协作，基于Bull队列的异步任务执行
- 📊 **实时监控**: Dashboard 展示 Agent 状态和性能指标，完整的系统健康监控
- 🔄 **工作流引擎**: 可视化编排复杂业务流程（规划中）
- 🔒 **企业级安全**: JWT认证、权限管理、审计日志、数据加密
- 🎯 **多 LLM 支持**: 真实集成 OpenAI (GPT-4/3.5)、Anthropic (Claude-3)，可扩展架构
- 📈 **分页搜索**: Agent和Task列表支持真实分页和模糊搜索
- 📝 **结构化日志**: Winston多级日志系统，支持日志轮转和分类存储
- 🔁 **重试机制**: 自动重试失败任务，指数退避策略
- 💰 **成本追踪**: 精确的Token计数和费用估算

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
- **Prisma** ORM (PostgreSQL)
- **PostgreSQL** 数据库
- **Redis** 缓存和队列
- **Bull** 任务队列（支持优先级、重试、监控）
- **OpenAI SDK** + **Anthropic SDK**（真实AI集成）
- **Winston** 结构化日志系统
- **Swagger** 自动API文档

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

### 方式 1: Docker 开发环境（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/digit-opus-hub.git
cd digit-opus-hub

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置

# 3. 启动所有服务
docker compose -f docker-compose.dev.yml up --build -d

# 4. 运行数据库迁移
docker compose -f docker-compose.dev.yml exec server npx prisma migrate dev --schema prisma/schema.prisma

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
# 本地 server 脚本从 server/ 目录启动，如需 dotenv 自动加载可同步一份：
cp .env.example server/.env
# 如需覆盖前端 API 地址：
printf "VITE_API_URL=http://localhost:3000/api\n" > client/.env.local

# 3. 启动 PostgreSQL 和 Redis
docker compose -f docker-compose.dev.yml up -d postgres redis

# 4. 生成 Prisma Client 并运行数据库迁移
npm run db:generate
npm run db:migrate

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
│   │   ├── api/           # API 请求封装
│   │   ├── components/    # 可复用组件
│   │   ├── layouts/       # 页面布局
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript 类型
│   │   ├── App.tsx        # 应用根组件
│   │   ├── main.tsx       # 浏览器入口
│   │   └── theme.ts       # Ant Design 主题
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                 # Node.js 后端服务
│   ├── src/
│   │   ├── integrations/  # LLM Provider 集成
│   │   ├── lib/           # Prisma、日志等基础设施
│   │   ├── middleware/    # 中间件
│   │   ├── queues/        # Bull 队列和任务处理器
│   │   ├── routes/        # API 路由
│   │   ├── scripts/       # 数据初始化脚本
│   │   ├── services/      # 业务逻辑
│   │   └── index.ts       # 入口文件
│   ├── package.json
│   └── tsconfig.json
│
├── prisma/
│   └── schema.prisma      # 数据库 Schema
│
├── docs/                   # 文档
│   ├── business-analysis.md
│   ├── architecture/      # 架构设计
│   └── design/            # UI/UX 设计
│
├── prd.md                  # 产品需求文档
├── docker-compose.yml      # 容器化运行配置
├── docker-compose.dev.yml  # 开发环境容器配置
├── start-dev.sh            # Docker 开发环境启动脚本
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

# AI Provider API Keys
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=
OPENAI_ORGANIZATION=
OPENAI_TIMEOUT=60000
OPENAI_MAX_RETRIES=3
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_BASE_URL=
ANTHROPIC_TIMEOUT=60000
ANTHROPIC_MAX_RETRIES=3

# 应用配置
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api

# 日志配置
LOG_LEVEL=info
LOG_DIR=logs
```

> 前端本地开发时，Vite 会读取 `client/.env.local`；根目录 `.env` 主要供 Docker Compose 和后端服务使用。

---

## 📡 API 端点

### 核心 API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/agents` - 获取Agent列表（支持分页、搜索）
- `POST /api/agents` - 创建Agent
- `GET /api/tasks` - 获取任务列表（支持分页、搜索）
- `POST /api/tasks` - 创建任务（自动进入队列执行）
- `GET /api/dashboard/stats` - 获取仪表盘统计

### 监控 API
- `GET /api/monitoring/health` - 系统健康检查
- `GET /api/monitoring/metrics` - 性能指标
- `GET /api/monitoring/queue` - 队列状态

完整API文档访问：http://localhost:3000/api-docs

---

## 🧪 测试

当前仓库只配置了后端 Jest 脚本，尚未接入前端测试框架或 coverage 脚本。

```bash
# 运行已配置的测试（当前等同于后端 Jest）
npm test

# 仅运行后端测试
npm run server:test

# 前端基础验证
npm run client:build
```

---

## 🚢 部署

### 生产环境部署

```bash
# 1. 构建应用
npm run build

# 2. 使用 PM2 运行后端（需先配置数据库、Redis 和环境变量）
cd server
pm2 start dist/index.js --name digit-opus-hub-server

# 3. 前端部署到静态托管或 CDN
cd client
npm run build
# 部署 dist/ 目录
```

### 使用 Docker 部署

```bash
# 构建并启动默认 Compose 服务
docker compose up --build -d

# 当前仓库未提交 Prisma migrations，首次试跑可使用：
docker compose exec server npx prisma migrate dev --schema prisma/schema.prisma

# 已生成并提交 migrations 的生产环境可改用：
docker compose exec server npx prisma migrate deploy --schema prisma/schema.prisma
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
