# blockchain-management Specification Deltas

## ADDED Requirements

### Requirement: Provide alert threshold percentage configuration for wallet parameters
The system SHALL provide alert threshold percentage configuration functionality for collection wallet and withdrawal wallet storage limits in blockchain management wallet parameter configuration. 系統必須在區塊鏈管理的錢包參數配置中,為歸集錢包和出款錢包的儲存上限提供告警水位比例設定功能。

**新增欄位**:
1. 歸集錢包告警水位比例 (collectionWalletAlertThreshold) - 百分比值,0-100%
2. 出款錢包告警水位比例 (withdrawWalletAlertThreshold) - 百分比值,0-100%

**欄位位置**:
- 歸集錢包告警水位比例:位於"歸集錢包儲存上限"欄位下方
- 出款錢包告警水位比例:位於"出款錢包儲存上限"欄位下方

**功能說明**:
- 這是區塊鏈層級的全域設定,適用於該區塊鏈的所有錢包(除非商戶層級有特殊配置)
- 當錢包餘額低於儲存上限 × 告警水位比例時,系統應觸發告警
- 商戶層級的配置優先於區塊鏈層級的配置

#### Scenario: Display alert threshold percentage fields in wallet parameters tab
**Given** 管理員在編輯或新增區塊鏈設定
**And** 管理員切換至"錢包參數"分頁
**When** 系統渲染錢包參數介面
**Then** 應在歸集錢包儲存上限欄位下方顯示"歸集錢包告警水位比例"輸入框
**And** 應在出款錢包儲存上限欄位下方顯示"出款錢包告警水位比例"輸入框
**And** 兩個輸入框應顯示百分比符號 (%)
**And** 輸入框應接受 0-100 的數值

#### Scenario: Validate alert threshold percentage range
**Given** 管理員在錢包參數配置中
**When** 管理員輸入歸集錢包告警水位比例為 -5
**Then** 系統應顯示錯誤訊息"告警水位比例必須大於等於 0"
**And** 應阻止儲存

**Given** 管理員在錢包參數配置中
**When** 管理員輸入出款錢包告警水位比例為 150
**Then** 系統應顯示錯誤訊息"告警水位比例必須小於等於 100"
**And** 應阻止儲存

#### Scenario: Save wallet parameters with alert thresholds
**Given** 管理員在編輯 ETH 區塊鏈的錢包參數
**And** 管理員設定歸集錢包儲存上限為 100,000
**And** 管理員設定歸集錢包告警水位比例為 15%
**And** 管理員設定出款錢包儲存上限為 50,000
**And** 管理員設定出款錢包告警水位比例為 25%
**When** 管理員點擊"確定"儲存
**Then** 系統應儲存所有錢包參數包含告警水位比例
**And** 系統應顯示成功訊息
**And** 新配置應套用於該區塊鏈的所有錢包

#### Scenario: Display existing alert threshold configuration
**Given** BSC 區塊鏈已配置錢包參數
**And** 歸集錢包告警水位比例為 20%
**And** 出款錢包告警水位比例為 30%
**When** 管理員開啟 BSC 的編輯介面
**And** 管理員切換至錢包參數分頁
**Then** 歸集錢包告警水位比例欄位應顯示 20
**And** 出款錢包告警水位比例欄位應顯示 30

#### Scenario: Default value for new blockchain
**Given** 管理員在新增區塊鏈
**And** 管理員切換至錢包參數分頁
**When** 系統渲染錢包參數介面
**Then** 歸集錢包告警水位比例應預設為空白或 0
**And** 出款錢包告警水位比例應預設為空白或 0
**And** 系統應允許管理員自行設定

#### Scenario: Alert threshold applies to all wallets of blockchain
**Given** ETH 區塊鏈的歸集錢包告警水位比例設為 20%
**And** 某商戶在 ETH 鏈上有歸集錢包,儲存上限為 10,000
**And** 該商戶未在商戶層級設定特殊的告警水位比例
**When** 該錢包餘額降至 2,000 以下
**Then** 系統應根據區塊鏈層級的 20% 設定觸發告警

---

## ADDED Requirements

### Requirement: Support multi-language interface
The system SHALL support Traditional Chinese and English interface language switching, including the new alert threshold percentage fields. 系統必須支援繁體中文和英文介面語言切換,包含新增的告警水位比例欄位。

#### Scenario: Traditional Chinese interface with alert threshold fields
**Given** 系統語言設定為繁體中文
**When** 管理員查看錢包參數配置
**Then** "歸集錢包告警水位比例"標籤應顯示"歸集錢包告警水位比例"
**And** "出款錢包告警水位比例"標籤應顯示"出款錢包告警水位比例"
**And** 提示文字和說明應使用中文

#### Scenario: English interface with alert threshold fields
**Given** 系統語言設定為英文
**When** 管理員查看錢包參數配置
**Then** "歸集錢包告警水位比例"標籤應顯示"Collection Wallet Alert Threshold"
**And** "出款錢包告警水位比例"標籤應顯示"Withdraw Wallet Alert Threshold"
**And** 提示文字和說明應使用英文

**新增翻譯鍵值對應**:
- zh: "field.collectionWalletAlertThreshold" → "歸集錢包告警水位比例"
- en: "field.collectionWalletAlertThreshold" → "Collection Wallet Alert Threshold"
- zh: "field.withdrawWalletAlertThreshold" → "出款錢包告警水位比例"
- en: "field.withdrawWalletAlertThreshold" → "Withdraw Wallet Alert Threshold"
- zh: "validation.alertThresholdRange" → "告警水位比例必須在 0-100 之間"
- en: "validation.alertThresholdRange" → "Alert threshold must be between 0-100"
- zh: "description.blockchainAlertThreshold" → "區塊鏈層級的告警水位設定,適用於該鏈的所有錢包"
- en: "description.blockchainAlertThreshold" → "Blockchain-level alert threshold settings, applicable to all wallets on this chain"
- zh: "note.merchantOverride" → "注意:商戶層級的配置將覆蓋此設定"
- en: "note.merchantOverride" → "Note: Merchant-level configuration will override this setting"
