<template>
  <div class="contract-coin-management">
    <h2>{{ t('contractCoinManagement') }}</h2>
    
    <!-- 查询卡片 -->
    <a-card :title="t('search.title')" class="search-card">
      <div class="search-form">
        <a-form layout="inline">
          <a-form-item :label="t('search.chainType')">
            <chain-type-select v-model="searchForm.chainType" />
          </a-form-item>
          <a-form-item :label="t('search.coinCode')">
            <currency-select v-model="searchForm.coinCode" />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                {{ t('search.searchButton') }}
              </a-button>
              <a-button @click="handleReset">
                {{ t('search.resetButton') }}
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
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
        :row-key="(record: ContractCoin) => record.id"
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
                    <a-input-number
                      :value="formData.walletLimits[wallet.key]?.storageLimit"
                      @update:value="(value: number | null) => {
                        if (!formData.walletLimits[wallet.key]) {
                          formData.walletLimits[wallet.key] = {
                            storageLimit: 0,
                            transferLimit: 0
                          }
                        }
                        formData.walletLimits[wallet.key].storageLimit = value ?? 0
                      }"
                      @change="(value: number | null) => handleLimitChange('storageLimit', wallet.key, value ?? 0)"
                      :precision="2"
                      style="width: 100%"
                    />
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
                        :value="calculateTokenAmount(formData.walletLimits[wallet.key]?.storageLimit)"
                        style="width: calc(100% - 60px)"
                        disabled
                        :value-type="'number'"
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
                    <a-input-number
                      :value="formData.walletLimits[wallet.key]?.transferLimit"
                      @update:value="(value: number | null) => {
                        if (!formData.walletLimits[wallet.key]) {
                          formData.walletLimits[wallet.key] = {
                            storageLimit: 0,
                            transferLimit: 0
                          }
                        }
                        formData.walletLimits[wallet.key].transferLimit = value ?? 0
                      }"
                      @change="(value: number | null) => handleLimitChange('transferLimit', wallet.key, value ?? 0)"
                      :precision="2"
                      :placeholder="t('modal.placeholder.enterAmount')"
                      :value-type="'number'"
                      style="width: 100%"
                    />
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
                        :value="calculateTokenAmount(formData.walletLimits[wallet.key]?.transferLimit)"
                        style="width: calc(100% - 60px)"
                        disabled
                        :value-type="'number'"
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import mockData from '@/mock/params/ContractCoin/list.json'
import zhLocale from '@/locales/params/ContractCoin/zh.json'
import enLocale from '@/locales/params/ContractCoin/en.json'

type WalletType = 'storageLimit' | 'transferLimit'

interface WalletLimits {
  [key: string]: {
    [K in WalletType]: number
  }
}

interface FormData {
  id?: string
  contractAddress: string
  coinName: string
  coinCode: string
  decimals: string
  gasLimitMax: string
  gasLimitMin: string
  gasPrice: string
  transferFee: string
  priceSource?: string
  sourcePair?: string
  price: string
  walletLimits: WalletLimits
}

interface ContractCoin {
  id: string
  recordType: string
  coinName: string
  coinCode: string
  contractAddress: string
  decimals: number
  price: string
  priceSource: string
  sourcePair: string
  updateTime: string
  chainType?: string
  gasLimitMax?: string
  gasLimitMin?: string
  gasPrice?: string
  transferFee?: string
}

interface SearchForm {
  chainType?: string
  coinCode?: string
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 搜索表单数据
const searchForm = ref<SearchForm>({
  chainType: undefined,
  coinCode: undefined
})

// 表格数据
const tableData = ref<ContractCoin[]>([])

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
] as const

// 重置處理
const handleReset = () => {
  searchForm.value = {
    chainType: undefined,
    coinCode: undefined
  }
  handleSearch()
}

// 搜索处理
const handleSearch = () => {
  // TODO: 实现实际的搜索逻辑
  if (searchForm.value.coinCode || searchForm.value.chainType) {
    tableData.value = mockData.data.filter((item: ContractCoin) => {
      const matchCoin = !searchForm.value.coinCode || 
        item.coinCode.toLowerCase().includes(searchForm.value.coinCode!.toLowerCase())
      const matchChain = !searchForm.value.chainType || 
        item.chainType === searchForm.value.chainType
      return matchCoin && matchChain
    })
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
const formData = ref<FormData>({
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
  price: '0',
  walletLimits: {}
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
    const gasLimitMax = parseFloat(mockResponse.gasLimitMax)
    const gasPrice = parseFloat(mockResponse.gasPrice)
    formData.value.transferFee = ((gasLimitMax * gasPrice) / 1e9).toString()
    
    message.success(t('modal.message.querySuccess'))
  } catch (error) {
    message.error(t('modal.message.queryFailed'))
  }
}

// 計算代幣數量
const calculateTokenAmount = (amount: number): number => {
  if (!amount || !formData.value.price) return 0
  const price = parseFloat(formData.value.price)
  if (isNaN(price)) return 0
  return Number((amount * price).toFixed(8))
}

// 格式化幣價顯示
const formatPrice = (price: string): string => {
  const priceValue = parseFloat(price || '0')
  if (isNaN(priceValue)) return `1 USDT = 0 ${formData.value.coinCode || ''}`
  return `1 USDT = ${priceValue} ${formData.value.coinCode || ''}`
}

// 獲取錢包限額
const getWalletLimit = (wallet: string, type: WalletType): number => {
  return formData.value.walletLimits[wallet]?.[type] || 0
}

// 處理錢包限額變更
const handleLimitChange = (type: WalletType, wallet: string, value: number) => {
  if (!formData.value.walletLimits[wallet]) {
    formData.value.walletLimits[wallet] = {
      storageLimit: 0,
      transferLimit: 0
    }
  }
  formData.value.walletLimits[wallet][type] = value
}

// 處理提交
const handleSubmit = async () => {
  try {
    // TODO: 實現提交邏輯
    const successMessage = isEditing.value ? t('modal.message.editSuccess') : t('modal.message.addSuccess')
    message.success(successMessage)
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
    price: '0',
    walletLimits: {}
  }
}

// 處理編輯
const handleEdit = (record: ContractCoin) => {
  isEditing.value = true
  formData.value = {
    id: record.id,
    contractAddress: record.contractAddress,
    coinName: record.coinName,
    coinCode: record.coinCode,
    decimals: String(record.decimals),
    gasLimitMax: record.gasLimitMax || '',
    gasLimitMin: record.gasLimitMin || '',
    gasPrice: record.gasPrice || '',
    transferFee: record.transferFee || '',
    priceSource: record.priceSource,
    sourcePair: record.sourcePair,
    price: record.price,
    walletLimits: {}
  }
  
  addModalVisible.value = true
  activeTabKey.value = 1
}

// 處理刪除
const handleDelete = (record: ContractCoin) => {
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

.search-card {
  margin-bottom: 24px;
  background: #141414;
}

.list-card {
  background: #141414;
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
  :deep(.ant-form-item) {
    margin-bottom: 0;
    margin-right: 16px;
  }

  :deep(.ant-form-item:last-child) {
    margin-right: 0;
  }

  :deep(.ant-select) {
    width: 160px;
  }
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

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-item-sm { 
  width: 200px;
}

.form-item-auto {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
</style> 