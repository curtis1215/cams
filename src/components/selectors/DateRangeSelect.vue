<template>
  <a-range-picker
    v-model:value="dateRange"
    :placeholder="[t('field.startDate'), t('field.endDate')]"
    :style="style"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/DateRangeSelect/zh.json'
import enLocale from '@/locales/components/DateRangeSelect/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const dateRange = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  dateRange.value = newVal
})

const handleChange = (dates) => {
  emit('update:modelValue', dates)
}

const placeholder = [t('field.startDate'), t('field.endDate')]
</script> 