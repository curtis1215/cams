#!/bin/bash

set -e

echo "🐳 構建 CAMS Docker 鏡像..."

# 檢查是否存在 dist 目錄
if [ ! -d "dist" ]; then
    echo "❌ 錯誤：找不到 dist 目錄"
    echo "💡 請先執行：npm run build"
    exit 1
fi

echo "📁 檢查靜態檔案..."
echo "   - dist 目錄大小：$(du -sh dist | cut -f1)"
echo "   - dist 檔案數量：$(find dist -type f | wc -l | xargs)"

# 構建 Docker 鏡像
echo "🔨 構建 Docker 鏡像..."
docker build -t cams-web:latest .

echo "✅ Docker 鏡像構建完成"

# 顯示鏡像信息
echo "📋 鏡像信息："
docker images cams-web:latest

echo "🎉 構建完成！"
echo "💡 運行應用: docker-compose up -d"
echo "💡 訪問地址: http://localhost:3001"