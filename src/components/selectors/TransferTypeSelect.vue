<template>
  <a-select
    v-model:value="value"
    :placeholder="t('placeholder')"
    :allowClear="true"
    @change="handleChange"
  >
    <a-select-option v-for="type in typeList" :key="type" :value="type">
      {{ t(`type.${type}`) }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/TransferTypeSelect/zh.json'
import enLocale from '@/locales/components/TransferTypeSelect/en.json'

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

const typeList = [
  'manualOut',
  'manualIn',
  'systemError',
  'deposit',
  'withdraw',
  'collection',
  'exchange',
  'replenish',
  'manual',
  'pendingConfirm'
]

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}
</script>
