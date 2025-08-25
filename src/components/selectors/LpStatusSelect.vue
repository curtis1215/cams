<template>
  <a-select
    :value="modelValue"
    @update:value="updateValue"
    :placeholder="t('prompt.selectOrderStatus')"
    allowClear
  >
    <a-select-option value="pending">{{ t('status.pending') }}</a-select-option>
    <a-select-option value="processing">{{ t('status.processing') }}</a-select-option>
    <a-select-option value="lpSuccess">{{ t('status.lpSuccess') }}</a-select-option>
    <a-select-option value="lpFailed">{{ t('status.lpFailed') }}</a-select-option>
    <a-select-option value="manualConfirm">{{ t('status.manualConfirm') }}</a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/order/LP/zh.json'
import enLocale from '@/locales/order/LP/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

defineProps<{
  modelValue?: string | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const updateValue = (value: string | undefined) => {
  emit('update:modelValue', value)
}
</script>