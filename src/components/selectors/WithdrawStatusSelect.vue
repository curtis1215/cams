<template>
  <a-select
    :value="modelValue"
    :placeholder="t('common.prompt.selectStatus')"
    allow-clear
    style="width: 100%"
    @update:value="$emit('update:modelValue', $event)"
  >
    <a-select-option value="waiting">{{ t('common.status.waiting') }}</a-select-option>
    <a-select-option value="confirming">{{ t('common.status.confirming') }}</a-select-option>
    <a-select-option value="processing">{{ t('common.status.processing') }}</a-select-option>
    <a-select-option value="retrying">{{ t('common.status.retrying') }}</a-select-option>
    <a-select-option value="success">{{ t('common.status.success') }}</a-select-option>
    <a-select-option value="failed">{{ t('common.status.failed') }}</a-select-option>
  </a-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  modelValue: {
    type: String,
    default: undefined
  }
})

defineEmits(['update:modelValue'])
</script> 