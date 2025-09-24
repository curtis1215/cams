# CAMS Docker 部署指南

## 🚀 快速部署

### 前置需求
- Docker
- Docker Compose

### 一鍵部署

```bash
# 1. 構建並啟動服務
npm run build:prod

# 或者分步執行
npm run build        # 構建靜態檔案
./build-docker.sh    # 構建 Docker 鏡像
./start.sh           # 啟動服務
```

## 📁 項目結構

```
cams/
├── Dockerfile              # Docker 映像檔配置
├── docker-compose.yml      # Docker Compose 配置
├── build-docker.sh         # Docker 構建腳本
├── start.sh                # 啟動腳本
└── dist/                   # 靜態檔案目錄
    ├── index.html
    ├── favicon.ico
    └── assets/
        ├── css/
        └── js/
```

## 🐳 Docker 配置詳情

### Dockerfile
- **基礎映像**: Node.js 18 Alpine (輕量化)
- **HTTP 服務**: 使用 `serve` 包
- **端口**: 3001
- **特點**: 適合與現有 Nginx 反向代理配合使用

### docker-compose.yml
- **服務名**: cams-web
- **容器名**: cams-web
- **端口映射**: 3001:3001
- **重啟策略**: unless-stopped
- **網路**: 自定義橋接網路

## 📋 部署命令參考

### 構建操作
```bash
# 構建靜態檔案
npm run build

# 構建 Docker 鏡像
./build-docker.sh

# 完整構建流程（包含 Docker）
npm run build:prod
```

### 服務管理
```bash
# 啟動服務
./start.sh

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f cams-web

# 停止服務
docker-compose down

# 重啟服務
docker-compose restart
```

## 🌐 訪問地址

- **本地訪問**: http://localhost:3001
- **網路訪問**: http://YOUR_SERVER_IP:3001

## 🔧 Nginx 反向代理配置

如果你的服務器已有 Nginx，可以配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 監控和日誌

### 容器狀態檢查
```bash
# 查看容器狀態
docker ps

# 檢查容器健康狀態
docker inspect cams-web

# 查看資源使用情況
docker stats cams-web
```

### 日誌管理
```bash
# 實時日誌
docker-compose logs -f cams-web

# 最近 100 行日誌
docker-compose logs --tail=100 cams-web

# 按時間範圍查看日誌
docker-compose logs --since="1h" cams-web
```

## 🔒 安全建議

1. **端口安全**: 建議通過 Nginx 反向代理而不是直接暴露 3001 端口
2. **防火牆**: 配置防火牆規則限制直接訪問
3. **HTTPS**: 在 Nginx 層配置 SSL 證書
4. **更新**: 定期更新 Docker 映像和依賴

## 🛠️ 故障排除

### 常見問題

1. **端口被佔用**
   ```bash
   # 查看端口使用情況
   sudo lsof -i :3001

   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "3002:3001"  # 改為其他端口
   ```

2. **容器啟動失敗**
   ```bash
   # 查看詳細錯誤
   docker-compose logs cams-web

   # 檢查 Docker 服務狀態
   sudo systemctl status docker
   ```

3. **靜態檔案未更新**
   ```bash
   # 重新構建並部署
   npm run build
   docker-compose down
   ./build-docker.sh
   ./start.sh
   ```

## 📈 性能優化

1. **資源限制**: 在 docker-compose.yml 中配置記憶體和 CPU 限制
2. **快取配置**: 在 Nginx 中配置靜態資源快取
3. **壓縮**: 啟用 gzip 壓縮

## 🔄 更新部署

```bash
# 拉取最新代碼
git pull

# 重新構建和部署
npm run build
docker-compose down
./build-docker.sh
./start.sh
```

## 📞 支援

如遇問題，請檢查：
1. Docker 服務是否正常運行
2. 端口是否被其他服務佔用
3. 防火牆設置是否正確
4. 靜態檔案是否正確生成