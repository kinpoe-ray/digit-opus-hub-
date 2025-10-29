# digit-opus-hub 使用指南

## 🎉 系统已完成！

您的数字员工管理中台已经完全配置好并可以使用了！

## 📋 功能清单

### ✅ 已实现功能

1. **用户认证**
   - 登录/注册
   - JWT Token 认证
   - 演示账号可用

2. **仪表盘**
   - 实时统计数据
   - 员工数量、任务数量
   - 成功率展示
   - 今日任务统计

3. **数字员工管理**
   - ✅ 查看员工列表
   - ✅ 创建新员工
   - ✅ 编辑员工信息
   - ✅ 删除员工
   - ✅ 启用/停止员工
   - 支持的员工类型：
     - 客服
     - 内容创作
     - 数据分析
     - 自定义

4. **任务管理**
   - ✅ 查看任务列表
   - ✅ 创建新任务
   - ✅ 分配给指定员工
   - ✅ 设置任务优先级
   - ✅ 取消正在运行的任务
   - 任务状态实时展示

## 🚀 快速开始

### 1. 访问系统

打开浏览器访问：**http://localhost:5173**

### 2. 登录

使用演示账号登录：
- 邮箱：`demo@example.com`
- 密码：`demo123`

或使用任意邮箱和密码登录（演示模式）

### 3. 开始使用

#### 创建数字员工

1. 点击左侧菜单 "数字员工"
2. 点击右上角 "创建员工" 按钮
3. 填写员工信息：
   - 名称：例如 "销售助手"
   - 类型：选择员工类型
   - 描述：描述员工的功能
   - 状态：选择运行中或已停止
4. 点击 "确定" 创建

#### 管理员工

- **编辑**：点击员工行的 "编辑" 按钮
- **删除**：点击员工行的 "删除" 按钮（需确认）
- **启用/停止**：直接点击状态开关

#### 创建任务

1. 点击左侧菜单 "任务列表"
2. 点击右上角 "创建任务" 按钮
3. 填写任务信息：
   - 任务标题：简短描述任务
   - 执行员工：选择一个数字员工
   - 任务类型：例如 "content_generation"
   - 优先级：低/中/高/紧急
   - 任务描述：详细描述任务要求
4. 点击 "确定" 创建

#### 查看任务详情

- 点击任务行可以展开查看详细信息
- 包括描述、错误信息（如果有）等

## 📊 系统架构

### 前端技术栈
- React 18
- Ant Design 5
- Zustand（状态管理）
- Axios（HTTP 客户端）
- React Router 6
- Vite（构建工具）

### 后端技术栈
- Node.js + Express
- TypeScript
- JWT 认证
- Swagger API 文档
- 内存数据存储（演示用）

### 基础设施
- Docker + Docker Compose
- PostgreSQL（数据库）
- Redis（缓存）
- Nginx（生产环境）

## 🔗 重要链接

- 前端应用：http://localhost:5173
- 后端 API：http://localhost:3000
- API 文档：http://localhost:3000/api-docs
- 健康检查：http://localhost:3000/health

## 🎯 核心功能演示

### 仪表盘
- 显示总员工数、活跃员工数
- 显示任务完成情况
- 显示成功率和今日任务数

### 员工列表
- 表格形式展示所有员工
- 每行显示：名称、类型、状态、任务数、成功率
- 支持编辑、删除、状态切换操作

### 任务列表
- 表格形式展示所有任务
- 每行显示：标题、类型、优先级、状态、创建时间
- 支持取消正在运行的任务
- 可展开查看任务详情

## 🛠️ 开发命令

```bash
# 查看所有服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 重启服务
docker-compose -f docker-compose.dev.yml restart

# 停止服务
docker-compose -f docker-compose.dev.yml down

# 重新启动
./start-dev.sh
```

## 📝 API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户

### 数字员工
- `GET /api/agents` - 获取员工列表
- `POST /api/agents` - 创建员工
- `GET /api/agents/:id` - 获取员工详情
- `PUT /api/agents/:id` - 更新员工
- `DELETE /api/agents/:id` - 删除员工
- `POST /api/agents/:id/toggle` - 切换员工状态

### 任务
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/:id` - 获取任务详情
- `POST /api/tasks/:id/cancel` - 取消任务

### 仪表盘
- `GET /api/dashboard/stats` - 获取统计数据

## 💡 使用提示

1. **数据持久化**：当前使用内存存储，重启服务后数据会重置
2. **演示模式**：所有账号都可以登录，适合测试和演示
3. **实时更新**：修改代码后会自动热重载
4. **API 文档**：访问 http://localhost:3000/api-docs 查看完整 API 文档

## 🎨 界面特点

- 清晰的左侧导航菜单
- 响应式设计，支持各种屏幕尺寸
- 中文本地化
- 友好的操作提示和确认对话框
- 统一的配色方案和设计语言

## 📈 下一步

1. 连接真实的数据库（Prisma）
2. 实现真实的 AI Agent 逻辑
3. 添加更多的任务类型
4. 实现工作流编排功能
5. 添加更详细的日志和监控

---

**享受使用 digit-opus-hub！** 🚀
