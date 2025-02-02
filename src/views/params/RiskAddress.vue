<template>
  <div class="risk-address-container">
    <!-- 查詢卡片 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('params.riskAddress.search.title') }}</span>
      </template>
      <a-form :model="searchForm" class="query-form">
        <div class="form-row">
          <div class="form-item-md">
            <a-form-item :label="t('params.riskAddress.search.address')">
              <a-input
                v-model:value="searchForm.address"
                :placeholder="t('params.riskAddress.search.placeholder.address')"
              />
            </a-form-item>
          </div>
          <div class="form-item-sm">
            <div class="button-group">
              <a-button type="primary" @click="handleSearch">
                {{ t('params.riskAddress.button.search') }}
              </a-button>
            </div>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <span class="card-title">{{ t('params.riskAddress.list.title') }}</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          {{ t('params.riskAddress.button.add') }}
        </a-button>
      </template>
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-tooltip :title="t('params.riskAddress.button.edit')">
                  <edit-outlined
                    class="action-icon edit"
                    @click="handleEdit(record)"
                  />
                </a-tooltip>
                <a-tooltip :title="t('params.riskAddress.button.delete')">
                  <delete-outlined
                    class="action-icon delete"
                    @click="handleDelete(record)"
                  />
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 新增/編輯彈窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" :rules="rules">
        <a-form-item :label="t('params.riskAddress.list.chainType')" name="chainType">
          <chain-type-select
            v-model:value="formData.chainType"
            :placeholder="t('params.riskAddress.modal.placeholder.chainType')"
            @change="(value) => formData.chainType = value"
          />
        </a-form-item>
        <a-form-item :label="t('params.riskAddress.list.address')" name="address">
          <a-input
            v-model:value="formData.address"
            :placeholder="t('params.riskAddress.modal.placeholder.address')"
          />
        </a-form-item>
        <a-form-item :label="t('params.riskAddress.list.reason')" name="reason">
          <a-textarea
            v-model:value="formData.reason"
            :placeholder="t('params.riskAddress.modal.placeholder.reason')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TablePaginationConfig } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import zhLocale from '@/locales/params/RiskAddress/zh.json'
import enLocale from '@/locales/params/RiskAddress/en.json'
import mockData from '@/mock/params/riskAddress/list.mock.json'

const { t } = useI18n({
  messages: {
    zh: zhLocale,
    en: enLocale
  },
  legacy: false
})

// 查詢表單
const searchForm = reactive({
  address: ''
})

// 表格列定義
const columns = [
  {
    title: t('params.riskAddress.list.chainType'),
    dataIndex: 'chainType',
    key: 'chainType'
  },
  {
    title: t('params.riskAddress.list.address'),
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: t('params.riskAddress.list.reason'),
    dataIndex: 'reason',
    key: 'reason'
  },
  {
    title: t('params.riskAddress.list.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime'
  },
  {
    title: t('common.action'),
    key: 'action'
  }
]

// 表格數據
const tableData = ref(mockData.data.list)
const pagination = reactive<TablePaginationConfig>({
  total: mockData.data.total,
  current: 1,
  pageSize: 10
})

// 彈窗相關
const modalVisible = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const modalTitle = computed(() => {
  return modalType.value === 'add'
    ? t('params.riskAddress.modal.add')
    : t('params.riskAddress.modal.edit')
})

interface FormData {
  chainType: string | undefined
  address: string
  reason: string
}

const formData = reactive<FormData>({
  chainType: undefined,
  address: '',
  reason: ''
})

const rules = {
  chainType: [{ required: true, message: t('params.riskAddress.modal.placeholder.chainType') }],
  address: [{ required: true, message: t('params.riskAddress.modal.placeholder.address') }],
  reason: [{ required: true, message: t('params.riskAddress.modal.placeholder.reason') }]
}

// 處理函數
const handleSearch = () => {
  // TODO: 實現查詢邏輯
}

const handleAdd = () => {
  modalType.value = 'add'
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  modalType.value = 'edit'
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleDelete = (record: any) => {
  // TODO: 實現刪除邏輯
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  handleSearch()
}

const handleModalOk = () => {
  // TODO: 實現新增/編輯邏輯
  modalVisible.value = false
}

const handleModalCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped>
.risk-address-container {
  padding: 24px;
}

/* 使用專案規範中定義的卡片樣式 */
.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

:deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

:deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

:deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

:deep(.ant-card-body) {
  background-color: #141414;
  padding: 20px 24px;
}

/* 表單布局 */
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.form-item-md { flex: 1.5; min-width: 0; }
.form-item-sm { flex: 1; min-width: 0; }

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

/* 表格樣式 */
:deep(.ant-table) {
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background: #1f1f1f;
  border-bottom: 1px solid #303030;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #303030;
}

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.ant-pagination-item-link) {
  background: transparent !important;
  border-color: #303030 !important;
}

:deep(.ant-pagination-item) {
  background: transparent !important;
  border-color: #303030 !important;
}

:deep(.ant-pagination-item-active) {
  border-color: #177ddc !important;
}

/* 操作圖標樣式 */
.action-icon {
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
}

.action-icon.edit {
  color: #1890ff;
}

.action-icon.edit:hover {
  color: #40a9ff;
}

.action-icon.delete {
  color: #ff4d4f;
}

.action-icon.delete:hover {
  color: #ff7875;
}
</style> 