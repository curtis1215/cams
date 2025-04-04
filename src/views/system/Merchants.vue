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
                <div class="select-all-wrapper">
                  <a-checkbox
                    :checked="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @change="handleSelectAll"
                  >
                    {{ t('action.selectAll') }}
                  </a-checkbox>
                </div>
                <div class="currency-columns">
                  <!-- 左側鏈類型列表 -->
                  <div class="chain-type-list">
                    <div 
                      v-for="chainType in chainTypes" 
                      :key="chainType" 
                      class="chain-type-item"
                      :class="{ active: selectedChainType === chainType }"
                      @click="handleChainTypeClick(chainType)"
                    >
                      <span class="chain-type-name">{{ chainType }}</span>
                      <a-checkbox
                        :checked="isChainTypeSelected(chainType)"
                        :indeterminate="isChainTypeIndeterminate(chainType)"
                        @click.stop="(e: Event) => handleChainTypeSelect(e as unknown as CheckboxEvent, chainType)"
                      />
                    </div>
                  </div>
                  <!-- 右側幣種列表 -->
                  <div class="currency-list">
                    <div class="currency-list-header">
                      {{ selectedChainType }} {{ t('field.currencies') }}
                    </div>
                    <div class="currency-list-content">
                      <a-checkbox-group 
                        v-model:value="formState.availableCurrencies"
                        :options="getCurrenciesByChainType(selectedChainType)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import zhLocale from '@/locales/system/Merchant/zh.json'
import enLocale from '@/locales/system/Merchant/en.json'
import mockData from '@/mock/system/Merchant/query.mock.json'
import currencyData from '@/mock/system/Merchant/currencies.mock.json'

interface MerchantRecord {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive'
  updateTime: string
  privateKey?: string
  retryCount: number
  depositStatus: boolean
  withdrawStatus: boolean
  availableCurrencies: string[]
}

interface PaginationEvent {
  current: number
  pageSize: number
}

interface CheckboxEvent {
  target: {
    checked: boolean
  }
}

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

const formState = reactive<MerchantRecord>({
  id: '',
  name: '',
  code: '',
  status: 'active',
  updateTime: '',
  retryCount: 3,
  depositStatus: true,
  withdrawStatus: true,
  availableCurrencies: []
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
    id: '',
    name: '',
    code: '',
    status: 'active',
    updateTime: '',
    retryCount: 3,
    depositStatus: true,
    withdrawStatus: true,
    availableCurrencies: [],
  })
  modalOpen.value = true
  activeTabKey.value = 1
}

const handleEdit = (record: MerchantRecord) => {
  modalTitle.value = t('title.editMerchant')
  Object.assign(formState, {
    ...record,
    depositStatus: true,
    withdrawStatus: true,
    availableCurrencies: ['BSC_USDT', 'ETH_USDT', 'TRX_USDT'], // 模擬數據，使用新的格式
  })
  modalOpen.value = true
  activeTabKey.value = 1
}

const handleDelete = async (record: MerchantRecord) => {
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

const handleTableChange = (pag: PaginationEvent) => {
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

// 定義幣種和鏈類型的關係
const chainTypes = ['BSC', 'ETH', 'TRX', 'BTC']
const currencyMap = {
  BSC: ['USDT', 'USDC', 'BUSD', 'DAI'],
  ETH: ['USDT', 'USDC', 'DAI'],
  TRX: ['USDT', 'USDC'],
  BTC: ['BTC']
}

// 獲取特定鏈類型的幣種
const getCurrenciesByChainType = (chainType: string) => {
  return currencyMap[chainType as keyof typeof currencyMap].map(currency => ({
    label: currency,
    value: `${chainType}_${currency}`
  }))
}

// 檢查鏈類型是否被全選
const isChainTypeSelected = (chainType: string) => {
  const chainCurrencies = currencyMap[chainType as keyof typeof currencyMap].map(
    currency => `${chainType}_${currency}`
  )
  return chainCurrencies.every(currency => 
    formState.availableCurrencies.includes(currency)
  )
}

// 檢查鏈類型是否部分選中
const isChainTypeIndeterminate = (chainType: string) => {
  const chainCurrencies = currencyMap[chainType as keyof typeof currencyMap].map(
    currency => `${chainType}_${currency}`
  )
  const selectedCount = chainCurrencies.filter(currency => 
    formState.availableCurrencies.includes(currency)
  ).length
  return selectedCount > 0 && selectedCount < chainCurrencies.length
}

// 處理鏈類型的選擇
const handleChainTypeSelect = (e: CheckboxEvent, chainType: string) => {
  const chainCurrencies = currencyMap[chainType as keyof typeof currencyMap].map(
    currency => `${chainType}_${currency}`
  )
  
  if (e.target.checked) {
    // 添加該鏈類型的所有幣種
    const newCurrencies = [...new Set([...formState.availableCurrencies, ...chainCurrencies])]
    formState.availableCurrencies = newCurrencies
  } else {
    // 移除該鏈類型的所有幣種
    formState.availableCurrencies = formState.availableCurrencies.filter(
      currency => !chainCurrencies.includes(currency)
    )
  }
}

// 更新全選邏輯
const isAllSelected = computed(() => {
  const allCurrencies = Object.values(currencyMap).flat().map(
    (currency, chainType) => `${chainType}_${currency}`
  )
  return allCurrencies.every(currency => formState.availableCurrencies.includes(currency))
})

const isIndeterminate = computed(() => {
  const allCurrencies = Object.values(currencyMap).flat().map(
    (currency, chainType) => `${chainType}_${currency}`
  )
  const selectedCount = allCurrencies.filter(currency => 
    formState.availableCurrencies.includes(currency)
  ).length
  return selectedCount > 0 && selectedCount < allCurrencies.length
})

const handleSelectAll = (e: CheckboxEvent) => {
  if (e.target.checked) {
    // 全選所有幣種
    const allCurrencies = Object.entries(currencyMap).flatMap(([chainType, currencies]) =>
      currencies.map(currency => `${chainType}_${currency}`)
    )
    formState.availableCurrencies = allCurrencies
  } else {
    // 取消全選
    formState.availableCurrencies = []
  }
}

// 新增選中的鏈類型狀態
const selectedChainType = ref(chainTypes[0])

// 處理鏈類型點擊
const handleChainTypeClick = (chainType: string) => {
  selectedChainType.value = chainType
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

.currency-columns {
  display: flex;
  gap: 24px;
  height: 300px;
}

.chain-type-list {
  flex: 0 0 200px;
  border-right: 1px solid #303030;
  overflow-y: auto;
}

.chain-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chain-type-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.chain-type-item.active {
  background-color: var(--ant-primary-1);
}

.chain-type-name {
  margin-right: 8px;
}

.currency-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.currency-list-header {
  padding: 12px 16px;
  font-weight: 500;
  border-bottom: 1px solid #303030;
}

.currency-list-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.currency-list-content :deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.currency-grid {
  background: #141414;
  border: 1px solid #303030;
  border-radius: 4px;
}

.select-all-wrapper {
  padding: 12px 16px;
  border-bottom: 1px solid #303030;
}

/* Switch 樣式 */
:deep(.ant-switch) {
  background-color: rgba(255, 77, 79, 0.5);
}

:deep(.ant-switch-checked) {
  background-color: var(--ant-primary-color);
}
</style> 