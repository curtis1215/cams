# 新增資產監控功能

## Why
目前系統缺乏統一的資產監控介面，財務和運營人員無法即時了解各幣種在不同鏈路上的資產分佈情況、平台用戶與項目方的資產持有量對比，以及潛在的資產異常變動。

**重要說明**：此專案為前端 demo 展示用途，無後端 API 支援，所有功能將使用 mock 資料進行展示。

## What Changes
- 新增資產監控頁面 `/monitor/asset-monitor`，顯示各幣種在不同鏈路上的資產狀況
- 實作多鏈路資產數據展示，包含持有資產數量、用戶持有量、項目方持有量、資產差額
- 新增近一小時變化百分比追蹤功能
- 提供鏈路篩選和幣種搜尋功能
- 支援繁體中文和英文介面切換
- **創建 mock 資料**用於前端 demo 展示（無後端 API 整合）
- 準備完整的示範資料集，涵蓋多種幣種和鏈路組合

## Impact
- **新增規範 (Affected specs)**:
  - `asset-monitoring` - 新增資產監控功能規範
- **新增檔案 (Affected code)**:
  - `src/views/monitor/AssetMonitor.vue` - 資產監控頁面組件
  - `src/types/assetMonitor.ts` - TypeScript 類型定義
  - `src/mock/monitor/AssetMonitor/assetMonitor.mock.json` - **Mock 資料（用於前端 demo 展示）**
  - `src/locales/monitor/AssetMonitor/zh.json` - 繁體中文翻譯
  - `src/locales/monitor/AssetMonitor/en.json` - 英文翻譯
- **修改檔案**:
  - `src/router/index.ts` - 新增路由配置
  - `src/layouts/MainLayout.vue` - 更新導航選單
  - `src/locales/zh.json` - 新增導航文字
  - `src/locales/en.json` - 新增導航文字
- **使用者影響**:
  - 系統管理員、財務人員、運營人員可使用新的資產監控功能進行 demo 展示
  - 無破壞性變更，不影響現有功能
  - **此為純前端展示功能，無實際後端資料連接**

## 實作階段
1. **階段 1：基礎功能** (預計 1-2 天)
   - 創建頁面組件和基礎表格
   - 實作多語言支援
   - 配置路由和導航

2. **階段 2：數據展示** (預計 1 天)
   - 實作按鏈路分組顯示
   - 實作變化趨勢展示
   - 添加資料刷新功能

3. **階段 3：優化與測試** (預計 1 天)
   - 添加篩選和搜尋功能
   - 實作異常資產高亮
   - 完成測試和文檔

## 預估總時間
約 14.5 小時（約 2 個工作日）

詳細任務清單請參考 `tasks.md` 文件。
