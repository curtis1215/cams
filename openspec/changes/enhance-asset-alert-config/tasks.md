# 實作任務清單

## 1. 資料結構與型別定義
- [x] 1.1 定義資產差額告警的型別 (src/types/assetMonitor.ts)
- [x] 1.2 更新商戶幣種配置型別,新增告警水位比例欄位
- [x] 1.3 更新區塊鏈錢包參數型別,新增告警水位比例欄位
- [x] 1.4 更新角色管理參數配置型別,修改欄位名稱

## 2. Mock 資料更新
- [x] 2.1 更新 src/mock/monitor/AssetMonitor/ 資產監控 mock 資料
- [x] 2.2 新增 src/mock/monitor/Alert/assetDifferenceAlert.mock.json
- [x] 2.3 新增 src/mock/monitor/Alert/assetDifferenceConfig.mock.json
- [x] 2.4 更新 src/mock/system/Merchant/ 商戶管理 mock 資料
- [x] 2.5 更新 src/mock/params/Blockchain/ 區塊鏈管理 mock 資料

## 3. 多語言翻譯
- [x] 3.1 更新 src/locales/monitor/Alert/zh.json - 新增資產差額告警相關翻譯
- [x] 3.2 更新 src/locales/monitor/Alert/en.json - 新增資產差額告警相關翻譯
- [x] 3.3 更新 src/locales/monitor/AssetMonitor/zh.json - 新增資產差額欄位翻譯
- [x] 3.4 更新 src/locales/monitor/AssetMonitor/en.json - 新增資產差額欄位翻譯
- [x] 3.5 更新 src/locales/system/Merchant/zh.json - 新增告警水位比例翻譯
- [x] 3.6 更新 src/locales/system/Merchant/en.json - 新增告警水位比例翻譯
- [x] 3.7 更新 src/locales/params/Blockchain/zh.json - 新增告警水位比例翻譯
- [x] 3.8 更新 src/locales/params/Blockchain/en.json - 新增告警水位比例翻譯
- [x] 3.9 更新 src/locales/system/Roles/zh.json - 修改轉帳限額名稱
- [x] 3.10 更新 src/locales/system/Roles/en.json - 修改轉帳限額名稱

## 4. 告警監控頁面 (src/views/monitor/Alert.vue)
- [x] 4.1 移除錢包水位告警卡片中的"告警配置"按鈕
- [x] 4.2 移除 walletBalanceSettingModalVisible 相關狀態和函數
- [x] 4.3 移除錢包水位告警設置彈窗及相關邏輯
- [x] 4.4 新增資產差額告警卡片元件
- [x] 4.5 新增資產差額告警資料表格(包含:商戶、幣種、錢包持有總量、平台持有總量、資產差額、淨資產差額)
- [x] 4.6 新增資產差額告警配置按鈕
- [x] 4.7 新增資產差額告警配置彈窗
- [x] 4.8 實作幣種列表與配置選項(跟隨平台保留額度/自訂)
- [x] 4.9 實作自訂數量輸入框邏輯

## 5. 資產監控頁面 (src/views/monitor/AssetMonitor.vue)
- [x] 5.1 在淨資產差額之前新增"資產差額"欄位
- [x] 5.2 實作資產差額欄位的斷行顯示(第一行:保留額度,第二行:扣減後差額)
- [x] 5.3 實作負數紅色顯示邏輯
- [x] 5.4 修改現有"資產差額"欄位名稱為"淨資產差額"
- [x] 5.5 為資產差額和淨資產差額欄位新增排序功能
- [x] 5.6 更新表格欄位定義(columns)
- [x] 5.7 更新 mock 資料以包含保留額度資訊

## 6. 商戶管理頁面 (src/views/system/Merchants.vue)
- [x] 6.1 在幣種配置彈窗中找到歸集錢包儲存上限欄位
- [x] 6.2 在歸集錢包儲存上限下方新增"歸集錢包告警水位比例"輸入框
- [x] 6.3 在出款錢包儲存上限欄位下方新增"出款錢包告警水位比例"輸入框
- [x] 6.4 實作告警水位比例的表單驗證(0-100%)
- [x] 6.5 更新 merchantCurrencyConfig 資料結構
- [x] 6.6 實作告警水位比例的儲存邏輯

## 7. 區塊鏈管理頁面 (src/views/params/Blockchain.vue)
- [x] 7.1 在錢包參數分頁中找到歸集錢包儲存上限欄位
- [x] 7.2 在歸集錢包儲存上限下方新增"歸集錢包告警水位比例"輸入框
- [x] 7.3 在出款錢包儲存上限欄位下方新增"出款錢包告警水位比例"輸入框
- [x] 7.4 實作告警水位比例的表單驗證(0-100%)
- [x] 7.5 更新 formData 資料結構
- [x] 7.6 實作告警水位比例的儲存邏輯

## 8. 角色管理頁面 (src/views/system/Roles.vue)
- [x] 8.1 修改參數配置彈窗中的欄位標籤:"錢包轉帳限額" → "單日錢包轉帳限額"
- [x] 8.2 更新對應的翻譯 key

## 9. 樣式與 UI 調整
- [x] 9.1 資產差額告警卡片樣式
- [x] 9.2 資產差額告警配置彈窗樣式
- [x] 9.3 資產監控表格欄位寬度調整
- [x] 9.4 告警水位比例輸入框樣式(帶百分比符號)

## 10. 測試與驗證 (需手動執行 - 參見 TESTING.md)
- [ ] 10.1 驗證告警監控頁面錢包水位配置功能已移除
- [ ] 10.2 驗證資產差額告警卡片正常顯示
- [ ] 10.3 驗證資產差額告警配置功能
- [ ] 10.4 驗證資產監控頁面新增欄位顯示正確
- [ ] 10.5 驗證資產監控表格排序功能
- [ ] 10.6 驗證商戶管理幣種配置新增欄位
- [ ] 10.7 驗證區塊鏈管理錢包參數新增欄位
- [ ] 10.8 驗證角色管理欄位名稱變更
- [ ] 10.9 測試多語言切換功能
- [ ] 10.10 測試響應式設計

## 11. 文件更新
- [x] 11.1 更新 README.md 或相關文件
- [ ] 11.2 更新 API 文件(如有需要 - 目前使用 mock 資料，後端整合時再補充)
