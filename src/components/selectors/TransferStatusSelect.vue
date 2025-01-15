<template>
  <a-select
    :value="modelValue"
    :placeholder="t('pleaseSelectStatus')"
    allow-clear
    style="width: 100%"
    @update:value="$emit('update:modelValue', $event)"
  >
    <a-select-option value="submitted">{{ t('statusSubmitted') }}</a-select-option>
    <a-select-option value="onChain">{{ t('statusOnChain') }}</a-select-option>
    <a-select-option value="confirming">{{ t('statusConfirming') }}</a-select-option>
    <a-select-option value="completed">{{ t('statusCompleted') }}</a-select-option>
    <a-select-option value="failed">{{ t('statusFailed') }}</a-select-option>
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