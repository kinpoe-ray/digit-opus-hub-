# Node.js 后端 Dockerfile
FROM node:20-alpine

# 安装必要的工具
RUN apk add --no-cache openssl openssl-dev

# 设置工作目录
WORKDIR /app

# 复制 prisma schema
COPY prisma ./prisma/

# 复制 server package.json 和 package-lock.json
COPY server/package*.json ./

# 安装依赖（包括 Prisma）
RUN npm install

# 生成 Prisma Client
RUN npx prisma generate

# 复制 server 源代码
COPY server ./

# 构建 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# 启动命令
CMD ["npm", "start"]
