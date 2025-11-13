# blockchain-management Specification

## Purpose
TBD - created by archiving change enhance-asset-alert-config. Update Purpose after archive.
## Requirements
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

