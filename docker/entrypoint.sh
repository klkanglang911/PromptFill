#!/bin/sh
set -e

echo "🚀 Starting PromptFill..."

# 检查数据库是否存在，不存在则初始化
if [ ! -f /app/server/data/promptfill.db ]; then
    echo "📦 Initializing database..."
    cd /app/server && node seed.js
    echo "✅ Database initialized"
else
    echo "📂 Using existing database"
fi

echo "🎯 Starting services..."

# 启动 supervisor（管理 nginx 和 node）
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
