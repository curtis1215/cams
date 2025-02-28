# CAMS 部署指南

## 部署步驟

1. 將 `deploy` 目錄上傳到伺服器
2. 在伺服器上創建目標目錄：`mkdir -p /var/www/html/cams`
3. 執行部署腳本：`cd deploy && ./deploy.sh`

## 系統需求

- 支持靜態文件的 Web 伺服器（如 Nginx、Apache）
- 正確配置的 CORS 和路由重寫規則

## Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html/cams;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 部署後驗證

訪問網站並確認以下功能正常運作：

1. 頁面加載和路由導航
2. 國際化功能
3. 所有模塊的基本功能

