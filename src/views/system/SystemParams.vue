<template>
  <div class="system-params">
    <a-card :bordered="false" class="params-card">
      <template #title>
        <span class="card-title">{{ t('title.googleLoginDomains') }}</span>
      </template>
      <div class="domain-input-section">
        <a-input
          v-model:value="domainInput"
          :placeholder="t('prompt.inputDomain')"
          @keydown.enter="handleAddDomain"
          @blur="handleAddDomain"
          style="width: 300px"
        />
      </div>
      <div class="domain-tags">
        <a-tag
          v-for="domain in domains"
          :key="domain"
          :closable="true"
          @close="handleRemoveDomain(domain)"
          class="domain-tag"
          :style="{ backgroundColor: getTagColor(domain) }"
        >
          {{ domain }}
        </a-tag>
      </div>
      <div class="card-footer">
        <a-button 
          type="primary" 
          :loading="saving" 
          @click="handleSave"
        >
          {{ t('action.save') }}
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'

// i18n 配置
const messages = {
  zh: {
    title: {
      googleLoginDomains: 'Google登入可接受域名'
    },
    prompt: {
      inputDomain: '請輸入域名，按 Enter 或失去焦點時添加'
    },
    message: {
      invalidDomain: '請輸入有效的域名',
      duplicateDomain: '該域名已存在',
      saveSuccess: '儲存成功',
      saveFailed: '儲存失敗'
    },
    action: {
      save: '儲存'
    }
  },
  en: {
    title: {
      googleLoginDomains: 'Accepted Domains for Google Login'
    },
    prompt: {
      inputDomain: 'Enter domain and press Enter or blur to add'
    },
    message: {
      invalidDomain: 'Please enter a valid domain',
      duplicateDomain: 'This domain already exists',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed'
    },
    action: {
      save: 'Save'
    }
  }
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 數據
const domainInput = ref('')
const domains = ref<string[]>([])
const saving = ref(false)

// 驗證域名格式的函數
const isValidDomain = (domain: string): boolean => {
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
  return pattern.test(domain)
}

// 在 script setup 部分添加計算標籤顏色的函數
const getTagColor = (domain: string): string => {
  // 使用域名的哈希值來決定顏色
  const colors = [
    'rgba(22, 119, 255, 0.15)',    // 藍色
    'rgba(82, 196, 26, 0.15)',     // 綠色
    'rgba(250, 173, 20, 0.15)',    // 黃色
    'rgba(255, 77, 79, 0.15)',     // 紅色
    'rgba(114, 46, 209, 0.15)',    // 紫色
    'rgba(19, 194, 194, 0.15)',    // 青色
    'rgba(245, 34, 45, 0.15)',     // 火紅色
    'rgba(250, 84, 28, 0.15)'      // 橙色
  ]
  
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// 處理添加域名
const handleAddDomain = () => {
  const domain = domainInput.value.trim()
  if (!domain) return

  if (!isValidDomain(domain)) {
    message.error(t('message.invalidDomain'))
    return
  }

  if (domains.value.includes(domain)) {
    message.error(t('message.duplicateDomain'))
    return
  }

  domains.value.push(domain)
  domainInput.value = ''
}

// 處理移除域名
const handleRemoveDomain = (domain: string) => {
  const index = domains.value.indexOf(domain)
  if (index !== -1) {
    domains.value.splice(index, 1)
  }
}

// 處理儲存
const handleSave = async () => {
  try {
    saving.value = true
    // TODO: 這裡添加實際的 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 調用
    message.success(t('message.saveSuccess'))
  } catch (error) {
    message.error(t('message.saveFailed'))
    console.error('Save failed:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.system-params {
  padding: 24px;
}

.params-card {
  background: #141414;
  border-radius: 8px;
  border: 1px solid #303030;
}

.params-card :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.params-card :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.params-card :deep(.ant-card-body) {
  background-color: #141414;
}

.domain-input-section {
  margin-bottom: 16px;
}

.domain-input-section :deep(.ant-input) {
  height: 32px;
}

.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.domain-tag {
  margin: 0;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  padding: 0 4px 0 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.domain-tag:hover {
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: brightness(1.1);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #303030;
}

/* 深色模式輸入框樣式 */
:deep(.ant-input) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-input:hover),
:deep(.ant-input:focus) {
  border-color: var(--ant-primary-color) !important;
}

:deep(.ant-tag) {
  background: transparent;
  border: none;
  margin: 0;
  padding: 4px;
  height: 100%;
  display: flex;
  align-items: center;
}

:deep(.ant-tag .anticon-close) {
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 3px;
}

:deep(.ant-tag .anticon-close:hover) {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
}

:deep(.ant-btn) {
  background-color: var(--ant-primary-color);
  border-color: var(--ant-primary-color);
}

:deep(.ant-btn:hover) {
  opacity: 0.9;
}
</style> 