# CAMS 版本管理與發布流程

## 📋 概述

此文件說明 CAMS 專案的版本管理流程、Git 標籤使用規範以及發布部署流程。

## 🔢 版本號規範

### 語義化版本規範 (SemVer)
版本格式：`MAJOR.MINOR.PATCH[-SUFFIX]`

- **MAJOR** (主版本號): 不兼容的 API 修改
- **MINOR** (次版本號): 向下兼容的功能性新增
- **PATCH** (修訂版本號): 向下兼容的問題修正
- **SUFFIX** (後綴): 預發布版本標識 (如: alpha, beta, rc, fix1, fix2)

### 當前版本管理
- 當前版本：`v0.0.12`
- 版本歷史：參考 `git tag -l` 查看所有版本
- 版本顯示：前端頁面右上角顯示當前版本號

## 📦 版本發布流程

### 1. 開發階段
```bash
# 開發新功能或修復 bug
git checkout -b feature/new-feature
# ... 開發工作 ...
git add .
git commit -m "feat: 新增功能描述"
git push origin feature/new-feature
```

### 2. 版本更新步驟

#### 2.1 更新版本號
```bash
# 編輯 package.json 更新版本號
vim package.json  # 修改 "version" 欄位

# 例如：從 "0.0.12" 更新到 "0.0.13"
```

#### 2.2 建構生產版本
```bash
# 本機建構靜態檔案
npm install
npm run build

# 驗證建構結果
ls -la dist/
```

#### 2.3 提交版本更新
```bash
# 提交版本更新
git add package.json dist/
git commit -m "release: 版本 v0.0.13

✨ 新功能:
- 功能1描述
- 功能2描述

🐛 修復:
- 問題1修復
- 問題2修復

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 2.4 創建 Git 標籤
```bash
# 創建帶註解的標籤
git tag -a v0.0.13 -m "版本 v0.0.13 發布

主要更新：
- 新功能說明
- 重要修復說明
- 性能優化等

發布日期：$(date '+%Y-%m-%d')"

# 驗證標籤
git tag -l -n3 v0.0.13
```

#### 2.5 推送至遠程倉庫
```bash
# 推送代碼和標籤
git push origin main
git push origin v0.0.13

# 或一次性推送所有標籤
git push origin main --follow-tags
```

## 🏷️ Git 標籤管理

### 查看標籤
```bash
# 列出所有標籤
git tag -l

# 查看特定標籤詳情
git show v0.0.12

# 列出標籤並顯示註解
git tag -l -n3
```

### 標籤命名規範
- 正式版本：`v0.0.1`, `v0.0.2`, `v1.0.0`
- 修復版本：`v0.0.9-fix1`, `v0.0.11-fix1`
- 預發布版本：`v1.0.0-alpha`, `v1.0.0-beta`, `v1.0.0-rc1`

### 刪除標籤 (如需要)
```bash
# 刪除本地標籤
git tag -d v0.0.12

# 刪除遠程標籤
git push origin :refs/tags/v0.0.12
```

## 🚀 部署流程

### Docker 部署流程

#### 1. 本機準備
```bash
# 確保已建構最新版本
npm run build

# 檢查 Docker 配置
ls -la Dockerfile docker-compose.yml
```

#### 2. 遠程服務器部署
```bash
# 登入遠程服務器
ssh user@your-server

# 進入專案目錄
cd /path/to/cams

# 拉取最新代碼
git pull origin main

# 重建並啟動 Docker 容器
docker-compose down
docker-compose build
docker-compose up -d

# 檢查容器狀態
docker-compose ps
docker-compose logs cams-web
```

#### 3. 驗證部署
```bash
# 檢查應用是否正常運行
curl -I http://localhost:3001

# 檢查版本顯示是否正確
curl -s http://localhost:3001 | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+'
```

## 🔄 回滾流程

### 代碼回滾
```bash
# 查看版本歷史
git log --oneline -10

# 回滾到特定版本
git checkout v0.0.11

# 或建立回滾分支
git checkout -b rollback/v0.0.11 v0.0.11
```

### Docker 容器回滾
```bash
# 停止當前容器
docker-compose down

# 檢出舊版本
git checkout v0.0.11

# 重建容器
docker-compose build
docker-compose up -d
```

## 📝 提交信息規範

### 提交類型
- `feat`: 新功能
- `fix`: 修復問題
- `docs`: 文檔更新
- `style`: 代碼格式調整
- `refactor`: 重構
- `test`: 測試相關
- `chore`: 建構工具、依賴管理
- `release`: 版本發布

### 提交格式範例
```bash
git commit -m "feat: 新增用戶管理功能

- 新增用戶列表頁面
- 新增用戶新增/編輯功能
- 新增用戶權限管理

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 🛠️ 常用命令快速參考

### 版本管理
```bash
# 查看當前版本
grep '"version"' package.json

# 查看所有標籤
git tag -l

# 查看最新標籤
git describe --tags --abbrev=0

# 查看標籤與提交的關係
git log --oneline --graph --all
```

### 建構與部署
```bash
# 完整建構流程
npm install && npm run build

# Docker 部署流程
docker-compose down && docker-compose build && docker-compose up -d

# 查看應用日誌
docker-compose logs -f cams-web
```

## 📊 版本發布檢查清單

發布前請確認：

- [ ] 代碼已合併到 main 分支
- [ ] 所有測試通過
- [ ] package.json 版本號已更新
- [ ] 執行 `npm run build` 成功
- [ ] 檢查 dist/ 目錄包含最新建構檔案
- [ ] VersionDisplay 組件顯示正確版本號
- [ ] 提交信息包含詳細的更新說明
- [ ] 創建對應的 Git 標籤
- [ ] 推送代碼和標籤到遠程倉庫
- [ ] 在遠程服務器成功部署
- [ ] 驗證應用功能正常
- [ ] 記錄發布日誌

## 📞 故障排除

### 常見問題

1. **Docker 建構失敗**
   - 檢查 Dockerfile 語法
   - 確認 dist/ 目錄存在
   - 檢查網絡連接 (台灣服務器使用 npm 鏡像)

2. **版本號不匹配**
   - 確認 package.json 已更新
   - 重新建構 dist/ 檔案
   - 檢查 VersionDisplay 組件

3. **Git 推送失敗**
   - 檢查遠程倉庫權限
   - 確認網絡連接
   - 處理可能的合併衝突

4. **部署後功能異常**
   - 檢查 Docker 容器日誌
   - 驗證靜態檔案是否正確部署
   - 確認環境配置一致性

---

**最後更新**: 2025-08-25
**文檔版本**: v1.0.0