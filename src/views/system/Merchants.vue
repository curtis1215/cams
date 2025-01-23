<template>
  <div class="merchants-container">
    <!-- 查詢卡片 -->
    <a-card :title="t('title.queryCondition')" :bordered="false" class="filter-card">
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item :label="t('field.name')" class="form-item">
          <a-input
            v-model:value="queryParams.name"
            :placeholder="t('prompt.inputName')"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item :label="t('field.status')" class="form-item">
          <a-select
            v-model:value="queryParams.status"
            :placeholder="t('prompt.selectStatus')"
            style="width: 200px"
            allow-clear
          >
            <a-select-option value="active">{{ t('status.active') }}</a-select-option>
            <a-select-option value="inactive">{{ t('status.inactive') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="form-item">
          <a-button type="primary" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            {{ t('action.search') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :title="t('title.merchantManagement')" :bordered="false" class="table-card">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          {{ t('action.add') }}
        </a-button>
      </template>

      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          rowKey="id"
          :pagination="pagination"
          :bordered="true"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="handleEdit(record)">
                  {{ t('action.edit') }}
                </a-button>
                <a-button type="link" danger @click="handleDelete(record)">
                  {{ t('action.delete') }}
                </a-button>
              </a-space>
            </template>
            <template v-else-if="column.key === 'status'">
              <span :class="['status-tag', record.status === 'active' ? 'status-enabled' : 'status-disabled']">
                {{ t(`status.${record.status}`) }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="800px"
    >
      <a-tabs v-model:activeKey="activeTabKey">
        <!-- 商戶資訊分頁 -->
        <a-tab-pane :key="1" :tab="t('title.merchantInfo')">
          <a-form
            ref="formRef"
            :model="formState"
            :rules="rules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-form-item :label="t('field.name')" name="name">
              <a-input v-model:value="formState.name" :placeholder="t('prompt.inputName')" />
            </a-form-item>
            <a-form-item :label="t('field.code')" name="code">
              <a-input v-model:value="formState.code" :placeholder="t('prompt.inputCode')" />
            </a-form-item>
            <a-form-item :label="t('field.status')" name="status">
              <a-select v-model:value="formState.status" :placeholder="t('prompt.selectStatus')">
                <a-select-option value="active">{{ t('status.active') }}</a-select-option>
                <a-select-option value="inactive">{{ t('status.inactive') }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('field.privateKey')" name="privateKey">
              <a-input-group compact>
                <a-input
                  v-model:value="formState.privateKey"
                  :placeholder="t('field.privateKey')"
                  style="width: calc(100% - 110px)"
                  readonly
                />
                <a-button type="primary" @click="generatePrivateKey">
                  {{ t('action.generateKey') }}
                </a-button>
              </a-input-group>
            </a-form-item>
            <a-form-item :label="t('field.retryCount')" name="retryCount">
              <a-input-number
                v-model:value="formState.retryCount"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 商戶權限分頁 -->
        <a-tab-pane :key="2" :tab="t('title.merchantPermission')">
          <a-form
            :model="formState"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-form-item :label="t('field.depositStatus')" name="depositStatus">
              <a-switch
                v-model:checked="formState.depositStatus"
                :checked-children="t('status.active')"
                :un-checked-children="t('status.inactive')"
              />
            </a-form-item>
            <a-form-item :label="t('field.withdrawStatus')" name="withdrawStatus">
              <a-switch
                v-model:checked="formState.withdrawStatus"
                :checked-children="t('status.active')"
                :un-checked-children="t('status.inactive')"
              />
            </a-form-item>
            <a-form-item :label="t('field.availableCurrencies')" name="availableCurrencies">
              <div class="currency-grid">
                <a-checkbox-group v-model:value="formState.availableCurrencies">
                  <a-row :gutter="[16, 16]">
                    <a-col :span="4" v-for="currency in currencies" :key="currency.code">
                      <a-checkbox :value="currency.code">
                        {{ currency.code }}
                      </a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
              </div>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import zhLocale from '@/locales/system/Merchant/zh.json'
import enLocale from '@/locales/system/Merchant/en.json'
import mockData from '@/mock/system/Merchant/query.mock.json'
import currencyData from '@/mock/system/Merchant/currencies.mock.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const columns = [
  {
    title: t('field.name'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: t('field.code'),
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: t('field.status'),
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: t('field.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: t('field.action'),
    key: 'action',
    fixed: 'right',
    width: 150,
  },
]

// 查詢參數
const queryParams = reactive({
  name: '',
  status: undefined,
})

const dataSource = ref(mockData.merchantList)
const loading = ref(false)
const modalOpen = ref(false)
const modalTitle = ref('')
const formRef = ref()
const activeTabKey = ref(1)
const currencies = ref(currencyData.currencies)

const formState = reactive({
  name: '',
  code: '',
  status: 'active',
  privateKey: '',
  retryCount: 3,
  depositStatus: true,
  withdrawStatus: true,
  availableCurrencies: [],
})

const rules = {
  name: [
    { required: true, message: t('validation.nameRequired') },
  ],
  code: [
    { required: true, message: t('validation.codeRequired') },
  ],
  status: [
    { required: true, message: t('validation.statusRequired') },
  ],
  retryCount: [
    { required: true, message: t('validation.retryCountRequired') },
  ],
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

const generatePrivateKey = () => {
  // 生成32位隨機字符串作為私鑰
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let privateKey = ''
  for (let i = 0; i < 32; i++) {
    privateKey += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formState.privateKey = privateKey
  message.success(t('message.generateKeySuccess'))
}

const handleQuery = () => {
  const filteredData = mockData.merchantList.filter(item => {
    if (queryParams.name && !item.name.includes(queryParams.name)) return false
    if (queryParams.status && item.status !== queryParams.status) return false
    return true
  })
  dataSource.value = filteredData
}

const handleAdd = () => {
  modalTitle.value = t('title.addMerchant')
  Object.assign(formState, {
    name: '',
    code: '',
    status: 'active',
    privateKey: '',
    retryCount: 3,
    depositStatus: true,
    withdrawStatus: true,
    availableCurrencies: [],
  })
  modalOpen.value = true
  activeTabKey.value = 1
}

const handleEdit = (record) => {
  modalTitle.value = t('title.editMerchant')
  Object.assign(formState, {
    ...record,
    depositStatus: true,
    withdrawStatus: true,
    availableCurrencies: ['BTC', 'ETH', 'USDT'], // 模擬數據
  })
  modalOpen.value = true
  activeTabKey.value = 1
}

const handleDelete = async (record) => {
  // TODO: Implement delete logic
  message.success(t('message.deleteSuccess'))
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    // TODO: Implement save logic
    message.success(t('message.saveSuccess'))
    modalOpen.value = false
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const handleModalCancel = () => {
  formRef.value?.resetFields()
  modalOpen.value = false
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    // 在實際應用中這裡會調用 API
    dataSource.value = mockData.merchantList
    loading.value = false
  } catch (error) {
    message.error(t('message.fetchError'))
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.merchants-container {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
  background: #141414;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-item {
  margin-bottom: 0;
}

.merchants-container :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.merchants-container :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.merchants-container :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.merchants-container :deep(.ant-card-body) {
  background-color: #141414;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

/* 表格內的按鈕樣式 */
:deep(.ant-btn-link) {
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}

/* 深色模式表格樣式 */
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

/* 分頁器樣式 */
:deep(.ant-pagination-item),
:deep(.ant-pagination-prev),
:deep(.ant-pagination-next),
:deep(.ant-pagination-jump-prev),
:deep(.ant-pagination-jump-next) {
  background: transparent;
  border-color: #303030;
}

:deep(.ant-pagination-item-active) {
  background: var(--ant-primary-color);
  border-color: var(--ant-primary-color);
}

:deep(.ant-pagination-item-active a) {
  color: #fff;
}

/* 表單元素深色模式樣式 */
:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-number),
:deep(.ant-input-number-input) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-input:hover),
:deep(.ant-input:focus),
:deep(.ant-select-selector:hover),
:deep(.ant-select-selector:focus),
:deep(.ant-input-number:hover),
:deep(.ant-input-number:focus) {
  border-color: var(--ant-primary-color) !important;
}

:deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-select-dropdown) {
  background-color: #1f1f1f;
  border: 1px solid #303030;
}

:deep(.ant-select-item) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-select-item-option-active) {
  background-color: rgba(255, 255, 255, 0.08);
}

:deep(.ant-select-item-option-selected) {
  background-color: var(--ant-primary-1);
}

/* 狀態標籤樣式 */
.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-enabled {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
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

:deep(.ant-modal-close:hover) {
  color: rgba(255, 255, 255, 0.75);
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}

/* Tabs 樣式 */
:deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.65);
}

:deep(.ant-tabs-tab-active) {
  color: var(--ant-primary-color) !important;
}

:deep(.ant-tabs-ink-bar) {
  background: var(--ant-primary-color);
}

/* Checkbox 樣式 */
:deep(.ant-checkbox-wrapper) {
  color: rgba(255, 255, 255, 0.85);
}

.currency-grid {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #141414;
  border: 1px solid #303030;
  border-radius: 4px;
}

/* Switch 樣式 */
:deep(.ant-switch) {
  background-color: rgba(255, 77, 79, 0.5);
}

:deep(.ant-switch-checked) {
  background-color: var(--ant-primary-color);
}
</style> 