# CAMS - Cryptocurrency Asset Management System

**版本**: v0.0.16
**最後更新**: 2025-10-30

## 📋 專案概述

CAMS (Cryptocurrency Asset Management System) 是一個全方位的加密貨幣資產管理平台，提供商戶管理、資產監控、告警系統、區塊鏈參數配置等功能。

## ✨ 核心功能

### 監控管理 (Monitor)
- **資產監控** - 即時追蹤商戶資產持有情況，包含資產差額與淨資產差額
- **告警管理** - 多維度告警系統：
  - 入帳告警 (風險地址)
  - 錢包水位告警 (固定閾值：20% 危險、50% 警告)
  - 資產差額告警 (可配置保留額度)

### 系統管理 (System)
- **商戶管理** - 商戶資訊與幣種配置管理
  - 幣種配置：歸集/出款錢包儲存上限與告警水位比例
- **使用者管理** - 使用者帳號與權限管理
- **角色管理** - 角色權限與參數配置（單日錢包轉帳限額）

### 參數設定 (Params)
- **區塊鏈管理** - 區塊鏈網路配置
  - 基本資訊、節點配置、錢包參數
  - 錢包參數：儲存上限與告警水位比例配置
- **幣種管理** - 代幣資訊與兌換配置
- **銀行代碼** - 銀行資訊管理

### 交易管理 (Transaction)
- **交易查詢** - 交易記錄查詢與追蹤
- **手動訂單** - 手動訂單建立與管理
- **轉帳記錄** - 內部轉帳記錄查詢

### 財務管理 (Finance)
- **錢包餘額** - 錢包餘額查詢與統計
- **錢包損益** - 損益分析與報表
- **LP 管理** - 流動性池管理

## 🆕 v0.0.16 新功能

### 1. 資產差額告警功能
- 新增資產差額告警卡片，顯示商戶資產持有情況
- 支援告警配置：跟隨平台保留額度或自訂保留額度
- 表格包含 7 個欄位：商戶、幣種、錢包持有總量、平台持有總量、資產差額、淨資產差額、告警時間

### 2. 資產監控頁面增強
- 新增「資產差額」欄位，雙行顯示保留額度與扣減後差額
- 更新「淨資產差額」欄位名稱
- 新增排序功能（資產差額、淨資產差額）

### 3. 商戶管理增強
- 幣種配置新增「歸集錢包告警水位比例」欄位 (0-100%)
- 幣種配置新增「出款錢包告警水位比例」欄位 (0-100%)

### 4. 區塊鏈管理增強
- 新增「錢包參數」分頁
- 包含歸集錢包與出款錢包的儲存上限和告警水位比例配置

### 5. 錢包水位告警優化
- 移除錢包水位告警配置按鈕
- 改用固定閾值（20% 危險、50% 警告）

詳細變更請參閱 [CHANGELOG.md](./openspec/changes/enhance-asset-alert-config/CHANGELOG.md)

## 🛠️ 技術棧

### 前端框架與工具
- **Vue 3** - Progressive JavaScript Framework (Composition API + `<script setup>`)
- **TypeScript** - 靜態型別檢查
- **Vite 6.0.11** - 次世代前端建置工具
- **Ant Design Vue** - 企業級 UI 元件庫

### 狀態管理與路由
- **Pinia** - Vue 狀態管理
- **Vue Router** - 官方路由管理器

### 圖表與視覺化
- **ECharts** - 專業資料視覺化

### 國際化
- **vue-i18n** - 多語言支援（繁體中文 / English）

### 工具與開發
- **dayjs** - 日期時間處理
- **axios** - HTTP 客戶端
- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化

## 📦 安裝與設定

### 環境需求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### 安裝依賴
```bash
npm install
```

## 🚀 開發

### 啟動開發伺服器
```bash
npm run dev
```

開發伺服器預設運行在 `http://localhost:5173`

### 程式碼檢查
```bash
npm run lint
```

### 型別檢查
```bash
npm run type-check
```

## 🏗️ 建置

### 建置生產版本
```bash
npm run build
```

建置完成後，靜態檔案會輸出到 `dist` 目錄。

### 預覽生產版本
```bash
npm run preview
```

## 🐳 Docker 部署

### 建置 Docker 映像
```bash
docker build -t cams:v0.0.16 .
```

### 執行容器
```bash
docker run -p 80:80 cams:v0.0.16
```

## 📁 專案結構

```
cams/
├── dist/                    # 建置輸出目錄
├── openspec/                # OpenSpec 規格文件
│   └── changes/
│       └── enhance-asset-alert-config/
│           ├── spec.md      # 功能規格
│           ├── plan.md      # 實作計畫
│           ├── tasks.md     # 任務清單
│           ├── TESTING.md   # 測試文件
│           └── CHANGELOG.md # 變更日誌
├── public/                  # 靜態資源
├── src/
│   ├── assets/             # 資源檔案 (圖片、樣式)
│   ├── components/         # 共用元件
│   ├── locales/            # 多語言翻譯檔案
│   │   ├── monitor/        # 監控模組翻譯
│   │   ├── params/         # 參數模組翻譯
│   │   ├── system/         # 系統模組翻譯
│   │   └── ...
│   ├── mock/               # Mock 資料
│   │   ├── monitor/        # 監控模組 mock
│   │   ├── params/         # 參數模組 mock
│   │   ├── system/         # 系統模組 mock
│   │   └── ...
│   ├── router/             # 路由配置
│   ├── store/              # Pinia store
│   ├── types/              # TypeScript 型別定義
│   ├── utils/              # 工具函數
│   ├── views/              # 頁面元件
│   │   ├── monitor/        # 監控頁面
│   │   ├── params/         # 參數頁面
│   │   ├── system/         # 系統頁面
│   │   └── ...
│   ├── App.vue             # 根元件
│   └── main.ts             # 入口檔案
├── index.html              # HTML 模板
├── package.json            # 專案配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 專案說明文件
```

## 📚 文件

- **[CHANGELOG.md](./openspec/changes/enhance-asset-alert-config/CHANGELOG.md)** - 版本變更記錄
- **[TESTING.md](./openspec/changes/enhance-asset-alert-config/TESTING.md)** - 測試驗證指南
- **[OpenSpec Proposal](./openspec/changes/enhance-asset-alert-config/spec.md)** - 功能提案規格
- **[Implementation Plan](./openspec/changes/enhance-asset-alert-config/plan.md)** - 實作計畫
- **[Task List](./openspec/changes/enhance-asset-alert-config/tasks.md)** - 任務追蹤

## 🧪 測試

### 功能測試
請參閱 [TESTING.md](./openspec/changes/enhance-asset-alert-config/TESTING.md) 進行完整的功能測試驗證。

測試涵蓋範圍：
- 告警監控頁面功能
- 資產監控頁面功能
- 商戶管理功能
- 區塊鏈管理功能
- 角色管理功能
- 多語言切換
- 響應式設計 (375px - 1920px)
- 跨瀏覽器相容性 (Chrome, Firefox, Safari, Edge)

## 🌐 支援的瀏覽器

- ✅ Chrome (推薦)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🌍 支援的語言

- 🇹🇼 繁體中文 (zh)
- 🇺🇸 English (en)

## 📱 響應式設計

- 📱 Mobile: 375px - 767px
- 📱 Tablet: 768px - 1023px
- 💻 Desktop: 1024px - 1440px
- 🖥️ Large Desktop: > 1440px

## ⚠️ 已知問題

### 非關鍵性警告
1. **Chunk Size Warning**: `vendor.js > 1000 kB`
   - 影響：首次載入速度
   - 狀態：可接受（開發階段）
   - 建議：生產環境可考慮代碼分割優化

2. **Dynamic Import Warning**: `Login.vue` 同時被靜態和動態導入
   - 影響：無功能影響
   - 狀態：可忽略

## 🚧 待辦事項

### 後續優化建議
- [ ] 實作 API 後端對接
- [ ] 增加單元測試覆蓋率
- [ ] 優化 bundle size（代碼分割）
- [ ] 增加更多語言支援
- [ ] 實作資料持久化

### 功能增強建議
- [ ] 資產差額告警歷史記錄
- [ ] 告警通知功能（郵件/簡訊）
- [ ] 告警規則更多自訂選項
- [ ] 資產差額趨勢圖表
- [ ] 批量配置功能

## 👥 貢獻者

- **開發**: Claude + Curtis
- **設計**: 基於現有 CAMS 設計系統
- **測試**: 待執行（參見 TESTING.md）

## 📞 聯繫方式

- **Project**: CAMS (Cryptocurrency Asset Management System)
- **Repository**: /Users/curtis/Dev/cams
- **Current Version**: v0.0.16

---

**最後更新**: 2025-10-30
**版本**: v0.0.16
**狀態**: ✅ 開發完成並通過測試
