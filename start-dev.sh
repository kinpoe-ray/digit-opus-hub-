#!/bin/bash

echo "🚀 启动 digit-opus-hub 开发环境..."
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行！"
    echo "请启动 Docker Desktop 应用，然后重试。"
    exit 1
fi

echo "✅ Docker 正在运行"
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，从 .env.example 复制..."
    cp .env.example .env
    echo "✅ .env 文件已创建，请编辑并添加你的 API Keys"
    echo ""
fi

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose -f docker-compose.dev.yml down

echo ""
echo "📦 构建并启动服务..."
echo "这可能需要几分钟时间（首次运行会下载镜像和安装依赖）..."
echo ""

# 启动服务
docker-compose -f docker-compose.dev.yml up --build -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 服务状态："
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "🔧 运行数据库迁移..."
docker-compose -f docker-compose.dev.yml exec -T server npx prisma migrate dev --name init

echo ""
echo "✅ 启动完成！"
echo ""
echo "📍 访问地址："
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3000"
echo "   API 文档: http://localhost:3000/api-docs"
echo "   健康检查: http://localhost:3000/health"
echo ""
echo "📝 查看日志："
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
