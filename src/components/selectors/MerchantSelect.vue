<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('pleaseSelectMerchant')"
    :style="style"
    allow-clear
    @change="handleChange"
  >
    <a-select-option v-for="merchant in merchants" :key="merchant.value" :value="merchant.value">
      {{ merchant.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined
  },
  style: {
    type: Object,
    default: () => ({ width: '200px' })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 商戶選項
const merchants = [
  { value: 'all', label: t('allMerchants') },
  { value: 'fameex', label: 'Fameex' },
  { value: 'cnx', label: 'CNX' }
]

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script> 