<template>
  <a-select
    :value="modelValue"
    :placeholder="t('pleaseSelectTransferType')"
    :allow-clear="true"
    @change="handleChange"
  >
    <a-select-option value="deposit">{{ t('deposit') }}</a-select-option>
    <a-select-option value="withdraw">{{ t('withdraw') }}</a-select-option>
    <a-select-option value="collection">{{ t('collection') }}</a-select-option>
    <a-select-option value="exchange">{{ t('exchange') }}</a-select-option>
    <a-select-option value="replenish">{{ t('replenish') }}</a-select-option>
    <a-select-option value="manual">{{ t('manual') }}</a-select-option>
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
