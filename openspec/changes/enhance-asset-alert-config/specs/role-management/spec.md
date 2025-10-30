# role-management Specification Deltas

## MODIFIED Requirements

### Requirement: Provide parameter configuration for roles - daily wallet transfer limit
系統必須在角色管理的參數配置彈窗中提供單日錢包轉帳限額的設定功能。

**欄位變更**:
- **舊名稱**: "錢包轉帳限額" (generalTransferLimit)
- **新名稱**: "單日錢包轉帳限額" (dailyWalletTransferLimit)

**欄位保持不變**:
- 資料型別: Number (數字)
- 單位: USDT
- 驗證規則: >= 0
- 預設值: 10,000

**功能說明**:
- 限制擁有該角色的使用者每日可進行的錢包轉帳總額
- 計算週期:每日 00:00 重置
- 超過限額時系統應阻止轉帳並顯示錯誤訊息

#### Scenario: Display daily wallet transfer limit field
**Given** 管理員開啟角色的參數配置彈窗
**When** 系統渲染配置介面
**Then** 欄位標籤應顯示"單日錢包轉帳限額" (中文)
**Or** "Daily Wallet Transfer Limit" (英文)
**And** 輸入框應顯示當前設定值
**And** 單位應顯示為 "USDT"

#### Scenario: Update daily wallet transfer limit
**Given** 管理員在參數配置彈窗中
**And** 當前單日錢包轉帳限額為 10,000
**When** 管理員將值修改為 50,000
**And** 管理員點擊"確定"儲存
**Then** 系統應儲存新的限額設定
**And** 系統應顯示成功訊息
**And** 新限額應立即套用於擁有該角色的所有使用者

#### Scenario: Validate daily wallet transfer limit minimum value
**Given** 管理員在參數配置中
**When** 管理員輸入負數值
**Then** 系統應顯示錯誤訊息"轉帳限額必須大於等於 0"
**And** 應阻止儲存

---

## MODIFIED Requirements

### Requirement: Support multi-language interface
系統必須支援繁體中文和英文介面語言切換,包含更新的欄位名稱。

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
