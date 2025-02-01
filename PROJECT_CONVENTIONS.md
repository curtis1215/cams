# Vue 3 專案開發規範

## 1. 樣式規範

### 1.1 CSS 命名規範
- 使用 kebab-case 命名方式（例如：`header-container`）
- 組件內部樣式使用 `scoped` 屬性
- 全局樣式放在 `src/styles` 目錄下
- 使用 CSS 變量管理主題和顏色

### 1.2 樣式組織
```scss
// 變量定義
:root {
  --primary-color: #646cff;
  --text-color: #213547;
  --bg-color: #ffffff;
}

// 組件樣式
.component-name {
  &__element {
    // 元素樣式
  }
  
  &--modifier {
    // 修飾符樣式
  }
}
```

### 1.3 響應式設計
- 使用 CSS Grid 和 Flexbox 進行布局
- 使用媒體查詢進行響應式適配
- 移動優先的設計理念

### 1.4 卡片樣式規範

#### 1.4.1 基本規範
- 所有卡片統一使用 `:bordered="false"`
- 卡片背景色統一為 `#141414`
- 卡片標題背景色為 `#1f1f1f`
- 卡片邊框顏色為 `#303030`
- 卡片圓角為 `8px`

#### 1.4.2 查詢條件卡片
```vue
<a-card :bordered="false" class="filter-card">
  <template #title>
    <span class="card-title">{{ t('title') }}</span>
  </template>
  <a-form :model="searchForm" class="query-form">
    <div class="form-row">
      <!-- 表單項 -->
    </div>
  </a-form>
</a-card>
```

```scss
.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

:deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

:deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

:deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

:deep(.ant-card-body) {
  background-color: #141414;
  padding: 20px 24px;
}
```

#### 1.4.3 表格卡片
```vue
<a-card :bordered="false" class="table-card">
  <template #title>
    <span class="card-title">{{ t('title') }}</span>
  </template>
  <div class="table-container">
    <a-table>
      <!-- 表格內容 -->
    </a-table>
  </div>
</a-card>
```

```scss
.table-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}
```

#### 1.4.4 表單佈局規範
- 使用 `form-row` 進行表單項分組
- 表單項寬度類：
  - `form-item-xl`: flex: 3 (適用於超長輸入)
  - `form-item-lg`: flex: 2 (適用於日期範圍、地址等)
  - `form-item-md`: flex: 1.5 (適用於一般輸入框)
  - `form-item-sm`: flex: 1 (適用於按鈕組)

```scss
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.form-item-xl { flex: 3; min-width: 0; }
.form-item-lg { flex: 2; min-width: 0; }
.form-item-md { flex: 1.5; min-width: 0; }
.form-item-sm { flex: 1; min-width: 0; }

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
```

#### 1.4.5 表格樣式規範
```scss
:deep(.ant-table) {
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background: #1f1f1f;
  border-bottom: 1px solid #303030;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #303030;
}

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.ant-pagination-item-link) {
  background: transparent !important;
  border-color: #303030 !important;
}

:deep(.ant-pagination-item) {
  background: transparent !important;
  border-color: #303030 !important;
}

:deep(.ant-pagination-item-active) {
  border-color: #177ddc !important;
}
```

## 2. 檔案結構規範

### 2.1 目錄結構
```
src/
├── assets/          # 靜態資源
├── components/      # 共用元件
│   ├── base/       # 基礎元件
│   └── business/   # 業務元件
├── layouts/        # 布局元件
├── views/          # 頁面元件
├── router/         # 路由配置
├── store/          # 狀態管理
├── services/       # API 服務
├── utils/          # 工具函數
├── types/          # TypeScript 類型定義
├── styles/         # 全局樣式
├── locales/        # 國際化文件
└── mock/           # 模擬數據

```

### 2.2 命名規範
- 元件文件：PascalCase（例如：`UserProfile.vue`）
- 工具函數：camelCase（例如：`formatDate.ts`）
- 樣式文件：kebab-case（例如：`main-layout.scss`）
- 測試文件：與被測試文件同名，加上 `.test` 或 `.spec`

## 3. 國際化（i18n）規範

### 3.1 翻譯文件組織
```
src/locales/
├── common/           # 公共翻譯
│   ├── zh.json      # 中文公共翻譯
│   └── en.json      # 英文公共翻譯
├── components/       # 元件翻譯
├── views/           # 頁面翻譯
│   └── module/      # 模組名稱
│       └── Component/  # 元件名稱
│           ├── zh.json  # 中文翻譯
│           └── en.json  # 英文翻譯
├── system/          # 系統相關翻譯
└── params/          # 參數相關翻譯
```

### 3.2 翻譯鍵值命名
- 使用 camelCase
- 遵循 `moduleNamespace.category.specificName` 格式
- 例如：`alert.settings.title`
- 公共翻譯必須放在 `common` 命名空間下，例如：`common.table.total`

### 3.3 翻譯使用規範
```vue
<template>
  <div>{{ t('moduleName.componentName.title') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
// 必須導入所需的所有翻譯文件
import zhLocale from '@/locales/views/module/Component/zh.json'
import enLocale from '@/locales/views/module/Component/en.json'
import commonZhLocale from '@/locales/common/zh.json'
import commonEnLocale from '@/locales/common/en.json'

// 統一的消息格式
const messages = {
  zh: {
    ...zhLocale,
    ...commonZhLocale
  },
  en: {
    ...enLocale,
    ...commonEnLocale
  }
}

// 統一使用 legacy: false 配置
const { t } = useI18n({
  messages,
  legacy: false
})
</script>
```

### 3.4 翻譯檢查清單
在開發新組件時，必須檢查：
- [ ] 是否導入了所有必要的翻譯文件（包括 common）
- [ ] 是否使用了統一的 i18n 配置（legacy: false）
- [ ] 翻譯鍵是否遵循正確的命名空間
- [ ] 公共翻譯是否放在 common 命名空間下
- [ ] 是否所有使用的翻譯鍵都有對應的翻譯內容

### 3.5 翻譯維護規範
- 新增翻譯時，必須同時添加中英文兩種語言
- 修改翻譯時，必須同時修改中英文兩種語言
- 刪除翻譯時，必須同時刪除中英文兩種語言
- 定期使用工具檢查未使用的翻譯和缺失的翻譯
- 建議使用 TypeScript 的類型檢查來確保翻譯鍵的正確性

### 3.6 翻譯文件結構規範
每個翻譯文件應該遵循以下結構：
```json
{
  "moduleNamespace": {
    "componentName": {
      "section": {
        "key": "value"
      }
    }
  }
}
```

公共翻譯文件（common）應該遵循以下結構：
```json
{
  "common": {
    "action": {
      "search": "搜索",
      "reset": "重置"
    },
    "table": {
      "total": "共 {total} 條"
    }
  }
}
```

## 4. 其他規範

### 4.1 Vue 元件規範
- 使用 Composition API
- 元件名稱使用 PascalCase
- Props 定義要包含類型和默認值
- 事件名稱使用 kebab-case

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()
</script>
```

### 4.2 TypeScript 規範
- 優先使用 interface 而非 type
- 明確定義函數參數和返回值類型
- 使用 enum 定義常量
- 避免使用 any
- 對於無法解決的類型錯誤，可以使用 // @ts-ignore 暫時忽略

#### 4.2.1 Vue 文件類型聲明
為了支持 TypeScript 環境中導入 `.vue` 文件，需要添加以下基本類型聲明：
```typescript
// src/types/shims-vue.d.ts
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
```

### 4.3 Git 提交規範
提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

類型（type）：
- feat: 新功能
- fix: 修復
- docs: 文檔
- style: 格式
- refactor: 重構
- test: 測試
- chore: 構建過程或輔助工具的變動

### 4.4 代碼品質規範
- 使用 ESLint 進行代碼檢查
- 使用 Prettier 進行代碼格式化
- 遵循 Vue 3 官方風格指南
- 編寫單元測試，保持測試覆蓋率

### 4.5 性能優化規範
- 路由懶加載
- 圖片懶加載
- 組件按需引入
- 合理使用緩存
- 避免不必要的計算和渲染

## 5. 共用組件使用規範

### 5.1 選擇器組件規範
```
src/components/selectors/         # 選擇器類共用組件
├── DateRangeSelect.vue          # 日期範圍選擇
├── WalletTypeSelect.vue         # 錢包類型選擇
├── ChainTypeSelect.vue          # 鏈類型選擇
├── CurrencySelect.vue           # 幣種選擇
└── ...
```

### 5.2 選擇器組件使用方式
```vue
<template>
  <date-range-select
    v-model:value="searchForm.dateRange"
    :placeholder="[t('common.startDate'), t('common.endDate')]"
  />
  
  <wallet-type-select
    v-model:value="searchForm.walletType"
    :placeholder="t('common.pleaseSelect')"
  />
  
  <chain-type-select
    v-model:value="searchForm.chainType"
    :placeholder="t('common.pleaseSelect')"
  />
  
  <currency-select
    v-model:value="searchForm.currency"
    :placeholder="t('common.pleaseSelect')"
  />
</template>

<script setup lang="ts">
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import WalletTypeSelect from '@/components/selectors/WalletTypeSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
</script>
```

### 5.3 共用組件使用規範
- 優先使用共用組件，避免重複開發
- 共用組件必須支持 `v-model` 雙向綁定
  - 使用 `v-model` 而不是 `v-model:value`
  - 在組件內部使用 `defineProps` 和 `defineEmits` 定義 `modelValue` 和 `update:modelValue`
  - 組件內部的值更新應該通過 `emit('update:modelValue', newValue)` 進行
- 共用組件必須支持國際化
- 共用組件必須定義清晰的 Props 和事件接口
- 共用組件的樣式應該可配置，但提供合理的默認值

### 5.4 共用組件開發示例
```vue
<script setup lang="ts">
// 在共用組件內部使用 defineProps 和 defineEmits
const props = defineProps<{
  modelValue: any // 根據具體需求定義類型
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// 處理值的變更
const handleChange = (value: any) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <a-select
    :value="modelValue"
    :placeholder="placeholder"
    @update:value="handleChange"
  >
    <!-- 選項內容 -->
  </a-select>
</template>
```

### 5.5 共用組件使用示例
```vue
<template>
  <currency-select
    v-model="searchForm.currency"
    :placeholder="t('common.pleaseSelect')"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'

const searchForm = reactive({
  currency: undefined
})
</script>
```

### 5.6 共用組件維護規範
- 修改共用組件時需考慮所有使用該組件的地方
- 共用組件的 Props 變更需要遵循向後兼容原則
- 共用組件需要有完整的文檔和使用示例
- 共用組件需要有單元測試覆蓋
