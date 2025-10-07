<template>
  <div class="system-params">
    <!-- 域名配置 -->
    <a-card :bordered="false" class="params-card">
      <template #title>
        <div class="card-title-wrapper">
          <span class="card-title">{{ t('title.domainConfiguration') }}</span>
          <a-button
            type="primary"
            @click="showAddDomainModal"
          >
            {{ t('action.add') }}
          </a-button>
        </div>
      </template>

      <!-- 域名列表表格 -->
      <a-table
        :columns="domainColumns"
        :data-source="paginatedDomains"
        :pagination="false"
        row-key="id"
        size="middle"
        class="domain-table"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'domainName'">
            {{ record.domainName }}
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>
          <template v-else-if="column.key === 'updateTime'">
            {{ formatDateTime(record.updateTime) }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-popconfirm
              :title="t('message.deleteConfirm')"
              @confirm="handleDeleteDomain(record.id)"
              :ok-text="t('action.confirm')"
              :cancel-text="t('action.cancel')"
            >
              <a-button
                type="link"
                danger
                size="small"
              >
                {{ t('action.delete') }}
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <!-- 分頁 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="domains.length"
          :show-size-changer="false"
          :show-quick-jumper="false"
          :show-total="(total, range) => t('message.pagination', { start: range[0], end: range[1], total })"
          size="small"
        />
      </div>
    </a-card>

    <!-- 新增域名彈窗 -->
    <a-modal
      v-model:open="addDomainModalOpen"
      :title="t('title.addDomain')"
      width="500px"
      @ok="handleConfirmAddDomain"
      :ok-text="t('action.confirm')"
      :cancel-text="t('action.cancel')"
      :confirm-loading="addingDomain"
    >
      <a-form
        ref="addDomainFormRef"
        :model="addDomainForm"
        :rules="addDomainRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item
          :label="t('field.domainName')"
          name="domainName"
        >
          <a-input
            v-model:value="addDomainForm.domainName"
            :placeholder="t('prompt.inputDomain')"
            @keydown.enter="handleConfirmAddDomain"
          />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'

// i18n 配置
const messages = {
  zh: {
    title: {
      domainConfiguration: '域名配置',
      addDomain: '新增域名'
    },
    field: {
      index: '序號',
      domainName: '域名名稱',
      createTime: '創建時間',
      updateTime: '更新時間',
      operation: '操作'
    },
    prompt: {
      inputDomain: '請輸入域名'
    },
    message: {
      invalidDomain: '請輸入有效的域名',
      duplicateDomain: '該域名已存在',
      saveSuccess: '儲存成功',
      saveFailed: '儲存失敗',
      deleteConfirm: '確定要刪除此域名嗎？',
      deleteSuccess: '刪除成功',
      deleteFailed: '刪除失敗',
      addSuccess: '新增成功',
      addFailed: '新增失敗',
      pagination: '顯示第 {start} 到第 {end} 項，共 {total} 項'
    },
    action: {
      save: '儲存',
      add: '新增',
      delete: '刪除',
      confirm: '確定',
      cancel: '取消'
    }
  },
  en: {
    title: {
      domainConfiguration: 'Domain Configuration',
      addDomain: 'Add Domain'
    },
    field: {
      index: 'Index',
      domainName: 'Domain Name',
      createTime: 'Create Time',
      updateTime: 'Update Time',
      operation: 'Operation'
    },
    prompt: {
      inputDomain: 'Please enter domain name'
    },
    message: {
      invalidDomain: 'Please enter a valid domain',
      duplicateDomain: 'This domain already exists',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed',
      deleteConfirm: 'Are you sure you want to delete this domain?',
      deleteSuccess: 'Delete successfully',
      deleteFailed: 'Delete failed',
      addSuccess: 'Add successfully',
      addFailed: 'Add failed',
      pagination: 'Showing {start} to {end} of {total} items'
    },
    action: {
      save: 'Save',
      add: 'Add',
      delete: 'Delete',
      confirm: 'Confirm',
      cancel: 'Cancel'
    }
  }
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 域名相關數據
interface DomainItem {
  id: number
  domainName: string
  createTime: string
  updateTime: string
}

const domains = ref<DomainItem[]>([
  {
    id: 1,
    domainName: 'example.com',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    domainName: 'test.example.com',
    createTime: '2024-02-20 14:20:00',
    updateTime: '2024-02-20 14:20:00'
  }
])

// 分頁數據
const currentPage = ref(1)
const pageSize = ref(5)

// 表格列配置
const domainColumns = [
  {
    title: t('field.index'),
    key: 'index',
    width: 80,
    align: 'center' as const
  },
  {
    title: t('field.domainName'),
    key: 'domainName',
    align: 'left' as const
  },
  {
    title: t('field.createTime'),
    key: 'createTime',
    width: 180,
    align: 'center' as const
  },
  {
    title: t('field.updateTime'),
    key: 'updateTime',
    width: 180,
    align: 'center' as const
  },
  {
    title: t('field.operation'),
    key: 'operation',
    width: 120,
    align: 'center' as const
  }
]

// 分頁數據計算
const paginatedDomains = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return domains.value.slice(start, end)
})

// 新增域名彈窗
const addDomainModalOpen = ref(false)
const addingDomain = ref(false)
const addDomainFormRef = ref<FormInstance>()
const addDomainForm = reactive({
  domainName: ''
})

// 表單驗證規則
const addDomainRules: Record<string, Rule[]> = {
  domainName: [
    { required: true, message: t('message.invalidDomain'), trigger: 'blur' },
    {
      validator: (_, value) => {
        if (!value) return Promise.reject(t('message.invalidDomain'))
        if (!isValidDomain(value)) return Promise.reject(t('message.invalidDomain'))
        if (domains.value.some(item => item.domainName === value)) {
          return Promise.reject(t('message.duplicateDomain'))
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 驗證域名格式的函數
const isValidDomain = (domain: string): boolean => {
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
  return pattern.test(domain)
}

// 格式化日期時間
const formatDateTime = (dateTime: string): string => {
  return dateTime
}

// 顯示新增域名彈窗
const showAddDomainModal = () => {
  addDomainModalOpen.value = true
  addDomainForm.domainName = ''
  if (addDomainFormRef.value) {
    addDomainFormRef.value.resetFields()
  }
}

// 確定新增域名
const handleConfirmAddDomain = async () => {
  try {
    await addDomainFormRef.value?.validate()
    addingDomain.value = true

    const newId = Math.max(...domains.value.map(d => d.id), 0) + 1
    const now = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-').replace(',', '')

    const newDomain: DomainItem = {
      id: newId,
      domainName: addDomainForm.domainName.trim(),
      createTime: now,
      updateTime: now
    }

    // TODO: 這裡添加實際的 API 調用
    await new Promise(resolve => setTimeout(resolve, 500))

    domains.value.push(newDomain)
    message.success(t('message.addSuccess'))
    addDomainModalOpen.value = false
  } catch (error) {
    console.error('Add domain failed:', error)
    if (error !== 'validation failed') {
      message.error(t('message.addFailed'))
    }
  } finally {
    addingDomain.value = false
  }
}

// 刪除域名
const handleDeleteDomain = async (id: number) => {
  try {
    // TODO: 這裡添加實際的 API 調用
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = domains.value.findIndex(item => item.id === id)
    if (index !== -1) {
      domains.value.splice(index, 1)
      message.success(t('message.deleteSuccess'))

      // 如果當前頁沒有數據且不是第一頁，則回到上一頁
      const totalPages = Math.ceil(domains.value.length / pageSize.value)
      if (currentPage.value > totalPages && currentPage.value > 1) {
        currentPage.value = totalPages || 1
      }
    }
  } catch (error) {
    message.error(t('message.deleteFailed'))
    console.error('Delete domain failed:', error)
  }
}

</script>

<style scoped>
.system-params {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.domain-table {
  margin-bottom: 16px;
}

.domain-table :deep(.ant-table) {
  background-color: transparent;
}

.domain-table :deep(.ant-table-thead > tr > th) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.domain-table :deep(.ant-table-tbody > tr) {
  background-color: transparent;
}

.domain-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #303030;
  color: rgba(255, 255, 255, 0.85);
}

.domain-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: rgba(255, 255, 255, 0.05);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #303030;
}

.pagination-wrapper :deep(.ant-pagination) {
  color: rgba(255, 255, 255, 0.85);
}

.pagination-wrapper :deep(.ant-pagination-item) {
  background-color: #1f1f1f;
  border-color: #434343;
}

.pagination-wrapper :deep(.ant-pagination-item a) {
  color: rgba(255, 255, 255, 0.85);
}

.pagination-wrapper :deep(.ant-pagination-item:hover) {
  border-color: var(--ant-primary-color);
}

.pagination-wrapper :deep(.ant-pagination-item-active) {
  background-color: var(--ant-primary-color);
  border-color: var(--ant-primary-color);
}

.pagination-wrapper :deep(.ant-pagination-item-active a) {
  color: white;
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

/* 彈窗樣式 */
:deep(.ant-modal) {
  .ant-modal-content {
    background-color: #141414;
    border: 1px solid #303030;
  }

  .ant-modal-header {
    background-color: #1f1f1f;
    border-bottom: 1px solid #303030;
  }

  .ant-modal-title {
    color: rgba(255, 255, 255, 0.85);
  }

  .ant-modal-body {
    background-color: #141414;
  }

  .ant-modal-footer {
    background-color: #141414;
    border-top: 1px solid #303030;
  }
}

/* 確認彈窗樣式 */
:deep(.ant-popconfirm) {
  .ant-popover-inner {
    background-color: #141414;
    border: 1px solid #303030;
  }

  .ant-popover-inner-content {
    color: rgba(255, 255, 255, 0.85);
  }

  .ant-popover-arrow::before,
  .ant-popover-arrow::after {
    background-color: #141414;
    border-color: #303030;
  }
}

:deep(.ant-btn) {
  background-color: var(--ant-primary-color);
  border-color: var(--ant-primary-color);
}

:deep(.ant-btn:hover) {
  opacity: 0.9;
}

</style> 