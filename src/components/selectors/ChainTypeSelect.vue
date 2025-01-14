<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('pleaseSelectChainType')"
    show-search
    :filter-option="filterOption"
    allow-clear
    @update:value="handleChange"
  >
    <a-select-option v-for="item in chainTypes" :key="item.value" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
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
}

const filterOption = (input, option) => {
  return (
    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  )
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