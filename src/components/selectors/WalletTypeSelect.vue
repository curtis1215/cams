<template>
  <a-select
    :value="modelValue"
    :placeholder="t('prompt.selectWalletType')"
    :style="style"
    allow-clear
    @change="handleChange"
  >
    <a-select-option v-for="type in options" :key="type.value" :value="type.value">
      {{ type.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/WalletTypeSelect/zh.json'

const messages = {
  zh: zhLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

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

// 錢包類型選項
const options = computed(() => [
  { value: 'user', label: t('walletType.user') },
  { value: 'collection', label: t('walletType.collection') },
  { value: 'withdrawal', label: t('walletType.withdrawal') },
  { value: 'transfer', label: t('walletType.transfer') }
])

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script> 