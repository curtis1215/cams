# 翻譯鍵值命名規範

## 基本原則

1. 使用 camelCase 命名方式
2. 避免重複的鍵值
3. 按功能模塊進行分組
4. 使用有意義且具描述性的名稱
5. 保持命名的一致性

## 命名結構

```
moduleNamespace.category.specificName
```

例如：`alert.settings.title`

## 常用分類

### 標題類
- `xxxTitle`: 頁面或區塊標題
- `xxxSettingsTitle`: 設置彈窗標題

### 按鈕類
- `addXxx`: 添加操作
- `editXxx`: 編輯操作
- `deleteXxx`: 刪除操作
- `saveXxx`: 保存操作

### 表單類
- `xxxThreshold`: 閾值設置
- `xxxTimeout`: 超時設置
- `xxxDuration`: 時長設置

### 狀態類
- `xxxStatus`: 狀態描述
- `xxxAlert`: 告警信息
- `xxxBehind`: 落後狀態

### 字段類
- `xxxId`: ID類字段
- `xxxTime`: 時間類字段
- `xxxAmount`: 金額類字段
- `xxxValue`: 數值類字段

## 實際示例

以告警模塊（Alert）為例：

```json
{
  // 標題類
  "nodeHeightAlertTitle": "節點高度告警",
  "alertSettingsTitle": "告警設置",
  
  // 設置類
  "depositAlertThreshold": "大額存款閾值",
  "processingTimeoutThreshold": "處理中時長閾值",
  
  // 狀態類
  "serviceHeightBehind": "服務高度落後",
  "processingTimeoutAlert": "處理超時",
  
  // 字段類
  "orderId": "訂單編號",
  "createTime": "創建時間",
  "amount": "金額"
}
```

## 注意事項

1. 避免使用相同的鍵值表示不同的含義
2. 相關功能的鍵值應該放在同一個命名空間下
3. 鍵值應該清晰地表達其用途
4. 保持英文和中文翻譯文件的鍵值完全一致
5. 不同模塊間的公共翻譯應放在 common 命名空間下

## 模塊命名空間

- `common`: 公共翻譯
- `alert`: 告警模塊
- `dashboard`: 儀表板模塊
- `wallet`: 錢包模塊
- `monitor`: 監控模塊
- `system`: 系統設置模塊

## 建議的目錄結構

```
src/locales/
├── TRANSLATION_NAMING_CONVENTION.md
├── common/
│   ├── zh.json
│   └── en.json
├── monitor/
│   ├── Alert/
│   │   ├── zh.json
│   │   └── en.json
│   └── Dashboard/
│       ├── zh.json
│       └── en.json
└── wallet/
    ├── zh.json
    └── en.json
``` 