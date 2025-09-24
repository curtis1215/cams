<template>
  <a-select
    :value="modelValue"
    :placeholder="t('currencySelect.placeholder')"
    :style="style"
    show-search
    :filter-option="filterOption"
    allow-clear
    @update:value="handleChange"
  >
    <a-select-option v-for="item in currencies" :key="item.value" :value="item.value">
      {{ t(`currencySelect.options.${item.value}`) }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/CurrencySelect/zh.json'
import enLocale from '@/locales/components/CurrencySelect/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

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
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'USDT', label: 'USDT' },
  { value: 'USDC', label: 'USDC' },
  { value: 'BNB', label: 'BNB' },
  { value: 'BUSD', label: 'BUSD' },
  { value: 'TRX', label: 'TRX' }
]

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
}

// 搜索過濾功能
const filterOption = (input, option) => {
  const translatedText = t(`currencySelect.options.${option.value}`)
  return (
    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    translatedText.toLowerCase().indexOf(input.toLowerCase()) >= 0
  )
}
</script>

<style>
/* 移除全局樣式，改為使用 common.css 中的樣式 */
</style>