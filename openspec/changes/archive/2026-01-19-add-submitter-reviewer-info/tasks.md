## 1. 多語系檔案更新
- [x] 1.1 更新 `src/locales/wallet/Query/zh.json` 新增提交人欄位翻譯
- [x] 1.2 更新 `src/locales/wallet/Query/en.json` 新增提交人欄位翻譯
- [x] 1.3 更新 `src/locales/wallet/Transfer/zh.json` 新增提交人、審核人欄位翻譯
- [x] 1.4 更新 `src/locales/wallet/Transfer/en.json` 新增提交人、審核人欄位翻譯
- [x] 1.5 更新 `src/locales/order/TransferRecord/zh.json` 新增提交人、審核人欄位翻譯
- [x] 1.6 更新 `src/locales/order/TransferRecord/en.json` 新增提交人、審核人欄位翻譯

## 2. Mock 數據更新
- [x] 2.1 更新 `src/mock/wallet/Transfer/transfer.mock.json` 增加 submitter、reviewer 欄位
- [x] 2.2 更新 `src/mock/order/transfer/list.json` 增加 submitter、reviewer 欄位
- [x] 2.3 更新 `src/mock/wallet/Query/enhanced-query.mock.json` 增加 createdBy 欄位

## 3. 錢包管理頁面 (Query.vue)
- [x] 3.1 在表格欄位中新增「提交人」(createdBy) 欄位

## 4. 錢包轉帳頁面 (Transfer.vue)
- [x] 4.1 在轉帳列表表格欄位中新增「提交人」(submitter) 欄位
- [x] 4.2 在轉帳列表表格欄位中新增「審核人」(reviewer) 欄位
- [x] 4.3 在審核詳情彈窗中新增「提交人」資訊顯示
- [x] 4.4 在審核詳情彈窗中新增「審核人」資訊顯示

## 5. 錢包轉帳列表頁面 (TransferRecord.vue)
- [x] 5.1 在表格欄位中新增「提交人」(submitter) 欄位
- [x] 5.2 在表格欄位中新增「審核人」(reviewer) 欄位

## 6. 驗證測試
- [x] 6.1 確認所有頁面正確顯示提交人、審核人資訊
- [x] 6.2 確認中英文語系切換正常
- [x] 6.3 執行 npm run build 確認無編譯錯誤
