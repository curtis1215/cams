<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectOrderStatus')"
    :style="style"
    allow-clear
    @update:value="handleChange"
  >
    <a-select-option v-for="item in statusOptions" :key="item.value" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/SwapStatusSelect/zh.json'
import enLocale from '@/locales/components/SwapStatusSelect/en.json'

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

// SWAP訂單狀態選項
const statusOptions = [
  { value: 'pending', label: t('status.pending') },
  { value: 'processing', label: t('status.processing') },
  { value: 'swapSuccess', label: t('status.swapSuccess') },
  { value: 'swapFailed', label: t('status.swapFailed') },
  { value: 'manualConfirm', label: t('status.manualConfirm') }
]

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
}
</script>

<style>
/* 移除全局樣式，改為使用 common.css 中的樣式 */
</style> 