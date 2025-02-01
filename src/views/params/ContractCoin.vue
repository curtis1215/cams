<template>
  <div class="contract-coin-management">
    <h2>{{ t('contractCoinManagement') }}</h2>
    
    <!-- 查询卡片 -->
    <a-card :title="t('search.title')" class="search-card">
      <div class="search-form">
        <currency-select v-model="searchForm.coinCode" style="width: 200px" />
        <a-button type="primary" @click="handleSearch">
          {{ t('search.searchButton') }}
        </a-button>
      </div>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :title="t('list.title')" class="list-card">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          {{ t('list.addButton') }}
        </a-button>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="tableData"
        :row-key="record => record.id"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <EditOutlined />
              </a-button>
              <a-button type="link" size="small" @click="handleDelete(record)" danger>
                <DeleteOutlined />
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增幣種彈窗 -->
    <a-modal
      v-model:open="addModalVisible"
      :title="formData.id ? t('list.editButton') : t('list.addButton')"
      :width="800"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-tabs v-model:activeKey="activeTabKey">
        <!-- 幣種基本資訊 -->
        <a-tab-pane :key="1" :tab="t('modal.tabs.basicInfo')">
          <a-form :model="formData" layout="vertical">
            <!-- 合約地址 -->
            <a-form-item :label="t('modal.form.contractAddress')">
              <a-input-group compact>
                <a-input
                  v-model:value="formData.contractAddress"
                  style="width: calc(100% - 100px)"
                  :placeholder="t('modal.placeholder.contractAddress')"
                />
                <a-button type="primary" @click="handleQueryContract">
                  {{ t('modal.button.query') }}
                </a-button>
              </a-input-group>
            </a-form-item>

            <!-- 自動帶出的資訊 -->
            <a-form-item :label="t('modal.form.coinName')">
              <a-input v-model:value="formData.coinName" disabled />
            </a-form-item>
            
            <a-form-item :label="t('modal.form.coinCode')">
              <a-input v-model:value="formData.coinCode" disabled />
            </a-form-item>
            
            <a-form-item :label="t('modal.form.decimals')">
              <a-input v-model:value="formData.decimals" disabled />
            </a-form-item>
            
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item :label="t('modal.form.gasLimitMax')">
                  <a-input v-model:value="formData.gasLimitMax" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('modal.form.gasLimitMin')">
                  <a-input v-model:value="formData.gasLimitMin" disabled />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item :label="t('modal.form.gasPrice')">
              <a-input v-model:value="formData.gasPrice" disabled />
            </a-form-item>
            
            <a-form-item :label="t('modal.form.transferFee')">
              <a-input v-model:value="formData.transferFee" disabled />
            </a-form-item>

            <!-- 幣價來源 -->
            <a-form-item :label="t('modal.form.priceSource')">
              <a-select v-model:value="formData.priceSource">
                <a-select-option value="binance">Binance</a-select-option>
                <a-select-option value="mexc">MEXC</a-select-option>
                <a-select-option value="gate">Gate.io</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 幣兌選擇 -->
            <a-form-item :label="t('modal.form.sourcePair')">
              <a-select v-model:value="formData.sourcePair">
                <a-select-option value="USDT">USDT</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 錢包參數 -->
        <a-tab-pane :key="2" :tab="t('modal.tabs.walletParams')">
          <a-form :model="formData" layout="vertical">
            <!-- 儲存上限 -->
            <a-divider>{{ t('modal.form.storageLimit') }}</a-divider>
            <template v-for="wallet in walletTypes" :key="wallet.key">
              <a-form-item :label="t(`modal.form.${wallet.key}StorageLimit`)">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-input-group compact>
                      <a-input-number
                        v-model:value="formData[`${wallet.key}StorageLimit`]"
                        style="width: 100%"
                        :precision="2"
                        :placeholder="t('modal.placeholder.enterAmount')"
                      />
                    </a-input-group>
                  </a-col>
                  <a-col :span="8">
                    <a-input
                      :value="formatPrice(formData.price)"
                      style="text-align: center"
                      disabled
                    />
                  </a-col>
                  <a-col :span="8">
                    <a-input-group compact>
                      <a-input-number
                        :value="calculateTokenAmount(formData[`${wallet.key}StorageLimit`])"
                        style="width: calc(100% - 60px)"
                        disabled
                      />
                      <a-input
                        style="width: 60px; text-align: center"
                        :value="'USDT'"
                        disabled
                      />
                    </a-input-group>
                  </a-col>
                </a-row>
              </a-form-item>
            </template>

            <!-- 錢包保留數量 -->
            <a-divider>{{ t('modal.form.reserveAmount') }}</a-divider>
            <template v-for="wallet in walletTypes" :key="wallet.key">
              <a-form-item :label="t(`modal.form.${wallet.key}ReserveAmount`)">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-input-group compact>
                      <a-input-number
                        v-model:value="formData[`${wallet.key}ReserveAmount`]"
                        style="width: 100%"
                        :precision="2"
                        :placeholder="t('modal.placeholder.enterAmount')"
                      />
                    </a-input-group>
                  </a-col>
                  <a-col :span="8">
                    <a-input
                      :value="formatPrice(formData.price)"
                      style="text-align: center"
                      disabled
                    />
                  </a-col>
                  <a-col :span="8">
                    <a-input-group compact>
                      <a-input-number
                        :value="calculateTokenAmount(formData[`${wallet.key}ReserveAmount`])"
                        style="width: calc(100% - 60px)"
                        disabled
                      />
                      <a-input
                        style="width: 60px; text-align: center"
                        :value="'USDT'"
                        disabled
                      />
                    </a-input-group>
                  </a-col>
                </a-row>
              </a-form-item>
            </template>

            <!-- 單筆轉帳上限 -->
            <a-divider>{{ t('modal.form.transferLimit') }}</a-divider>
            <template v-for="wallet in walletTypes" :key="wallet.key">
              <a-form-item :label="t(`modal.form.${wallet.key}TransferLimit`)">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-input-group compact>
                      <a-input-number
                        v-model:value="formData[`${wallet.key}TransferLimit`]"
                        style="width: 100%"
                        :precision="2"
                        :placeholder="t('modal.placeholder.enterAmount')"
                      />
                    </a-input-group>
                  </a-col>
                  <a-col :span="8">
                    <a-input
                      :value="formatPrice(formData.price)"
                      style="text-align: center"
                      disabled
                    />
                  </a-col>
                  <a-col :span="8">
                    <a-input-group compact>
                      <a-input-number
                        :value="calculateTokenAmount(formData[`${wallet.key}TransferLimit`])"
                        style="width: calc(100% - 60px)"
                        disabled
                      />
                      <a-input
                        style="width: 60px; text-align: center"
                        :value="'USDT'"
                        disabled
                      />
                    </a-input-group>
                  </a-col>
                </a-row>
              </a-form-item>
            </template>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import mockData from '@/mock/params/ContractCoin/list.json'
import zhLocale from '@/locales/params/ContractCoin/zh.json'
import enLocale from '@/locales/params/ContractCoin/en.json'
import { message } from 'ant-design-vue'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 搜索表单数据
const searchForm = ref({
  coinCode: undefined
})

// 表格数据
const tableData = ref([])

// 表格列定义
const columns = [
  {
    title: t('list.columns.recordType'),
    dataIndex: 'recordType',
    key: 'recordType'
  },
  {
    title: t('list.columns.coinName'),
    dataIndex: 'coinName',
    key: 'coinName'
  },
  {
    title: t('list.columns.coinCode'),
    dataIndex: 'coinCode',
    key: 'coinCode'
  },
  {
    title: t('list.columns.contractAddress'),
    dataIndex: 'contractAddress',
    key: 'contractAddress'
  },
  {
    title: t('list.columns.decimals'),
    dataIndex: 'decimals',
    key: 'decimals'
  },
  {
    title: t('list.columns.price'),
    dataIndex: 'price',
    key: 'price'
  },
  {
    title: t('list.columns.priceSource'),
    dataIndex: 'priceSource',
    key: 'priceSource'
  },
  {
    title: t('list.columns.sourcePair'),
    dataIndex: 'sourcePair',
    key: 'sourcePair'
  },
  {
    title: t('list.columns.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime'
  },
  {
    title: t('list.columns.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right',
    align: 'center'
  }
]

// 搜索处理
const handleSearch = () => {
  // TODO: 实现实际的搜索逻辑
  if (searchForm.value.coinCode) {
    tableData.value = mockData.data.filter(item => 
      item.coinCode.toLowerCase().includes(searchForm.value.coinCode.toLowerCase())
    )
  } else {
    tableData.value = mockData.data
  }
}

// 新增幣種相關
const addModalVisible = ref(false)
const activeTabKey = ref(1)

// 錢包類型
const walletTypes = [
  { key: 'user', label: t('modal.walletType.user') },
  { key: 'collection', label: t('modal.walletType.collection') },
  { key: 'withdrawal', label: t('modal.walletType.withdrawal') }
]

// 表單數據
const formData = ref({
  id: undefined,
  contractAddress: '',
  coinName: '',
  coinCode: '',
  decimals: '',
  gasLimitMax: '',
  gasLimitMin: '',
  gasPrice: '',
  transferFee: '',
  priceSource: undefined,
  sourcePair: undefined,
  // 錢包參數
  userStorageLimit: undefined,
  collectionStorageLimit: undefined,
  withdrawalStorageLimit: undefined,
  userReserveAmount: undefined,
  collectionReserveAmount: undefined,
  withdrawalReserveAmount: undefined,
  userTransferLimit: undefined,
  collectionTransferLimit: undefined,
  withdrawalTransferLimit: undefined
})

// 在 script setup 部分添加
const isEditing = ref(false)

// 處理新增按鈕點擊
const handleAdd = () => {
  isEditing.value = false
  addModalVisible.value = true
}

// 處理合約查詢
const handleQueryContract = async () => {
  if (!formData.value.contractAddress) {
    message.warning(t('modal.message.enterContractAddress'))
    return
  }
  
  try {
    // TODO: 調用合約查詢 API
    // 模擬 API 響應
    const mockResponse = {
      coinName: 'Ethereum',
      coinCode: 'ETH',
      decimals: '18',
      gasLimitMax: '21000',
      gasLimitMin: '21000',
      gasPrice: '30',
      price: '125'
    }
    
    Object.assign(formData.value, mockResponse)
    // 計算轉帳提交手續費 (Gwei to ETH)
    formData.value.transferFee = (mockResponse.gasLimitMax * mockResponse.gasPrice / 1e9).toString()
    
    message.success(t('modal.message.querySuccess'))
  } catch (error) {
    message.error(t('modal.message.queryFailed'))
  }
}

// 格式化幣價顯示
const formatPrice = (price) => {
  if (!price) return '1 USDT = 125 ' + (formData.value.coinCode || '')
  return `1 USDT = ${price} ${formData.value.coinCode || ''}`
}

// 計算代幣數量
const calculateTokenAmount = (usdtAmount) => {
  if (!usdtAmount) return 0
  const price = 125 // 固定幣價為 125
  return Number((usdtAmount * price).toFixed(formData.value.decimals || 8))
}

// 處理提交
const handleSubmit = async () => {
  try {
    // TODO: 實現提交邏輯
    const message = isEditing.value ? t('modal.message.editSuccess') : t('modal.message.addSuccess')
    message.success(message)
    addModalVisible.value = false
  } catch (error) {
    const errorMessage = isEditing.value ? t('modal.message.editFailed') : t('modal.message.addFailed')
    message.error(errorMessage)
  }
}

// 處理取消
const handleCancel = () => {
  addModalVisible.value = false
  isEditing.value = false
  formData.value = {
    id: undefined,
    contractAddress: '',
    coinName: '',
    coinCode: '',
    decimals: '',
    gasLimitMax: '',
    gasLimitMin: '',
    gasPrice: '',
    transferFee: '',
    priceSource: undefined,
    sourcePair: undefined,
    userStorageLimit: undefined,
    collectionStorageLimit: undefined,
    withdrawalStorageLimit: undefined,
    userReserveAmount: undefined,
    collectionReserveAmount: undefined,
    withdrawalReserveAmount: undefined,
    userTransferLimit: undefined,
    collectionTransferLimit: undefined,
    withdrawalTransferLimit: undefined
  }
}

// 添加處理函數
const handleEdit = (record) => {
  isEditing.value = true
  // 填充表單數據
  formData.value = {
    id: record.id,
    contractAddress: record.contractAddress,
    coinName: record.coinName,
    coinCode: record.coinCode,
    decimals: record.decimals,
    gasLimitMax: record.gasLimitMax,
    gasLimitMin: record.gasLimitMin,
    gasPrice: record.gasPrice,
    transferFee: record.transferFee,
    priceSource: record.priceSource,
    sourcePair: record.sourcePair,
    userStorageLimit: record.userStorageLimit,
    collectionStorageLimit: record.collectionStorageLimit,
    withdrawalStorageLimit: record.withdrawalStorageLimit,
    userReserveAmount: record.userReserveAmount,
    collectionReserveAmount: record.collectionReserveAmount,
    withdrawalReserveAmount: record.withdrawalReserveAmount,
    userTransferLimit: record.userTransferLimit,
    collectionTransferLimit: record.collectionTransferLimit,
    withdrawalTransferLimit: record.withdrawalTransferLimit
  }
  
  // 打開彈窗
  addModalVisible.value = true
  // 設置為第一個標籤頁
  activeTabKey.value = 1
}

const handleDelete = (record) => {
  // TODO: 實現刪除邏輯
  console.log('Delete record:', record)
}

// 组件挂载时加载数据
onMounted(() => {
  tableData.value = mockData.data
})
</script>

<style scoped>
.contract-coin-management {
  padding: 24px;
  overflow-x: hidden;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.list-card {
  width: 100%;
  overflow-x: auto;
}

.contract-coin-management :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.contract-coin-management :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.contract-coin-management :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.contract-coin-management :deep(.ant-card-body) {
  background-color: #141414;
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 表格样式 */
:deep(.ant-table-wrapper) {
  width: 100%;
  overflow-x: auto;
}

:deep(.ant-table) {
  background: transparent;
  min-width: 100%;
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

/* 表单元素深色模式样式 */
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

/* 新增樣式 */
:deep(.ant-modal-content) {
  background-color: #1f1f1f;
}

:deep(.ant-modal-header) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-modal-close-icon) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-divider) {
  color: rgba(255, 255, 255, 0.85);
  border-color: #303030;
}

:deep(.ant-input-number) {
  background-color: #1f1f1f;
  border-color: #434343;
}

:deep(.ant-input-number-input) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-tabs-tab-active) {
  color: var(--ant-primary-color);
}

:deep(.ant-tabs-ink-bar) {
  background: var(--ant-primary-color);
}
</style> 