# asset-monitoring Specification Deltas

## MODIFIED Requirements

### Requirement: Display asset data fields with multi-chain support and enhanced difference information
The system SHALL display the following fields in the asset monitoring table with support for distinguishing data across multiple blockchain networks, with enhanced display of asset difference information. 系統必須在資產監控表格中顯示以下欄位,並支援跨多個區塊鏈網路區分資料,特別強化資產差額相關資訊的顯示。

**修改欄位**:
1. Currency (幣種) - 幣種代碼 (例如: USDT, BTC, ETH)
2. Chain Holdings (鏈路持有量) - 顯示各鏈路持有量詳情,支援標籤顯示
3. Platform User Holdings (平台用戶持有量) - 數字格式,8 位小數
4. Platform Project Holdings (平台項目方持有量) - 數字格式,8 位小數
5. **Asset Difference (資產差額)** - **新增欄位**,顯示保留額度資訊和扣減後差額
6. **Net Asset Difference (淨資產差額)** - **原"資產差額"欄位重新命名**
7. Trend (走勢) - 視覺化走勢圖
8. Update Time (更新時間) - 時間戳記

**資產差額欄位說明**:
- 第一行:該幣種保留額度 (格式: "保留額度: XXX")
- 第二行:扣減保留額度後差額 (格式: "差額: XXX")
- 使用斷行方式展示
- 當差額為負數時,以紅色文字顯示
- 可選:負數時顯示警告圖示

**淨資產差額欄位說明**:
- 計算公式: 鏈路持有量總計 - (用戶持有量 + 項目方持有量)
- 不扣減保留額度
- 正數顯示為綠色,負數顯示為紅色

#### Scenario: Display asset difference with reserve amount
**Given** USDT 幣種的保留額度為 10,000
**And** 扣減保留額度後差額為 -5,000
**When** 系統渲染資料列
**Then** 資產差額欄位應顯示兩行文字
**And** 第一行應顯示"保留額度: 10,000.00000000"
**And** 第二行應顯示"差額: -5,000.00000000"
**And** 第二行差額應以紅色文字顯示
**And** 可選顯示警告圖示

#### Scenario: Display positive asset difference
**Given** BTC 幣種的保留額度為 1
**And** 扣減保留額度後差額為 0.5
**When** 系統渲染資料列
**Then** 資產差額欄位應顯示兩行文字
**And** 第一行應顯示"保留額度: 1.00000000"
**And** 第二行應顯示"差額: 0.50000000"
**And** 第二行差額應以正常顏色或綠色顯示

#### Scenario: Display renamed net asset difference
**Given** ETH 的淨資產差額為 -100
**When** 系統渲染資料列
**Then** 淨資產差額欄位應顯示"-100.00000000"
**And** 應以紅色文字顯示
**And** 欄位標題應為"淨資產差額" (中文) 或 "Net Asset Difference" (英文)

---

## ADDED Requirements

### Requirement: Provide sorting functionality for difference columns
The system SHALL provide sorting functionality for asset difference and net asset difference columns. 系統必須為資產差額和淨資產差額欄位提供排序功能。

#### Scenario: Sort by asset difference ascending
**Given** 使用者在資產監控頁面
**When** 使用者點擊"資產差額"欄位標題
**Then** 表格應按資產差額由小到大排序
**And** 負數應排在最前面
**And** 排序圖示應顯示向上箭頭

#### Scenario: Sort by asset difference descending
**Given** 表格已按資產差額升序排序
**When** 使用者再次點擊"資產差額"欄位標題
**Then** 表格應按資產差額由大到小排序
**And** 正數應排在最前面
**And** 排序圖示應顯示向下箭頭

#### Scenario: Sort by net asset difference ascending
**Given** 使用者在資產監控頁面
**When** 使用者點擊"淨資產差額"欄位標題
**Then** 表格應按淨資產差額由小到大排序
**And** 負數應排在最前面
**And** 排序圖示應顯示向上箭頭

#### Scenario: Sort by net asset difference descending
**Given** 表格已按淨資產差額升序排序
**When** 使用者再次點擊"淨資產差額"欄位標題
**Then** 表格應按淨資產差額由大到小排序
**And** 正數應排在最前面
**And** 排序圖示應顯示向下箭頭

#### Scenario: Clear sorting
**Given** 表格已套用排序
**When** 使用者點擊其他欄位標題或清除排序
**Then** 表格應恢復預設排序
**And** 排序圖示應移除

---

## MODIFIED Requirements

### Requirement: Support multi-language interface
The system SHALL support Traditional Chinese and English interface language switching, including all UI elements and new field labels. 系統必須支援繁體中文和英文介面語言切換,包含所有 UI 元素和新增的欄位標籤。

#### Scenario: Traditional Chinese interface with new fields
**Given** 系統語言設定為繁體中文
**When** 使用者訪問資產監控頁面
**Then** "資產差額"欄位標籤應顯示"資產差額"
**And** "淨資產差額"欄位標籤應顯示"淨資產差額"
**And** 保留額度文字應顯示"保留額度"
**And** 差額文字應顯示"差額"

#### Scenario: English interface with new fields
**Given** 系統語言設定為英文
**When** 使用者訪問資產監控頁面
**Then** "資產差額"欄位標籤應顯示"Asset Difference"
**And** "淨資產差額"欄位標籤應顯示"Net Asset Difference"
**And** 保留額度文字應顯示"Reserve"
**And** 差額文字應顯示"Difference"

**新增翻譯鍵值對應**:
- zh: "field.assetDifference" → "資產差額"
- en: "field.assetDifference" → "Asset Difference"
- zh: "field.netAssetDifference" → "淨資產差額"
- en: "field.netAssetDifference" → "Net Asset Difference"
- zh: "label.reserve" → "保留額度"
- en: "label.reserve" → "Reserve"
- zh: "label.differenceAmount" → "差額"
- en: "label.differenceAmount" → "Difference"
