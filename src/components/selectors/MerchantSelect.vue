<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('prompt.selectMerchant')"
    :style="style"
    allow-clear
    @update:value="handleChange"
  >
    <a-select-option v-for="item in merchants" :key="item.value" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// 商戶選項
const merchants = [
  { value: 'all', label: t('field.allMerchants') },
  { value: 'fameex', label: 'Fameex' },
  { value: 'cnx', label: 'CNX' }
]

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
}
</script>

<style>
/* 使用全局樣式，避免 Menu 組件的樣式問題 */
.ant-select-dropdown {
  background-color: var(--background-color) !important;
  border-color: var(--border-color) !important;
}

.ant-select-item {
  color: var(--text-color) !important;
}

.ant-select-item-option-selected {
  background-color: var(--item-hover-bg) !important;
}

.ant-select-item-option-active {
  background-color: var(--item-hover-bg) !important;
}

.ant-select-selector {
  background-color: var(--component-background) !important;
  border-color: var(--border-color) !important;
  color: var(--text-color) !important;
}

.ant-select-selection-placeholder {
  color: var(--text-color-secondary) !important;
}
</style>