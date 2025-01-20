<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectCurrency')"
    :style="style"
    allow-clear
    @update:value="handleChange"
  >
    <a-select-option v-for="item in currencies" :key="item.value" :value="item.value">
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

// 幣種選項
const currencies = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'USDC', label: 'USD Coin (USDC)' }
]

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
}
</script>

<style>
/* 移除全局樣式，改為使用 common.css 中的樣式 */
</style>