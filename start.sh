#!/bin/bash

set -e

echo "🚀 啟動 CAMS 應用..."

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查鏡像是否存在
if ! docker images cams-web:latest --format "table {{.Repository}}" | grep -q cams-web; then
    echo "🔨 鏡像不存在，開始構建..."
    ./build-docker.sh
fi

# 停止舊容器（如果存在）
echo "🛑 停止舊容器..."
docker-compose down

# 啟動服務
echo "🐳 啟動容器..."
docker-compose up -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 5

# 檢查容器狀態
echo "📊 容器狀態："
docker-compose ps

# 顯示日誌
echo "📋 最近的日誌："
docker-compose logs --tail=20 cams-web

echo "🎉 啟動完成！"
echo "🌐 訪問地址: http://localhost:3000"
echo "📊 查看日誌: docker-compose logs -f cams-web"
echo "🛑 停止服務: docker-compose down"