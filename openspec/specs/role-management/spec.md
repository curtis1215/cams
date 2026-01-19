# role-management Specification

## Purpose
TBD - created by archiving change enhance-asset-alert-config. Update Purpose after archive.
## Requirements
### Requirement: Support multi-language interface
The system SHALL support Traditional Chinese and English interface language switching, including the updated field names. 系統必須支援繁體中文和英文介面語言切換,包含更新的欄位名稱。

#### Scenario: Traditional Chinese interface with updated field name
**Given** 系統語言設定為繁體中文
**When** 管理員查看參數配置彈窗
**Then** 欄位標籤應顯示"單日錢包轉帳限額"
**And** 提示文字應使用中文

#### Scenario: English interface with updated field name
**Given** 系統語言設定為英文
**When** 管理員查看參數配置彈窗
**Then** 欄位標籤應顯示"Daily Wallet Transfer Limit"
**And** 提示文字應使用英文

**修改翻譯鍵值對應**:
- zh: "field.generalTransferLimit" → **修改為** "field.dailyWalletTransferLimit"
- zh: "field.dailyWalletTransferLimit" → "單日錢包轉帳限額"
- en: "field.generalTransferLimit" → **修改為** "field.dailyWalletTransferLimit"
- en: "field.dailyWalletTransferLimit" → "Daily Wallet Transfer Limit"
- zh: "prompt.inputTransferLimit" → "請輸入單日錢包轉帳限額"
- en: "prompt.inputTransferLimit" → "Please enter daily wallet transfer limit"
- zh: "validation.transferLimitMinimum" → "轉帳限額必須大於等於 0"
- en: "validation.transferLimitMinimum" → "Transfer limit must be greater than or equal to 0"

**注意**:
- 翻譯 key 建議從 `generalTransferLimit` 更新為 `dailyWalletTransferLimit` 以反映新的語義
- 如果維持原有 key 名稱,僅更新顯示文字也可接受,但不推薦

