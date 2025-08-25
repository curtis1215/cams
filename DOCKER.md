# CAMS Docker 部署指南

本項目使用 Docker 進行容器化部署，提供純靜態網頁服務（不依賴 nginx）。

## 快速開始

### 方法 1：本機建構 + 遠程部署（推薦）

```bash
# 1. 本機建構靜態檔案
npm run build

# 2. 建構並啟動 Docker
npm run build:prod
npm run docker:start
```

### 方法 2：手動步驟

```bash
# 1. 本機建構靜態檔案
npm install
npm run build

# 2. 建構 Docker 鏡像
npm run docker:build

# 3. 啟動服務
docker-compose up -d
```

## 可用腳本

```bash
# 構建 Docker 鏡像
npm run docker:build

# 啟動服務
npm run docker:start

# 停止服務
npm run docker:stop

# 查看日誌
npm run docker:logs
```

## 訪問應用

啟動後，可通過以下地址訪問：

- **主頁**: http://localhost:3001

## 項目結構

```
/
├── Dockerfile              # Docker 鏡像構建文件
├── docker-compose.yml      # Docker Compose 配置
├── nginx.conf              # Nginx 配置文件
├── .dockerignore           # Docker 忽略文件
├── build-docker.sh         # 構建腳本
├── start.sh               # 啟動腳本
└── dist/                   # 構建輸出目錄
```

## 技術細節

### 架構
- **基礎鏡像**: node:18-alpine
- **Web 服務器**: serve (Node.js 靜態檔案服務)
- **端口映射**: 3001:3001
- **靜態文件**: Vue.js SPA

### 功能特性
- ✅ SPA 路由支持
- ✅ 輕量化部署（無需 nginx）
- ✅ 本機建構，遠程部署
- ✅ 簡化的容器架構

### 配置文件說明

#### Dockerfile
- 基於 node:18-alpine 鏡像
- 安裝 serve 套件
- 複製預先建構的靜態檔案
- 使用 serve 提供 SPA 服務

#### docker-compose.yml
- 服務定義和網絡配置
- 端口映射 3001:3001
- 重啟策略設置

## 故障排除

### 常見問題

1. **端口被占用**
   ```bash
   # 檢查端口使用情況
   lsof -i :3001
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "8080:80"  # 改為其他端口
   ```

2. **構建失敗**
   ```bash
   # 清理 Docker 資源
   docker system prune -f
   
   # 重新構建
   npm run docker:build
   ```

3. **容器無法啟動**
   ```bash
   # 查看詳細日誌
   docker-compose logs cams-web
   
   # 檢查容器狀態
   docker-compose ps
   ```

### 開發建議

- 生產部署時建議使用環境變量管理配置
- 可以通過修改 nginx.conf 添加 API 代理
- 建議配置 SSL 證書用於 HTTPS
- 可以集成 CI/CD 自動化部署流程

## 更新部署

```bash
# 拉取最新代碼
git pull

# 重新構建並部署
npm run docker:build
npm run docker:start
```