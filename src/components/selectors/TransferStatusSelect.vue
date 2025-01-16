<template>
  <a-select
    :value="modelValue"
    :placeholder="t('pleaseSelectStatus')"
    allow-clear
    style="width: 100%"
    @update:value="$emit('update:modelValue', $event)"
  >
    <a-select-option value="pending">{{ t('pending') }}</a-select-option>
    <a-select-option value="processing">{{ t('processing') }}</a-select-option>
    <a-select-option value="manualConfirm">{{ t('manualConfirm') }}</a-select-option>
    <a-select-option value="success">{{ t('success') }}</a-select-option>
    <a-select-option value="failed">{{ t('failed') }}</a-select-option>
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