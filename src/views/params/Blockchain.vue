<template>
  <div class="blockchain-management">
    <!-- 查詢卡片 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('title.blockchainQuery') }}</span>
      </template>
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item :label="t('field.chainType')" class="form-item">
          <chain-type-select 
            v-model="queryParams.chainType" 
            :placeholder="t('prompt.selectChainType')"
            :style="{ width: '180px' }" 
          />
        </a-form-item>
        <a-form-item class="form-item">
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            {{ t('action.search') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :bordered="false" :bodyStyle="{ padding: '20px 24px' }" class="table-card">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span class="card-title">{{ t('title.blockchainList') }}</span>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            {{ t('action.add') }}
          </a-button>
        </div>
      </template>
      
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          :bordered="true"
          :scroll="{ x: 1400 }"
          @change="handleTableChange"
        >
          <!-- 操作列自定義渲染 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <EditOutlined class="action-icon" @click="handleEdit(record)" />
                <DeleteOutlined class="action-icon" @click="handleDelete(record)" />
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
      @ok="handleModalConfirm"
      @cancel="handleModalCancel"
      :confirmLoading="confirmLoading"
      width="600px"
    >
      <a-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        layout="vertical"
      >
        <a-form-item :label="t('field.chainName')" name="chainName">
          <a-input
            v-model:value="formData.chainName"
            :placeholder="t('prompt.inputChainName')"
          />
        </a-form-item>

        <a-form-item :label="t('field.chainCode')" name="chainCode">
          <a-input
            v-model:value="formData.chainCode"
            :placeholder="t('prompt.inputChainCode')"
          />
        </a-form-item>

        <a-form-item :label="t('field.servicePath')" name="servicePath">
          <a-input
            v-model:value="formData.servicePath"
            :placeholder="t('prompt.inputServicePath')"
            :disabled="true"
            :value="'cryp-' + formData.chainCode"
          />
        </a-form-item>

        <a-form-item :label="t('field.confirmBlocks')" name="confirmBlocks">
          <a-input-number
            v-model:value="formData.confirmBlocks"
            :placeholder="t('prompt.inputConfirmBlocks')"
            :min="1"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item :label="t('field.unlockBlocks')" name="unlockBlocks">
          <a-input-number
            v-model:value="formData.unlockBlocks"
            :placeholder="t('prompt.inputUnlockBlocks')"
            :min="1"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item :label="t('field.explorer')" name="explorer" :extra="t('description.explorer')">
          <a-input
            v-model:value="formData.explorer"
            :placeholder="t('prompt.inputExplorer')"
          />
        </a-form-item>

        <a-form-item :label="t('field.isEvm')" name="isEvm">
          <a-checkbox v-model:checked="formData.isEvm" />
        </a-form-item>

        <a-form-item 
          :label="t('field.expectedTime')" 
          name="expectedTime"
          :extra="t('description.expectedTime')"
        >
          <a-input-number
            v-model:value="formData.expectedTime"
            :placeholder="t('prompt.inputExpectedTime')"
            :min="1"
            :addonAfter="t('prompt.minuteUnit')"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item 
          :label="t('field.addressRegex')" 
          name="addressRegex"
          :extra="t('description.addressRegex')"
        >
          <a-textarea
            v-model:value="formData.addressRegex"
            :placeholder="t('prompt.inputAddressRegex')"
            :auto-size="{ minRows: 2, maxRows: 6 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import zhLocale from '@/locales/params/Blockchain/zh.json'
import enLocale from '@/locales/params/Blockchain/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 查詢參數
const queryParams = ref({
  chainType: undefined
})

// 表格列配置
const columns = [
  {
    title: t('field.chainName'),
    dataIndex: 'chainName',
    key: 'chainName',
    width: 150
  },
  {
    title: t('field.chainCode'),
    dataIndex: 'chainCode',
    key: 'chainCode',
    width: 150
  },
  {
    title: t('field.servicePath'),
    dataIndex: 'servicePath',
    key: 'servicePath',
    width: 200
  },
  {
    title: t('field.confirmBlocks'),
    dataIndex: 'confirmBlocks',
    key: 'confirmBlocks',
    width: 150
  },
  {
    title: t('field.unlockBlocks'),
    dataIndex: 'unlockBlocks',
    key: 'unlockBlocks',
    width: 150
  },
  {
    title: t('field.explorer'),
    dataIndex: 'explorer',
    key: 'explorer',
    width: 200
  },
  {
    title: t('field.lastUpdateTime'),
    dataIndex: 'lastUpdateTime',
    key: 'lastUpdateTime',
    width: 180
  },
  {
    title: t('action.action'),
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]

// 表格數據
const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => t('common.pagination.total', { total })
})

// 彈窗相關
const modalVisible = ref(false)
const modalTitle = ref('')
const confirmLoading = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

// 表單數據
const formData = reactive({
  chainName: '',
  chainCode: '',
  servicePath: '',
  confirmBlocks: undefined,
  unlockBlocks: undefined,
  explorer: '',
  isEvm: false,
  expectedTime: undefined,
  addressRegex: ''
})

// 表單驗證規則
const formRules = {
  chainName: [{ required: true, message: t('prompt.inputChainName') }],
  chainCode: [{ required: true, message: t('prompt.inputChainCode') }],
  servicePath: [{ required: true, message: t('prompt.inputServicePath') }],
  confirmBlocks: [{ required: true, message: t('prompt.inputConfirmBlocks') }],
  unlockBlocks: [{ required: true, message: t('prompt.inputUnlockBlocks') }],
  expectedTime: [{ required: true, message: t('prompt.inputExpectedTime') }]
}

// 加載數據
const loadData = async () => {
  try {
    const mockData = (await import('@/mock/params/Blockchain/list.mock.json')).default
    tableData.value = mockData.list
    pagination.total = mockData.total
  } catch (error) {
    console.error('Load data failed:', error)
  }
}

// 處理查詢
const handleSearch = () => {
  console.log('Search with params:', queryParams.value)
  pagination.current = 1
  loadData()
}

// 處理表格變更
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 處理新增
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = t('title.addBlockchain')
  Object.keys(formData).forEach(key => {
    formData[key] = undefined
  })
  modalVisible.value = true
}

// 處理編輯
const handleEdit = (record) => {
  isEdit.value = true
  modalTitle.value = t('title.editBlockchain')
  Object.keys(formData).forEach(key => {
    formData[key] = record[key]
  })
  modalVisible.value = true
}

// 處理刪除
const handleDelete = (record) => {
  console.log('Delete clicked:', record)
}

// 處理彈窗確認
const handleModalConfirm = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    // 這裡處理表單提交邏輯
    console.log('Form data:', formData)
    setTimeout(() => {
      modalVisible.value = false
      confirmLoading.value = false
      message.success(isEdit.value ? '編輯成功' : '新增成功')
      loadData()
    }, 1000)
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

// 處理彈窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 監聽 chainCode 變化，自動更新 servicePath
watch(() => formData.chainCode, (newVal) => {
  if (newVal) {
    formData.servicePath = `cryp-${newVal}`
  } else {
    formData.servicePath = ''
  }
})

// 初始化加載數據
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.blockchain-management {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
  background: #141414;
}

.blockchain-management :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.blockchain-management :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.blockchain-management :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.blockchain-management :deep(.ant-card-body) {
  background-color: #141414;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-item {
  margin: 0;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
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

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.08);
}

/* 操作圖標樣式 */
.action-icon {
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  color: var(--ant-primary-color);
}

.action-icon:hover {
  opacity: 0.8;
}

/* 深色模式表單元素樣式 */
:deep(.ant-input),
:deep(.ant-select-selector) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-input:hover),
:deep(.ant-input:focus),
:deep(.ant-select-selector:hover),
:deep(.ant-select-selector:focus) {
  border-color: var(--ant-primary-color) !important;
}

:deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}

/* 彈窗樣式 */
:deep(.ant-modal-content),
:deep(.ant-modal-header) {
  background-color: #1f1f1f;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-input-number) {
  width: 100%;
  background-color: #1f1f1f;
  border-color: #434343;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-input-number-handler-wrap) {
  background-color: #141414;
}

:deep(.ant-form-item-extra) {
  color: rgba(255, 255, 255, 0.45);
}
</style> 