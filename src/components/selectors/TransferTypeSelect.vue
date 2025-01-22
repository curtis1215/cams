<template>
  <a-select
    :value="modelValue"
    :placeholder="t('common.prompt.selectTransferType')"
    :allow-clear="true"
    @change="handleChange"
  >
    <a-select-option value="deposit">{{ t('common.tx.deposit') }}</a-select-option>
    <a-select-option value="withdraw">{{ t('common.tx.withdraw') }}</a-select-option>
    <a-select-option value="collection">{{ t('common.tx.collection') }}</a-select-option>
    <a-select-option value="exchange">{{ t('common.tx.exchange') }}</a-select-option>
    <a-select-option value="replenish">{{ t('common.tx.replenish') }}</a-select-option>
    <a-select-option value="manual">{{ t('common.tx.manual') }}</a-select-option>
    <a-select-option value="pendingConfirm">{{ t('common.tx.pendingConfirm') }}</a-select-option>
    <a-select-option value="manualOut">{{ t('common.tx.manualOut') }}</a-select-option>
    <a-select-option value="manualIn">{{ t('common.tx.manualIn') }}</a-select-option>
    <a-select-option value="systemError">{{ t('common.tx.systemError') }}</a-select-option>
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
