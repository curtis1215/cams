# merchant-management Specification Deltas

## ADDED Requirements

### Requirement: Provide alert threshold percentage configuration for wallet storage limits
系統必須在商戶管理的幣種配置介面中,為歸集錢包和出款錢包的儲存上限提供告警水位比例設定功能。

**新增欄位**:
1. 歸集錢包告警水位比例 (collectionWalletAlertThreshold) - 百分比值,0-100%
2. 出款錢包告警水位比例 (withdrawWalletAlertThreshold) - 百分比值,0-100%

**欄位位置**:
- 歸集錢包告警水位比例:位於"歸集錢包儲存上限" (collectionWalletLimit) 欄位下方
- 出款錢包告警水位比例:位於"出款錢包儲存上限" (withdrawWalletLimit) 欄位下方

**功能說明**:
- 當錢包餘額低於儲存上限 × 告警水位比例時,系統應觸發告警
- 例如:儲存上限為 10,000,告警水位比例為 20%,當餘額低於 2,000 時觸發告警

#### Scenario: Display alert threshold percentage fields in currency configuration
**Given** 管理員開啟商戶幣種配置彈窗
**And** 商戶已啟用"配置儲存上限"選項
**When** 系統渲染配置介面
**Then** 應在歸集錢包儲存上限欄位下方顯示"歸集錢包告警水位比例"輸入框
**And** 應在出款錢包儲存上限欄位下方顯示"出款錢包告警水位比例"輸入框
**And** 兩個輸入框應顯示百分比符號 (%)
**And** 輸入框應接受 0-100 的數值

#### Scenario: Hide alert threshold when storage limit is disabled
**Given** 管理員在幣種配置中
**When** 管理員取消勾選"配置儲存上限"選項
**Then** 歸集錢包告警水位比例欄位應隱藏或禁用
**And** 出款錢包告警水位比例欄位應隱藏或禁用
**And** 相關數值應清空或重設為 0

#### Scenario: Validate alert threshold percentage range
**Given** 管理員輸入告警水位比例
**When** 管理員輸入小於 0 的值
**Then** 系統應顯示錯誤訊息"告警水位比例必須大於等於 0"
**And** 應阻止儲存

**Given** 管理員輸入告警水位比例
**When** 管理員輸入大於 100 的值
**Then** 系統應顯示錯誤訊息"告警水位比例必須小於等於 100"
**And** 應阻止儲存

#### Scenario: Save alert threshold configuration
**Given** 管理員已設定歸集錢包告警水位比例為 20%
**And** 管理員已設定出款錢包告警水位比例為 30%
**When** 管理員點擊"確定"儲存
**Then** 系統應儲存告警水位比例配置
**And** 系統應顯示成功訊息
**And** 配置應立即生效於告警系統

#### Scenario: Display existing alert threshold configuration
**Given** 某商戶的 USDT (BSC) 已配置告警水位比例
**And** 歸集錢包告警水位比例為 25%
**And** 出款錢包告警水位比例為 35%
**When** 管理員開啟該幣種的配置
**Then** 歸集錢包告警水位比例欄位應顯示 25
**And** 出款錢包告警水位比例欄位應顯示 35

---

## MODIFIED Requirements

### Requirement: Support multi-language interface
系統必須支援繁體中文和英文介面語言切換,包含新增的告警水位比例欄位。

#### Scenario: Traditional Chinese interface with alert threshold fields
**Given** 系統語言設定為繁體中文
**When** 管理員查看幣種配置
**Then** "歸集錢包告警水位比例"標籤應顯示"歸集錢包告警水位比例"
**And** "出款錢包告警水位比例"標籤應顯示"出款錢包告警水位比例"
**And** 提示文字應使用中文

#### Scenario: English interface with alert threshold fields
**Given** 系統語言設定為英文
**When** 管理員查看幣種配置
**Then** "歸集錢包告警水位比例"標籤應顯示"Collection Wallet Alert Threshold"
**And** "出款錢包告警水位比例"標籤應顯示"Withdraw Wallet Alert Threshold"
**And** 提示文字應使用英文

**新增翻譯鍵值對應**:
- zh: "field.collectionWalletAlertThreshold" → "歸集錢包告警水位比例"
- en: "field.collectionWalletAlertThreshold" → "Collection Wallet Alert Threshold"
- zh: "field.withdrawWalletAlertThreshold" → "出款錢包告警水位比例"
- en: "field.withdrawWalletAlertThreshold" → "Withdraw Wallet Alert Threshold"
- zh: "validation.alertThresholdRange" → "告警水位比例必須在 0-100 之間"
- en: "validation.alertThresholdRange" → "Alert threshold must be between 0-100"
- zh: "description.alertThreshold" → "當錢包餘額低於儲存上限的指定百分比時觸發告警"
- en: "description.alertThreshold" → "Alert will be triggered when wallet balance falls below the specified percentage of storage limit"
