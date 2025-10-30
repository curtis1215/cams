# OpenSpec 提案總結

## 變更 ID
`enhance-asset-alert-config`

## 提案標題
完善資產告警與水位配置系統

## 目錄結構
```
openspec/changes/enhance-asset-alert-config/
├── proposal.md                          # 提案說明文件
├── tasks.md                             # 實作任務清單 (11 大類, 60+ 項任務)
├── SUMMARY.md                           # 本文件
└── specs/                               # 規格變更目錄
    ├── alert-monitoring/
    │   └── spec.md                      # 告警監控 spec delta
    ├── asset-monitoring/
    │   └── spec.md                      # 資產監控 spec delta
    ├── blockchain-management/
    │   └── spec.md                      # 區塊鏈管理 spec delta
    ├── merchant-management/
    │   └── spec.md                      # 商戶管理 spec delta
    └── role-management/
        └── spec.md                      # 角色管理 spec delta
```

## 主要變更摘要

### 1. 告警監控 (alert-monitoring)
- **移除**: 錢包水位告警配置功能
- **新增**: 資產差額告警卡片
- **新增**: 資產差額告警配置彈窗

### 2. 資產監控 (asset-monitoring)
- **新增**: 資產差額欄位 (顯示保留額度和扣減後差額)
- **修改**: 原資產差額重新命名為淨資產差額
- **新增**: 資產差額和淨資產差額欄位排序功能

### 3. 商戶管理 (merchant-management)
- **新增**: 歸集錢包告警水位比例欄位 (%)
- **新增**: 出款錢包告警水位比例欄位 (%)

### 4. 區塊鏈管理 (blockchain-management)
- **新增**: 歸集錢包告警水位比例欄位 (%)
- **新增**: 出款錢包告警水位比例欄位 (%)

### 5. 角色管理 (role-management)
- **修改**: "錢包轉帳限額" → "單日錢包轉帳限額"

## 受影響的檔案預估

### 前端元件 (5 個主要檔案)
- src/views/monitor/Alert.vue
- src/views/monitor/AssetMonitor.vue
- src/views/system/Merchants.vue
- src/views/params/Blockchain.vue
- src/views/system/Roles.vue

### 型別定義 (4+ 個檔案)
- src/types/assetMonitor.ts
- src/types/merchant.ts
- src/types/blockchain.ts
- src/types/role.ts

### Mock 資料 (5+ 個檔案)
- src/mock/monitor/Alert/
- src/mock/monitor/AssetMonitor/
- src/mock/system/Merchant/
- src/mock/params/Blockchain/
- src/mock/system/Roles/

### 多語言翻譯 (10 個檔案)
- src/locales/monitor/Alert/{zh,en}.json
- src/locales/monitor/AssetMonitor/{zh,en}.json
- src/locales/system/Merchant/{zh,en}.json
- src/locales/params/Blockchain/{zh,en}.json
- src/locales/system/Roles/{zh,en}.json

## 重大變更 (Breaking Changes)

1. **錢包水位告警配置遷移**
   - 現有的錢包水位告警配置將從告警監控頁面移除
   - 需要資料遷移至商戶管理和區塊鏈管理

2. **資產監控表格結構變更**
   - 新增資產差額欄位
   - 原資產差額重新命名為淨資產差額
   - 資料結構需要調整以支援新欄位

## 實作優先順序

### Phase 1 - 資料層 (優先)
1. 型別定義更新
2. Mock 資料準備
3. 多語言翻譯

### Phase 2 - UI 層 (核心)
1. 資產監控頁面調整
2. 告警監控頁面變更
3. 商戶管理頁面新增欄位
4. 區塊鏈管理頁面新增欄位
5. 角色管理頁面欄位更名

### Phase 3 - 測試驗證
1. 功能測試
2. 多語言測試
3. 響應式測試
4. 整合測試

## 驗證檢查清單

- [x] proposal.md 已建立並包含完整說明
- [x] tasks.md 已建立並列出所有實作任務
- [x] 5 個 spec delta 檔案已建立
- [x] 所有 spec delta 使用正確的標記 (ADDED/MODIFIED/REMOVED)
- [x] 每個需求都包含至少一個 Scenario
- [x] 多語言翻譯鍵值已定義
- [x] Breaking Changes 已記錄
- [x] Migration Notes 已說明

## 下一步行動

1. 審查此提案確認需求完整性
2. 如有需要,補充或修改 spec delta
3. 開始實作 Phase 1 任務
4. 逐步完成 tasks.md 中的檢查清單

## 備註

- 本提案基於 OpenSpec 規範建立
- 所有 spec delta 遵循 Gherkin 格式撰寫 Scenario
- 建議使用 `openspec validate enhance-asset-alert-config --strict` 進行最終驗證
