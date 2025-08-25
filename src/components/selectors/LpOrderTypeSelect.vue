<template>
  <a-select
    :value="modelValue"
    @update:value="updateValue"
    :placeholder="t('prompt.selectOrderType')"
    allowClear
  >
    <a-select-option value="add">{{ t('orderType.add') }}</a-select-option>
    <a-select-option value="remove">{{ t('orderType.remove') }}</a-select-option>
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