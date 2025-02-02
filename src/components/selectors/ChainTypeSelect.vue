<template>
  <a-select
    v-model:value="selectedValue"
    :placeholder="placeholder"
    show-search
    :filter-option="filterOption"
    @change="handleChange"
  >
    <a-select-option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  value?: string
  placeholder?: string
}

interface Option {
  value: string
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  placeholder: '請選擇'
})

const emit = defineEmits<{
  (e: 'update:value', value: string | undefined): void
  (e: 'change', value: string): void
}>()

const selectedValue = ref<string | undefined>(props.value)

// 監聽外部值的變化
watch(() => props.value, (newValue) => {
  selectedValue.value = newValue
})

// 監聽內部值的變化
watch(selectedValue, (newValue) => {
  emit('update:value', newValue)
})

const options: Option[] = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'TRX', label: 'TRON (TRX)' },
  { value: 'BSC', label: 'BNB Smart Chain (BSC)' }
]

const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
         option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const handleChange = (value: string) => {
  emit('change', value)
}
</script>

<style>
/* 移除全局樣式，改為使用 common.css 中的樣式 */
</style>