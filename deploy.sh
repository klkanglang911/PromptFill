#!/bin/bash
# PromptFill 快速部署脚本

set -e

cd "$(dirname "$0")"

echo "📥 拉取最新代码..."
git pull

echo "🔨 构建并启动容器..."
cd docker
docker-compose up --build -d

echo "✅ 部署完成！"
docker-compose ps
