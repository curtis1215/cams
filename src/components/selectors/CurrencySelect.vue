<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('pleaseSelectCurrency')"
    :style="style"
    allow-clear
    @change="handleChange"
  >
    <a-select-option v-for="currency in currencies" :key="currency.value" :value="currency.value">
      {{ currency.label }}
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
  emit('change', value)
}
</script> 