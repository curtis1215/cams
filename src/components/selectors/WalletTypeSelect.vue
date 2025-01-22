<template>
  <a-select
    :value="modelValue"
    :placeholder="$t('common.prompt.selectWalletType')"
    :style="style"
    allow-clear
    @change="handleChange"
  >
    <a-select-option v-for="type in walletTypes" :key="type.value" :value="type.value">
      {{ type.label }}
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

// 錢包類型選項
const options = computed(() => [
  { value: 'user', label: t('common.wallet.walletType.user') },
  { value: 'collection', label: t('common.wallet.walletType.collection') },
  { value: 'withdrawal', label: t('common.wallet.walletType.withdrawal') },
  { value: 'transfer', label: t('common.wallet.walletType.transfer') }
])

// 處理選擇變更
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script> 