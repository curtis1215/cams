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
├── components/       # 元件翻譯
├── views/           # 頁面翻譯
├── system/          # 系統相關翻譯
└── params/          # 參數相關翻譯
```

### 3.2 翻譯鍵值命名
- 使用 camelCase
- 遵循 `moduleNamespace.category.specificName` 格式
- 例如：`alert.settings.title`

### 3.3 翻譯使用規範
```vue
<template>
  <div>{{ $t('moduleName.componentName.title') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
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