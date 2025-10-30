# 實作狀態報告 - enhance-asset-alert-config

## 總體進度
**狀態**: 🟡 Phase 1 完成 (資料層與翻譯完成)
**完成度**: ~50% (Phase 1 完成,Phase 2 UI層待實作)

---

## ✅ 已完成項目

### 1. 型別定義更新 (100%)
- [x] **AssetMonitorData** - 新增資產差額相關欄位
  - 新增 `reserveAmount` (保留額度)
  - 新增 `assetDifference` (扣減保留額度後差額)
  - 新增 `netAssetDifference` (淨資產差額)
  - 保留向後相容的 `difference` 欄位
  - 位置: `src/types/assetMonitor.ts:15-51`

- [x] **AssetDifferenceAlert** - 資產差額告警型別
  - 定義告警資料結構(商戶、幣種、持有量、差額等)
  - 位置: `src/types/assetMonitor.ts:70-94`

- [x] **AssetDifferenceConfig** - 資產差額告警配置型別
  - 支援兩種配置模式: `platform` | `custom`
  - 位置: `src/types/assetMonitor.ts:99-108`

- [x] **BlockchainFormData** - 區塊鏈表單資料
  - 新增 `collectionWalletAlertThreshold` (歸集錢包告警水位比例)
  - 新增 `withdrawWalletAlertThreshold` (出款錢包告警水位比例)
  - 位置: `src/types/blockchain.ts:26-42`

### 2. 多語言翻譯 (100%)
- [x] **角色管理 - 中文** (`src/locales/system/Roles/zh.json`)
  - 更新 `generalTransferLimit`: "錢包轉帳限額" → "單日錢包轉帳限額"
  - 新增 `dailyWalletTransferLimit`: "單日錢包轉帳限額"
  - 更新相關提示文字

- [x] **角色管理 - 英文** (`src/locales/system/Roles/en.json`)
  - 更新 `generalTransferLimit`: "Wallet Transfer Limit" → "Daily Wallet Transfer Limit"
  - 新增 `dailyWalletTransferLimit`: "Daily Wallet Transfer Limit"
  - 更新相關提示文字

- [x] **告警監控 - 中文** (`src/locales/monitor/Alert/zh.json`)
  - 新增卡片翻譯: `card.assetDifference`: "資產差額告警"
  - 新增彈窗翻譯: 配置類型、保留額度相關欄位
  - 新增欄位翻譯: 錢包持有總量、平台持有總量、資產差額、淨資產差額等

- [x] **告警監控 - 英文** (`src/locales/monitor/Alert/en.json`)
  - 新增卡片翻譯: `card.assetDifference`: "Asset Difference Alert"
  - 新增彈窗翻譯: 配置類型、保留額度相關欄位
  - 新增欄位翻譯: 錢包持有總量、平台持有總量、資產差額、淨資產差額等

- [x] **資產監控 - 中文** (`src/locales/monitor/AssetMonitor/zh.json`)
  - 新增欄位翻譯: `field.assetDifference`, `field.netAssetDifference`, `field.reserveAmount`, `field.differenceAmount`

- [x] **資產監控 - 英文** (`src/locales/monitor/AssetMonitor/en.json`)
  - 新增欄位翻譯: `field.assetDifference`, `field.netAssetDifference`, `field.reserveAmount`, `field.differenceAmount`

- [x] **商戶管理 - 中文** (`src/locales/system/Merchant/zh.json`)
  - 新增欄位翻譯: `field.collectionWalletAlertThreshold`, `field.withdrawWalletAlertThreshold`
  - 新增提示翻譯: `prompt.inputCollectionWalletAlertThreshold`, `prompt.inputWithdrawWalletAlertThreshold`

- [x] **商戶管理 - 英文** (`src/locales/system/Merchant/en.json`)
  - 新增欄位翻譯: `field.collectionWalletAlertThreshold`, `field.withdrawWalletAlertThreshold`
  - 新增提示翻譯: `prompt.inputCollectionWalletAlertThreshold`, `prompt.inputWithdrawWalletAlertThreshold`

- [x] **區塊鏈管理 - 中文** (`src/locales/params/Blockchain/zh.json`)
  - 新增分頁翻譯: `tabs.walletParameters`: "錢包參數"
  - 新增欄位翻譯: `field.collectionWalletStorageLimit`, `field.withdrawWalletStorageLimit`, `field.collectionWalletAlertThreshold`, `field.withdrawWalletAlertThreshold`
  - 新增提示翻譯: 對應的輸入提示文字

- [x] **區塊鏈管理 - 英文** (`src/locales/params/Blockchain/en.json`)
  - 新增分頁翻譯: `tabs.walletParameters`: "Wallet Parameters"
  - 新增欄位翻譯: `field.collectionWalletStorageLimit`, `field.withdrawWalletStorageLimit`, `field.collectionWalletAlertThreshold`, `field.withdrawWalletAlertThreshold`
  - 新增提示翻譯: 對應的輸入提示文字

### 3. Mock 資料 (60%)
- [x] **資產差額告警 Mock 資料** (`src/mock/monitor/Alert/assetDifferenceAlert.mock.json`)
  - 建立 6 筆示例資料
  - 包含商戶、幣種、錢包持有量、平台持有量、資產差額、淨資產差額等欄位

- [x] **資產差額配置 Mock 資料** (`src/mock/monitor/Alert/assetDifferenceConfig.mock.json`)
  - 建立 8 筆配置資料
  - 包含 platform 和 custom 兩種配置類型
  - 自訂配置包含保留額度數值

- [x] **資產監控 Mock 資料更新** (`src/mock/monitor/AssetMonitor/assetMonitor.mock.json`)
  - 為所有 17 筆記錄新增 `reserveAmount`, `assetDifference`, `netAssetDifference` 欄位
  - 保留向後相容的 `difference` 欄位
  - 資料涵蓋正數、負數、零值等多種情境

- [ ] **商戶管理 Mock 資料更新** (待實作)
  - 需要在幣種配置中新增 `collectionWalletAlertThreshold` 和 `withdrawWalletAlertThreshold`

- [ ] **區塊鏈管理 Mock 資料更新** (待實作)
  - 需要在錢包參數中新增 `collectionWalletAlertThreshold` 和 `withdrawWalletAlertThreshold`

### 4. 構建驗證
- [x] 專案構建成功 (`npm run build`)
- [x] 無 TypeScript 編譯錯誤
- [x] 型別定義正確且完整
- [x] JSON 格式正確無誤

---

## ⏳ 待完成項目

### 高優先級 (必須完成)

#### 1. 剩餘 Mock 資料更新
- [ ] 更新 `src/mock/system/Merchant/` 商戶管理 mock 資料
  - 在幣種配置中新增 `collectionWalletAlertThreshold` 和 `withdrawWalletAlertThreshold`

- [ ] 更新 `src/mock/params/Blockchain/` 區塊鏈管理 mock 資料
  - 在錢包參數中新增 `collectionWalletAlertThreshold` 和 `withdrawWalletAlertThreshold`

#### 2. UI 元件實作

**資產監控頁面** (`src/views/monitor/AssetMonitor.vue`)
- [ ] 修改表格欄位定義,新增資產差額和淨資產差額欄位
- [ ] 實作資產差額欄位的雙行顯示(保留額度 + 差額)
- [ ] 實作負數紅色顯示邏輯
- [ ] 新增排序功能

**告警監控頁面** (`src/views/monitor/Alert.vue`)
- [ ] 移除錢包水位告警配置功能
- [ ] 新增資產差額告警卡片
- [ ] 新增資產差額告警配置彈窗

**商戶管理頁面** (`src/views/system/Merchants.vue`)
- [ ] 在幣種配置中新增告警水位比例輸入框(歸集錢包 + 出款錢包)
- [ ] 實作表單驗證(0-100%)

**區塊鏈管理頁面** (`src/views/params/Blockchain.vue`)
- [ ] 在錢包參數分頁新增告警水位比例輸入框
- [ ] 實作表單驗證(0-100%)

---

## 📊 實作統計

### 按分類統計
- ✅ **型別定義**: 4/4 (100%)
- ✅ **翻譯檔案**: 10/10 (100%)
- 🟡 **Mock 資料**: 3/5 (60%)
- ⭕ **UI 元件**: 0/5 (0%)
- ⭕ **功能測試**: 0/10 (0%)

### 按 Phase 統計
- ✅ **Phase 1 - 資料層**: 完成 (型別、翻譯、主要Mock完成)
- ⭕ **Phase 2 - UI 層**: 未開始
- ⭕ **Phase 3 - 測試驗證**: 未開始

---

## 🎯 建議下一步行動

### 立即可執行 (不依賴其他工作)
1. ✅ 完成所有翻譯檔案更新 (已完成)
2. ✅ 建立主要 Mock 資料檔案 (已完成)
3. 完成剩餘 Mock 資料 (商戶管理、區塊鏈管理)
4. 角色管理頁面實際套用翻譯 key (目前僅更新翻譯檔案)

### 需要依序執行 (Phase 2 - UI 實作)
1. 先完成剩餘 Mock 資料更新
2. 實作資產監控頁面欄位調整
3. 實作商戶管理和區塊鏈管理新增欄位
4. 最後實作告警監控頁面變更

---

## ⚠️ 重要提醒

### Breaking Changes 尚未處理
1. **錢包水位告警配置移除**
   - 需要先規劃資料遷移策略
   - 確認是否需要保留現有配置資料

2. **資產監控資料結構變更**
   - 現有使用 `difference` 欄位的程式碼需要更新為 `netAssetDifference`
   - 建議先保留 `difference` 欄位向後相容

### 技術債務
- ✅ Mock 資料需要與型別定義保持一致 (主要Mock已更新)
- ✅ 所有新增欄位需要完整的多語言支援 (已完成)
- 建議建立單元測試驗證型別正確性 (待實作)

---

## 📝 備註

**Phase 1 完成總結**
本次實作完成了專案的 Phase 1 - 資料層與翻譯層:
- ✅ 型別定義完整 (4/4, 100%)
- ✅ 多語言翻譯完整 (10/10, 100%)
- ✅ 主要 Mock 資料完成 (3/5, 60%)
- ✅ 構建驗證通過

**Phase 1 實作重點**
- **型別系統**: 新增 3 個新型別,更新 2 個現有型別,完整支援新功能需求
- **多語言支援**: 覆蓋 5 個模組的中英文翻譯,包含欄位、提示、驗證訊息等
- **Mock 資料**: 建立資產差額告警、配置資料,更新資產監控所有 17 筆記錄
- **向後相容**: 保留 `difference` 欄位確保現有程式碼可正常運作

**如何繼續?**
1. 完成剩餘 Mock 資料 (商戶管理、區塊鏈管理)
2. 進入 Phase 2 - UI 元件實作 (共 5 個頁面需要修改)
3. 進入 Phase 3 - 功能測試與驗證 (10 項測試任務)

**已就緒的部分**
- ✅ 型別系統完整且型別安全
- ✅ 構建通過無錯誤
- ✅ 向後相容性已考量
- ✅ 完整多語言支援已就緒
- ✅ Mock 資料架構已建立
- ✅ 資料層基礎紮實完善
