<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectTransferType')"
    :allow-clear="true"
    @change="handleChange"
  >
    <a-select-option value="deposit">{{ t('tx.deposit') }}</a-select-option>
    <a-select-option value="withdraw">{{ t('tx.withdraw') }}</a-select-option>
    <a-select-option value="collection">{{ t('tx.collection') }}</a-select-option>
    <a-select-option value="exchange">{{ t('tx.exchange') }}</a-select-option>
    <a-select-option value="replenish">{{ t('tx.replenish') }}</a-select-option>
    <a-select-option value="manual">{{ t('tx.manual') }}</a-select-option>
    <a-select-option value="pendingConfirm">{{ t('tx.pendingConfirm') }}</a-select-option>
    <a-select-option value="manualOut">{{ t('tx.manualOut') }}</a-select-option>
    <a-select-option value="manualIn">{{ t('tx.manualIn') }}</a-select-option>
    <a-select-option value="systemError">{{ t('tx.systemError') }}</a-select-option>
  </a-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
