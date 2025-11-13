# 測試驗證報告

## 功能概述
本次實作新增了資產差額告警功能，並在多個頁面中新增了告警水位比例配置。

## 版本資訊
- **Feature**: enhance-asset-alert-config
- **Version**: v0.0.16
- **Build**: 2025-01-XX (最新建置時間: 27.79s)
- **Status**: ✅ 建置成功

---

## 測試環境要求

### 瀏覽器支援
- ✅ Chrome (推薦)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### 螢幕尺寸測試
- 📱 Mobile: 375px - 767px
- 📱 Tablet: 768px - 1023px
- 💻 Desktop: 1024px - 1440px
- 🖥️ Large Desktop: > 1440px

### 語言測試
- 🇹🇼 繁體中文 (zh)
- 🇺🇸 英文 (en)

---

## Section 10.1: 告警監控頁面 - 錢包水位配置功能移除

### 測試目標
驗證錢包水位告警卡片中的「告警配置」按鈕已被移除。

### 測試步驟
1. 啟動開發伺服器: `npm run dev`
2. 瀏覽器訪問: `http://localhost:5173`
3. 登入系統 (如需要)
4. 導航到: **監控管理 → 告警監控**
5. 找到「錢包水位告警」卡片

### 預期結果
- ✅ 錢包水位告警卡片標題右側「無」設置按鈕
- ✅ 錢包水位告警表格正常顯示
- ✅ 剩餘水位顏色正確顯示（≤20% 紅色、≤50% 橙色、>50% 綠色）

### 驗證檔案
- `src/views/monitor/Alert.vue` (Line 173-179: 按鈕已移除)
- `src/views/monitor/Alert.vue` (Line 1141-1147: 使用固定閾值)

---

## Section 10.2: 告警監控頁面 - 資產差額告警卡片

### 測試目標
驗證資產差額告警卡片正常顯示，包含所有必要欄位。

### 測試步驟
1. 在告警監控頁面向下滾動
2. 找到「資產差額告警」卡片（位於錢包水位告警之後）

### 預期結果
- ✅ 卡片標題顯示「資產差額告警」
- ✅ 卡片右上角有「告警設置」按鈕
- ✅ 表格包含以下欄位：
  - 商戶
  - 幣種
  - 錢包持有總量
  - 平台持有總量
  - 資產差額
  - 淨資產差額
  - 告警時間
- ✅ Mock 資料正常顯示（6筆記錄）
- ✅ 表格可以水平滾動（scroll x: 1400px）
- ✅ 分頁功能正常（每頁5筆）

### 驗證檔案
- `src/views/monitor/Alert.vue` (Line 200-222: 卡片定義)
- `src/views/monitor/Alert.vue` (Line 992-1037: 欄位定義)
- `src/mock/monitor/Alert/assetDifferenceAlert.mock.json`

---

## Section 10.3: 告警監控頁面 - 資產差額告警配置

### 測試目標
驗證資產差額告警配置彈窗功能完整性。

### 測試步驟
1. 點擊資產差額告警卡片右上角的「告警設置」按鈕
2. 檢查配置彈窗是否正常彈出

### 預期結果

#### 彈窗基本功能
- ✅ 彈窗標題顯示「資產差額告警配置」
- ✅ 彈窗寬度為 800px
- ✅ 彈窗內有「確認」和「取消」按鈕

#### 配置表格
- ✅ 表格包含以下欄位：
  - 幣種
  - 配置類型
  - 保留額度
- ✅ Mock 資料正常載入（多種幣種配置）
- ✅ 表格可垂直滾動（scroll y: 400px）

#### 配置選項
- ✅ 每個幣種有兩個單選按鈕：
  - 跟隨平台保留額度
  - 自訂保留額度
- ✅ 選擇「跟隨平台」時，輸入框為禁用狀態
- ✅ 選擇「自訂」時，輸入框為啟用狀態

#### 輸入驗證
- ✅ 自訂保留額度輸入框：
  - 最小值：0
  - 精確度：2位小數
  - Placeholder: 「請輸入保留額度」
- ✅ 當選擇「自訂」但未輸入數值時，點擊確認顯示錯誤訊息
- ✅ 輸入有效數值後，點擊確認顯示成功訊息

### 驗證檔案
- `src/views/monitor/Alert.vue` (Line 596-629: 彈窗定義)
- `src/views/monitor/Alert.vue` (Line 1404-1432: 狀態和處理函數)
- `src/mock/monitor/Alert/assetDifferenceConfig.mock.json`

---

## Section 10.4: 資產監控頁面 - 新增欄位顯示

### 測試目標
驗證資產監控頁面新增的「資產差額」欄位顯示正確。

### 測試步驟
1. 導航到: **監控管理 → 資產監控**
2. 檢查表格欄位順序

### 預期結果

#### 欄位順序
1. 幣種
2. 鏈路持有量
3. 平台用戶持有量
4. 平台項目方持有量
5. **資產差額** ⭐ (新增)
6. **淨資產差額** ⭐ (名稱變更)
7. 走勢
8. 更新時間

#### 資產差額欄位格式
- ✅ 第一行顯示：「保留額度: [數值]」（灰色字體）
- ✅ 第二行顯示：「扣減後差額: [數值]」
  - 正數：綠色字體
  - 負數：紅色字體 + 驚嘆號圖示
  - 零：灰色字體

#### 淨資產差額欄位格式
- ✅ 第一行顯示數值
- ✅ 第二行顯示 USDT 等值（小字體）
- ✅ 顏色規則：
  - 正數：綠色
  - 負數：紅色 + 驚嘆號圖示
  - 零：灰色

### 驗證檔案
- `src/views/monitor/AssetMonitor.vue` (Line 76-94: 資產差額欄位渲染)
- `src/views/monitor/AssetMonitor.vue` (Line 204-218: 欄位定義)
- `src/views/monitor/AssetMonitor.vue` (Line 335-383: 樣式定義)

---

## Section 10.5: 資產監控頁面 - 表格排序功能

### 測試目標
驗證資產差額和淨資產差額欄位的排序功能。

### 測試步驟
1. 在資產監控頁面表格中
2. 點擊「資產差額」欄位標題
3. 點擊「淨資產差額」欄位標題

### 預期結果
- ✅ 點擊「資產差額」標題後：
  - 顯示排序圖示（上下箭頭）
  - 表格資料按資產差額值排序
  - 再次點擊可切換升序/降序
- ✅ 點擊「淨資產差額」標題後：
  - 顯示排序圖示
  - 表格資料按淨資產差額值排序
  - 再次點擊可切換升序/降序
- ✅ 排序功能不影響其他欄位

### 驗證檔案
- `src/views/monitor/AssetMonitor.vue` (Line 207-209: 資產差額排序)
- `src/views/monitor/AssetMonitor.vue` (Line 215-217: 淨資產差額排序)

---

## Section 10.6: 商戶管理 - 幣種配置新增欄位

### 測試目標
驗證商戶管理的幣種配置彈窗中新增的告警水位比例欄位。

### 測試步驟
1. 導航到: **系統管理 → 商戶管理**
2. 點擊任一商戶的「幣種管理」按鈕
3. 在左側鏈類型列表選擇任一鏈（如 BSC）
4. 勾選某個幣種並啟用「配置儲存上限」

### 預期結果

#### 欄位配置
- ✅ 勾選幣種後，顯示「配置儲存上限」複選框
- ✅ 勾選「配置儲存上限」後，顯示四個輸入框：
  1. 歸集錢包儲存上限（精確度: 4位小數）
  2. **歸集錢包告警水位比例** ⭐ (新增)
  3. 出款錢包儲存上限（精確度: 4位小數）
  4. **出款錢包告警水位比例** ⭐ (新增)

#### 告警水位比例輸入框
- ✅ 標籤正確顯示
- ✅ 最小值：0
- ✅ 最大值：100
- ✅ 精確度：整數（0位小數）
- ✅ 後綴符號：百分比 (%)
- ✅ Placeholder: 「請輸入[歸集/出款]錢包告警水位比例」

#### 輸入驗證
- ✅ 輸入超過 100 時自動限制
- ✅ 輸入負數時自動轉為 0
- ✅ 輸入小數時自動取整

### 驗證檔案
- `src/views/system/Merchants.vue` (Line 319-347: 告警水位比例輸入框)
- `src/locales/system/Merchant/zh.json` (Line 16-17: 欄位翻譯)

---

## Section 10.7: 區塊鏈管理 - 錢包參數新增欄位

### 測試目標
驗證區塊鏈管理的錢包參數分頁中新增的告警水位比例欄位。

### 測試步驟
1. 導航到: **參數管理 → 區塊鏈管理**
2. 點擊「新增」按鈕或編輯某個區塊鏈記錄
3. 切換到「錢包參數」分頁（第三個分頁）

### 預期結果

#### 分頁配置
- ✅ 分頁標題顯示「錢包參數」
- ✅ 分頁內有表單，包含四個輸入框：
  1. 歸集錢包儲存上限（精確度: 2位小數）
  2. **歸集錢包告警水位比例** ⭐ (新增)
  3. 出款錢包儲存上限（精確度: 2位小數）
  4. **出款錢包告警水位比例** ⭐ (新增)

#### 告警水位比例輸入框
- ✅ 標籤正確顯示
- ✅ 最小值：0
- ✅ 最大值：100
- ✅ 精確度：整數（0位小數）
- ✅ 後綴符號：百分比 (%)
- ✅ Placeholder: 「請輸入[歸集/出款]錢包告警水位比例」
- ✅ 輸入框寬度：100%

#### 表單提交
- ✅ 切換分頁後，資料保留不丟失
- ✅ 點擊確認按鈕，所有分頁資料一起保存

### 驗證檔案
- `src/views/params/Blockchain.vue` (Line 226-276: 錢包參數分頁)
- `src/views/params/Blockchain.vue` (Line 190-194: formData 初始化)
- `src/types/blockchain.ts` (Line 39-44: 型別定義)
- `src/locales/params/Blockchain/zh.json` (Line 18-19: 欄位翻譯)

---

## Section 10.8: 角色管理 - 欄位名稱變更

### 測試目標
驗證角色管理的參數配置中欄位名稱已更新。

### 測試步驟
1. 導航到: **系統管理 → 角色管理**
2. 點擊任一角色的「參數配置」按鈕
3. 檢查表單中的欄位標籤

### 預期結果
- ✅ 原欄位名稱「錢包轉帳限額」已更新為「**單日錢包轉帳限額**」
- ✅ 輸入框功能正常（數字輸入）
- ✅ 其他欄位未受影響

### 驗證檔案
- `src/views/system/Roles.vue` (Line 139: 使用 generalTransferLimit 翻譯 key)
- `src/locales/system/Roles/zh.json` (Line 16: 翻譯值)
- `src/locales/system/Roles/en.json` (Line 16: 英文翻譯)

---

## Section 10.9: 多語言切換測試

### 測試目標
驗證所有新增欄位和文字的多語言支援。

### 測試步驟
1. 在系統右上角找到語言切換選項
2. 切換語言為「English」
3. 逐一檢查以下頁面的文字翻譯：
   - 告警監控頁面
   - 資產監控頁面
   - 商戶管理頁面
   - 區塊鏈管理頁面
   - 角色管理頁面

### 預期結果

#### 告警監控頁面 (Alert.vue)
- 🇹🇼 **中文**:
  - 資產差額告警
  - 配置類型
  - 跟隨平台保留額度
  - 自訂保留額度
  - 保留額度
  - 請輸入保留額度

- 🇺🇸 **英文**:
  - Asset Difference Alert
  - Configuration Type
  - Follow Platform Reserve
  - Custom Reserve Amount
  - Reserve Amount
  - Please enter reserve amount

#### 資產監控頁面 (AssetMonitor.vue)
- 🇹🇼 **中文**:
  - 資產差額
  - 淨資產差額
  - 保留額度
  - 扣減後差額

- 🇺🇸 **英文**:
  - Asset Difference
  - Net Asset Difference
  - Reserve Amount
  - Difference Amount

#### 商戶管理頁面 (Merchants.vue)
- 🇹🇼 **中文**:
  - 歸集錢包告警水位比例
  - 出款錢包告警水位比例
  - 請輸入歸集錢包告警水位比例
  - 請輸入出款錢包告警水位比例

- 🇺🇸 **英文**:
  - Collection Wallet Alert Threshold
  - Withdraw Wallet Alert Threshold
  - Please enter collection wallet alert threshold
  - Please enter withdraw wallet alert threshold

#### 區塊鏈管理頁面 (Blockchain.vue)
- 🇹🇼 **中文**:
  - 錢包參數
  - 歸集錢包告警水位比例
  - 出款錢包告警水位比例

- 🇺🇸 **英文**:
  - Wallet Parameters
  - Collection Wallet Alert Threshold
  - Withdraw Wallet Alert Threshold

#### 角色管理頁面 (Roles.vue)
- 🇹🇼 **中文**: 單日錢包轉帳限額
- 🇺🇸 **英文**: Daily Wallet Transfer Limit

### 驗證檔案
- `src/locales/monitor/Alert/zh.json` & `en.json`
- `src/locales/monitor/AssetMonitor/zh.json` & `en.json`
- `src/locales/system/Merchant/zh.json` & `en.json`
- `src/locales/params/Blockchain/zh.json` & `en.json`
- `src/locales/system/Roles/zh.json` & `en.json`

---

## Section 10.10: 響應式設計測試

### 測試目標
驗證所有新增功能在不同螢幕尺寸下的顯示效果。

### 測試步驟
1. 使用瀏覽器開發者工具（F12）
2. 切換到響應式設計模式
3. 測試以下螢幕尺寸：
   - 📱 Mobile: 375px
   - 📱 Tablet: 768px
   - 💻 Desktop: 1280px
   - 🖥️ Large: 1920px

### 預期結果

#### Mobile (375px)
- ✅ 告警監控頁面：
  - 資產差額告警表格可水平滾動
  - 卡片標題和按鈕在小螢幕上自動換行
  - 配置彈窗寬度自適應
- ✅ 資產監控頁面：
  - 表格可水平滾動
  - 篩選條件自動垂直排列
- ✅ 商戶管理：
  - 幣種配置彈窗可滾動
  - 輸入框寬度自適應
- ✅ 區塊鏈管理：
  - 錢包參數表單垂直排列
  - 輸入框寬度 100%

#### Tablet (768px)
- ✅ 所有表格正常顯示
- ✅ 彈窗寬度適中
- ✅ 按鈕排列合理

#### Desktop (1280px+)
- ✅ 所有元素正常顯示
- ✅ 表格不需滾動（寬度充足時）
- ✅ 彈窗置中顯示

### 驗證檔案
- `src/views/monitor/Alert.vue` (深色模式樣式)
- `src/views/monitor/AssetMonitor.vue` (Line 407-425: 響應式樣式)
- `src/views/system/Merchants.vue` (表格和彈窗樣式)
- `src/views/params/Blockchain.vue` (表單樣式)

---

## 測試檢查清單

### 功能測試
- [ ] 10.1 錢包水位配置功能已移除
- [ ] 10.2 資產差額告警卡片正常顯示
- [ ] 10.3 資產差額告警配置功能正常
- [ ] 10.4 資產監控頁面新增欄位顯示正確
- [ ] 10.5 資產監控表格排序功能正常
- [ ] 10.6 商戶管理幣種配置新增欄位
- [ ] 10.7 區塊鏈管理錢包參數新增欄位
- [ ] 10.8 角色管理欄位名稱變更

### 多語言測試
- [ ] 10.9.1 告警監控頁面 zh/en 翻譯正確
- [ ] 10.9.2 資產監控頁面 zh/en 翻譯正確
- [ ] 10.9.3 商戶管理頁面 zh/en 翻譯正確
- [ ] 10.9.4 區塊鏈管理頁面 zh/en 翻譯正確
- [ ] 10.9.5 角色管理頁面 zh/en 翻譯正確

### 響應式測試
- [ ] 10.10.1 Mobile (375px) 顯示正常
- [ ] 10.10.2 Tablet (768px) 顯示正常
- [ ] 10.10.3 Desktop (1280px) 顯示正常
- [ ] 10.10.4 Large Desktop (1920px) 顯示正常

### 瀏覽器相容性測試
- [ ] Chrome 測試
- [ ] Firefox 測試
- [ ] Safari 測試
- [ ] Edge 測試

---

## 已知問題

### 非關鍵性警告
1. **Chunk Size Warning**
   - 描述: vendor.js > 1000 kB
   - 影響: 無功能影響，僅影響首次載入速度
   - 狀態: 可接受（開發階段）

2. **Dynamic Import Warning**
   - 描述: Login.vue 同時被靜態和動態導入
   - 影響: 無功能影響
   - 狀態: 可忽略

---

## 測試報告總結

### 測試統計
- **總測試項目**: 30+
- **關鍵功能**: 10
- **多語言項目**: 5
- **響應式項目**: 4
- **瀏覽器測試**: 4

### 預期測試時間
- 功能測試: ~30 分鐘
- 多語言測試: ~15 分鐘
- 響應式測試: ~15 分鐘
- 瀏覽器測試: ~20 分鐘
- **總計**: ~80 分鐘

### 測試負責人
- 開發者: ✅ 功能實作完成
- QA 團隊: ⏳ 待執行測試
- 產品經理: ⏳ 待驗收

---

## 附錄：快速測試指令

```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行測試（如有）
npm run test
```

## 附錄：測試資料位置

```
src/mock/
├── monitor/
│   ├── Alert/
│   │   ├── assetDifferenceAlert.mock.json  # 資產差額告警資料
│   │   └── assetDifferenceConfig.mock.json # 資產差額配置資料
│   └── AssetMonitor/
│       └── assetMonitor.mock.json          # 資產監控資料
├── system/
│   └── Merchant/
│       ├── query.mock.json                 # 商戶列表資料
│       └── currencies.mock.json            # 幣種資料
└── params/
    └── Blockchain/
        └── list.mock.json                  # 區塊鏈列表資料
```

---

**測試報告結束**
