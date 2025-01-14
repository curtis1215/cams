<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('pleaseSelectChainType')"
    :style="style"
    show-search
    :filter-option="filterOption"
    allow-clear
    @change="handleChange"
  >
    <a-select-option v-for="type in chainTypes" :key="type.value" :value="type.value">
      {{ type.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined
  },
  style: {
    type: Object,
    default: () => ({ width: '200px' })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 鏈類型選項
const chainTypes = [
  { value: 'evm', label: 'EVM' },
  { value: 'btc', label: 'BTC' },
  { value: 'tron', label: 'TRON' },
  { value: 'eos', label: 'EOS' }
]

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 搜索過濾邏輯
const filterOption = (input, option) => {
  const label = option?.label?.toLowerCase() || ''
  const value = option?.value?.toLowerCase() || ''
  const searchText = input.toLowerCase()
  return label.includes(searchText) || value.includes(searchText)
}
</script>

<style scoped>
:deep(.ant-select-selector) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
}

:deep(.ant-select-selection-placeholder),
:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-select-dropdown) {
  background-color: #1f1f1f;
  border: 1px solid #303030;
}

:deep(.ant-select-item) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-select-item-option-active) {
  background-color: rgba(255, 255, 255, 0.08);
}

:deep(.ant-select-item-option-selected) {
  background-color: #111b26;
}

:deep(.ant-select-clear) {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-select-clear:hover) {
  color: rgba(255, 255, 255, 0.75);
}
</style> 