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
5. 不同模塊間的公共翻譯應該放在 common 命名空間下

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

## 組件級本地化配置使用說明

在 Vue 組件中，我們可以使用兩種方式進行本地化配置：全局配置和組件級配置。

### 全局配置

全局配置是在 `src/i18n/index.js` 中定義的，所有組件都可以訪問這些翻譯。使用全局配置時，需要使用命名空間前綴：

```vue
<template>
  <div>{{ t('common.field.orderId') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

### 組件級配置

組件級配置是在組件內部定義的，只有該組件可以訪問這些翻譯。使用組件級配置時，不需要使用命名空間前綴：

```vue
<template>
  <div>{{ t('field.orderId') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/order/Manual/zh.json'
import enLocale from '@/locales/order/Manual/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})
</script>
```

### 組件級配置注意事項

1. **翻譯鍵的作用域**：組件級配置中的翻譯鍵只能訪問導入的翻譯文件中的鍵，不能訪問全局配置中的鍵。

2. **確保翻譯文件完整**：如果在組件中使用了某個翻譯鍵，必須確保該鍵在導入的翻譯文件中存在。

3. **避免混用**：在同一個組件中，應該統一使用全局配置或組件級配置，避免混用。

4. **共享翻譯**：如果需要在多個組件中使用相同的翻譯，有兩種方法：
   - 在每個組件中都導入相同的翻譯文件
   - 將這些翻譯移到全局配置中

5. **導入通用翻譯**：如果組件需要使用通用翻譯，可以在組件級配置中也導入通用翻譯文件：

```javascript
import zhCommon from '@/locales/common/zh.json'

const messages = {
  zh: {
    ...zhLocale,
    common: zhCommon
  }
}
```

### 最佳實踐

1. **對於頁面級組件**：建議使用組件級配置，將所有翻譯放在對應的翻譯文件中。

2. **對於共享組件**：建議使用全局配置，將翻譯放在 common 命名空間下。

3. **對於複雜頁面**：可以將頁面拆分為多個子組件，每個子組件使用組件級配置，將翻譯放在對應的翻譯文件中。

4. **測試翻譯**：在開發過程中，應該測試所有翻譯鍵是否正確顯示，避免出現 `[intlify] Not found 'xxx' key in 'zh' locale messages` 的錯誤。 