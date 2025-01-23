<template>
  <a-select
    :value="modelValue"
    :placeholder="placeholder"
    :style="{ width: '180px' }"
    @change="handleChange"
    allowClear
  >
    <a-select-option v-for="role in roles" :key="role.value" :value="role.value">
      {{ role.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 角色列表
const roles = [
  { value: 'admin', label: '系統管理員' },
  { value: 'operator', label: '操作員' },
  { value: 'viewer', label: '查看者' }
]

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script> 