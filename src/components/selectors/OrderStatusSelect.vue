<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('prompt.selectStatus')"
    :style="style"
    allow-clear
    @update:value="handleChange"
  >
    <a-select-option v-for="item in statusOptions" :key="item.value" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const statusOptions = [
  { value: 'confirming', label: t('status.confirming') },
  { value: 'successful', label: t('status.success') },
  { value: 'failed', label: t('status.failed') }
]

const handleChange = (value) => {
  emit('update:modelValue', value)
}
</script> 