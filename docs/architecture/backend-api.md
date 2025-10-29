# 后端 API 架构设计

> **设计者**: backend-development__backend-architect
> **日期**: 2025-10-29

## API 架构概览

### 技术栈
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma
- **Validation**: Zod
- **Auth**: Passport.js + JWT

### 项目结构

```
server/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.ts
│   │   ├── llm.ts
│   │   └── redis.ts
│   ├── middleware/       # 中间件
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/          # 路由
│   │   ├── auth.ts
│   │   ├── agents.ts
│   │   ├── tasks.ts
│   │   └── workflows.ts
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑
│   ├── models/          # 数据模型
│   ├── utils/           # 工具函数
│   └── index.ts         # 入口文件
├── prisma/
│   └── schema.prisma
├── tests/
├── package.json
└── tsconfig.json
```

## API 端点设计

### 认证 APIs (/api/auth)

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}
```

### Agent APIs (/api/agents)

```typescript
// GET /api/agents
interface GetAgentsQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

// POST /api/agents
interface CreateAgentRequest {
  name: string;
  type: string;
  description?: string;
  config: AgentConfig;
}

// PUT /api/agents/:id
// DELETE /api/agents/:id
// POST /api/agents/:id/toggle
```

### Task APIs (/api/tasks)

```typescript
// POST /api/tasks
interface CreateTaskRequest {
  name: string;
  agentId: string;
  input: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// GET /api/tasks/:id/logs
// POST /api/tasks/:id/retry
// POST /api/tasks/:id/cancel
```

完整 API 文档见 Swagger: http://localhost:3000/api-docs
