<template>
  <a-select
    :value="modelValue"
    :placeholder="t('withdrawStatusSelect.placeholder')"
    allow-clear
    style="width: 100%"
    @update:value="$emit('update:modelValue', $event)"
  >
    <a-select-option value="waiting">{{ t('withdrawStatusSelect.options.waiting') }}</a-select-option>
    <a-select-option value="confirming">{{ t('withdrawStatusSelect.options.confirming') }}</a-select-option>
    <a-select-option value="processing">{{ t('withdrawStatusSelect.options.processing') }}</a-select-option>
    <a-select-option value="retrying">{{ t('withdrawStatusSelect.options.retrying') }}</a-select-option>
    <a-select-option value="success">{{ t('withdrawStatusSelect.options.successful') }}</a-select-option>
    <a-select-option value="failed">{{ t('withdrawStatusSelect.options.failed') }}</a-select-option>
  </a-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/WithdrawStatusSelect/zh.json'
import enLocale from '@/locales/components/WithdrawStatusSelect/en.json'

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