## Why
錢包管理、錢包轉帳、錢包轉帳列表、審核詳情中缺少提交人和審核人的信息，無法追蹤操作責任人，影響審計和問題追溯。

## What Changes
- 在錢包管理頁面 (Query.vue) 增加顯示錢包新增的提交人
- 在錢包轉帳頁面 (Transfer.vue) 的轉帳列表中增加提交人、審核人欄位
- 在錢包轉帳頁面 (Transfer.vue) 的審核詳情彈窗中增加提交人、審核人資訊
- 在錢包轉帳列表頁面 (TransferRecord.vue) 增加提交人、審核人欄位
- 更新相關 mock 數據以支援新欄位

## Impact
- Affected specs: wallet-management (new capability)
- Affected code:
  - `src/views/wallet/Query.vue` - 錢包管理頁面
  - `src/views/wallet/Transfer.vue` - 錢包轉帳頁面
  - `src/views/order/TransferRecord.vue` - 錢包轉帳列表頁面
  - `src/mock/wallet/Transfer/transfer.mock.json` - 轉帳 mock 數據
  - `src/mock/order/transfer/list.json` - 轉帳記錄 mock 數據
  - `src/locales/wallet/Query/*.json` - 錢包管理多語系
  - `src/locales/wallet/Transfer/*.json` - 錢包轉帳多語系
  - `src/locales/order/TransferRecord/*.json` - 轉帳記錄多語系
