# React 前端 Dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 client package.json
COPY client/package*.json ./

# 安装依赖
RUN npm install

# 复制 client 源代码
COPY client ./

# 构建生产版本
RUN npm run build

# 使用 nginx 提供静态文件
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
