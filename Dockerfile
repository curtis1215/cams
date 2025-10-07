# 使用 Node.js 基礎映像檔
FROM node:18-alpine

# 設置 npm registry 為淘寶鏡像（適合台灣使用）
RUN npm config set registry https://registry.npmmirror.com

# 安裝 http-server 套件用於靜態檔案服務
RUN npm install -g http-server

# 設置工作目錄
WORKDIR /app

# 複製構建的靜態文件
COPY dist/ .

# 暴露端口
EXPOSE 3001

# 啟動靜態檔案服務
CMD ["http-server", ".", "-p", "3001", "-c-1"]