# 使用 Node.js 基礎映像檔
FROM node:18-alpine

# 安裝 serve 套件用於靜態檔案服務
RUN npm install -g serve

# 設置工作目錄
WORKDIR /app

# 複製構建的靜態文件
COPY dist/ .

# 暴露端口
EXPOSE 3000

# 啟動靜態檔案服務
CMD ["serve", "-s", ".", "-l", "3000"]