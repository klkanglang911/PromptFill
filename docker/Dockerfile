# PromptFill Docker 构建文件
# 多阶段构建：前端构建 + 后端 + Nginx 运行

# ============ 阶段 1：构建前端 ============
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 复制前端依赖文件
COPY package*.json ./

# 安装前端依赖
RUN npm install

# 复制前端源代码
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY .env.production ./

# 构建前端
RUN npm run build

# ============ 阶段 2：准备后端依赖 ============
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# 复制后端依赖文件
COPY server/package*.json ./

# 安装后端生产依赖
# better-sqlite3 需要编译，安装构建工具
RUN apk add --no-cache python3 make g++ && \
    npm install --omit=dev && \
    apk del python3 make g++

# ============ 阶段 3：生产镜像 ============
FROM node:20-alpine AS production

# 安装 nginx 和 supervisor
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# 复制前端构建产物到 nginx 目录
COPY --from=frontend-builder /app/dist /var/www/html

# 复制后端代码
COPY server/src ./server/src
COPY server/seed.js ./server/
COPY server/package.json ./server/

# 复制后端依赖
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# 复制前端数据文件（供 seed 使用）
COPY src/data ./src/data

# 创建数据目录和上传目录，设置权限
RUN mkdir -p /app/server/data /app/server/uploads && \
    chmod -R 755 /app/server/uploads

# 复制 nginx 配置
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# 复制 supervisor 配置
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 复制启动脚本
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/server/data/promptfill.db
ENV UPLOAD_DIR=/app/server/uploads

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/api/version || exit 1

# 启动入口
CMD ["/entrypoint.sh"]
