<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectStatus')"
    allow-clear
    style="width: 100%"
    @update:value="$emit('update:modelValue', $event)"
  >
    <a-select-option value="waiting">{{ t('status.waiting') }}</a-select-option>
    <a-select-option value="confirming">{{ t('status.confirming') }}</a-select-option>
    <a-select-option value="processing">{{ t('status.processing') }}</a-select-option>
    <a-select-option value="retrying">{{ t('status.retrying') }}</a-select-option>
    <a-select-option value="success">{{ t('status.success') }}</a-select-option>
    <a-select-option value="failed">{{ t('status.failed') }}</a-select-option>
  </a-select>
</template>

<script setup>
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

defineProps({
  modelValue: {
    type: String,
    default: undefined
  }
})

defineEmits(['update:modelValue'])
</script> 