<template>
  <a-range-picker
    v-model:value="dateRange"
    :placeholder="[t('startDate'), t('endDate')]"
    :style="style"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
</script> 