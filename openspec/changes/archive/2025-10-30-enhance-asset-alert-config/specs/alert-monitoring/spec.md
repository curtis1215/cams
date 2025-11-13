# alert-monitoring Specification Deltas

## ADDED Requirements

### Requirement: Display asset difference alert card
The system SHALL provide an asset difference alert card on the alert monitoring page that displays all records triggering asset difference alerts. 系統必須在告警監控頁面提供資產差額告警卡片,顯示所有觸發資產差額告警的記錄。

**顯示欄位**:
1. 商戶 (merchant) - 商戶名稱
2. 幣種 (currency) - 幣種代碼 (例如: USDT, BTC)
3. 錢包持有總量 (walletTotalHoldings) - 數字格式,8 位小數
4. 平台持有總量 (platformTotalHoldings) - 數字格式,8 位小數
5. 資產差額 (assetDifference) - 錢包持有總量 - 平台持有總量 - 保留額度
6. 淨資產差額 (netAssetDifference) - 錢包持有總量 - 平台持有總量

#### Scenario: Display asset difference alert records
**Given** 系統存在資產差額告警記錄
**When** 使用者查看告警監控頁面
**Then** 系統應顯示資產差額告警卡片
**And** 卡片應位於錢包水位告警卡片之後
**And** 表格應包含所有必要欄位
**And** 負數差額應以紅色文字顯示

#### Scenario: Empty asset difference alert
**Given** 系統無資產差額告警記錄
**When** 使用者查看告警監控頁面
**Then** 資產差額告警卡片應顯示空狀態訊息
**And** 訊息應為"目前無資產差額告警"

---

### Requirement: Provide asset difference alert configuration
The system SHALL provide asset difference alert configuration functionality that allows administrators to configure the reserve amount calculation method for each currency. 系統必須提供資產差額告警的配置功能,允許管理員設定每個幣種的保留額度計算方式。

**配置選項**:
1. 跟隨平台保留額度 (followPlatformReserve) - 預設選項,使用平台統一設定
2. 自訂 (custom) - 允許為特定幣種設定獨立的保留額度

#### Scenario: Open asset difference alert configuration
**Given** 使用者具有告警配置權限
**When** 使用者點擊資產差額告警卡片右上方的"告警配置"按鈕
**Then** 系統應開啟告警配置彈窗
**And** 彈窗應顯示所有幣種列表
**And** 每個幣種應顯示兩個核取方塊選項

#### Scenario: Select follow platform reserve
**Given** 告警配置彈窗已開啟
**When** 使用者勾選"跟隨平台保留額度"選項
**Then** 該幣種應使用平台預設的保留額度設定
**And** 自訂數量輸入框應隱藏或禁用

#### Scenario: Select custom reserve amount
**Given** 告警配置彈窗已開啟
**When** 使用者勾選"自訂"選項
**Then** 系統應顯示數量輸入框
**And** 輸入框應接受數字輸入
**And** 輸入框應支持小數點(最多 8 位)
**And** 系統應驗證輸入值 >= 0

#### Scenario: Save asset difference alert configuration
**Given** 使用者已設定告警配置
**When** 使用者點擊"確定"按鈕
**Then** 系統應儲存配置
**And** 系統應顯示成功訊息
**And** 彈窗應關閉
**And** 新配置應立即生效

---

### Requirement: Support multi-language for asset difference alert
The system SHALL support Traditional Chinese and English interfaces for asset difference alerts. 系統必須支援繁體中文和英文的資產差額告警介面。

#### Scenario: Traditional Chinese interface for asset difference alert
**Given** 系統語言設定為繁體中文
**When** 使用者查看資產差額告警
**Then** 卡片標題應顯示"資產差額告警"
**And** 配置按鈕應顯示"告警配置"
**And** 所有欄位標籤應使用中文

#### Scenario: English interface for asset difference alert
**Given** 系統語言設定為英文
**When** 使用者查看資產差額告警
**Then** 卡片標題應顯示"Asset Difference Alert"
**And** 配置按鈕應顯示"Alert Configuration"
**And** 所有欄位標籤應使用英文

**Translation key mappings**:
- zh: "card.assetDifferenceAlert" → "資產差額告警"
- en: "card.assetDifferenceAlert" → "Asset Difference Alert"
- zh: "field.walletTotalHoldings" → "錢包持有總量"
- en: "field.walletTotalHoldings" → "Wallet Total Holdings"
- zh: "field.platformTotalHoldings" → "平台持有總量"
- en: "field.platformTotalHoldings" → "Platform Total Holdings"
- zh: "field.assetDifference" → "資產差額"
- en: "field.assetDifference" → "Asset Difference"
- zh: "field.netAssetDifference" → "淨資產差額"
- en: "field.netAssetDifference" → "Net Asset Difference"
- zh: "action.alertConfiguration" → "告警配置"
- en: "action.alertConfiguration" → "Alert Configuration"
- zh: "option.followPlatformReserve" → "跟隨平台保留額度"
- en: "option.followPlatformReserve" → "Follow Platform Reserve"
- zh: "option.custom" → "自訂"
- en: "option.custom" → "Custom"
