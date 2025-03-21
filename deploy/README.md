# CAMS 部署指南

## 部署步驟

1. 將 `deploy` 目錄上傳到伺服器
2. 在伺服器上創建目標目錄：`mkdir -p /var/www/html/cams`
3. 執行部署腳本：`cd deploy && ./deploy.sh`

## 系統需求

- 支持靜態文件的 Web 伺服器（如 Nginx、Apache）
- 正確配置的 CORS 和路由重寫規則

## 解決 404 錯誤問題

當直接訪問指定頁面（如 `https://cams.sitruc.co/monitor/dashboard`）時出現 404 錯誤，這是因為：

1. 這是一個單頁應用程式 (SPA)，所有路由都由前端的 Vue Router 處理
2. 當直接訪問非根路徑的 URL 時，伺服器會嘗試查找對應的物理文件，但這些路徑實際上不存在於伺服器上
3. 需要配置伺服器將所有請求重定向到 `index.html`，讓前端路由處理這些請求

## Nginx 配置示例

```nginx
server {
    listen 80;
    server_name cams.sitruc.co;

    root /var/www/html/cams;
    index index.html;

    # 重要：確保所有路由都重定向到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 靜態資源緩存設置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 安全相關設置
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options SAMEORIGIN;
}
```

## Apache 配置示例

如果使用 Apache 伺服器，請在網站根目錄創建 `.htaccess` 文件，內容如下：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 部署後驗證

訪問網站並確認以下功能正常運作：

1. 頁面加載和路由導航
2. 直接訪問子路由（如 `/monitor/dashboard`）是否正常工作
3. 國際化功能
4. 所有模塊的基本功能

## 故障排除

如果仍然遇到 404 錯誤：

1. 檢查伺服器配置是否正確應用
2. 確認 `try_files` 指令在 Nginx 中正確配置
3. 檢查伺服器日誌以獲取更多信息
4. 確保應用的 `base` 路徑配置與部署環境一致

