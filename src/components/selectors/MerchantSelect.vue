<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectMerchant')"
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
import zhLocale from '@/locales/common/zh.json'
import enLocale from '@/locales/common/en.json'

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
/* 移除全局樣式，改為使用 common.css 中的樣式 */
</style>