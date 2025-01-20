<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectChainType')"
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

<style>
/* 移除全局樣式，改為使用 common.css 中的樣式 */
</style>