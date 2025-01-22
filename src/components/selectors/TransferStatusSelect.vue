<template>
  <a-select
    v-model:value="value"
    :placeholder="t('placeholder')"
    :allowClear="true"
    @change="handleChange"
  >
    <a-select-option v-for="status in statusList" :key="status" :value="status">
      {{ t(`status.${status}`) }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/TransferStatusSelect/zh.json'
import enLocale from '@/locales/components/TransferStatusSelect/en.json'

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const statusList = ['pending', 'processing', 'manualConfirm', 'success', 'failed']

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}
</script>