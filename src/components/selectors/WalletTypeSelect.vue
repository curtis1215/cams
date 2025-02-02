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

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/components/WalletTypeSelect/zh.json'

interface WalletTypeOption {
  value: string;
  label: string;
}

const messages = {
  zh: zhLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const props = defineProps<{
  modelValue?: string;
  style?: Record<string, string>;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void;
  (e: 'change', value: string | undefined): void;
}>()

// 錢包類型選項
const options = computed<WalletTypeOption[]>(() => [
  { value: 'user', label: t('walletType.user') },
  { value: 'collection', label: t('walletType.collection') },
  { value: 'withdrawal', label: t('walletType.withdrawal') },
  { value: 'transfer', label: t('walletType.transfer') },
  { value: 'project', label: t('walletType.project') }
])

// 處理選擇變更
const handleChange = (value: string | undefined) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script> 