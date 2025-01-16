<template>
  <div class="wallet-token-exchange">
    <a-row :gutter="24">
      <!-- 左側兌出錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="exchange-card from-wallet">
          <template #title>
            <span class="card-title">{{ $t('fromWallet') }}</span>
          </template>
          <a-form layout="vertical" :model="fromWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('merchant') }}</div>
                <merchant-select v-model="fromWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('chainType') }}</div>
                <chain-type-select v-model="fromWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('currency') }}</div>
                <currency-select v-model="fromWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('address') }}</div>
                <a-input
                  v-model:value="fromWalletForm.address"
                  :placeholder="$t('pleaseInputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item class="query-button">
                <div class="form-label">&nbsp;</div>
                <a-button type="primary" @click="handleFromWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ $t('query') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右側兌入錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="exchange-card to-wallet">
          <template #title>
            <span class="card-title">{{ $t('toWallet') }}</span>
          </template>
          <a-form layout="vertical" :model="toWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('merchant') }}</div>
                <merchant-select v-model="toWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('chainType') }}</div>
                <chain-type-select v-model="toWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('currency') }}</div>
                <currency-select v-model="toWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('address') }}</div>
                <a-input
                  v-model:value="toWalletForm.address"
                  :placeholder="$t('pleaseInputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item label="&nbsp;" class="query-button">
                <a-button type="primary" @click="handleToWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ $t('query') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 兌出錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card from-detail">
          <template #title>
            <span class="card-title">{{ $t('fromWalletDetail') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ $t('currency') }}</span>
              <span class="detail-value">{{ fromWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('balance') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('availableOutflow') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.availableOutflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 兌入錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card to-detail">
          <template #title>
            <span class="card-title">{{ $t('toWalletDetail') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ $t('currency') }}</span>
              <span class="detail-value">{{ toWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('balance') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('availableInflow') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.availableInflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 兌換資訊 -->
    <a-card :bordered="false" class="exchange-info">
      <template #title>
        <span class="card-title">{{ $t('exchangeInfo') }}</span>
      </template>
      <div class="exchange-amount-container">
        <a-form layout="inline">
          <a-form-item :label="$t('exchangeAmount')">
            <a-input-number
              v-model:value="exchangeAmount"
              :min="0"
              :max="maxAmount"
              :precision="8"
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="useMaxAmount" @change="handleMaxAmountChange">
              {{ $t('maxAmount') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleExchange">
              {{ $t('exchange') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <!-- 兌換確認彈窗 -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="$t('confirmExchange')"
      @ok="handleConfirmExchange"
      @cancel="handleCancelExchange"
      :confirmLoading="confirmLoading"
      width="600px"
    >
      <div class="confirm-content">
        <!-- 兌出資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ $t('fromWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('walletType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('chainType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('currency') }}</span>
              <span class="confirm-value">{{ fromWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('address') }}</span>
              <span class="confirm-value">{{ fromWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 兌入資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ $t('toWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('walletType') }}</span>
              <span class="confirm-value">{{ toWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('chainType') }}</span>
              <span class="confirm-value">{{ toWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('currency') }}</span>
              <span class="confirm-value">{{ toWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('address') }}</span>
              <span class="confirm-value">{{ toWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 兌換金額資訊 -->
        <div class="confirm-amount">
          <span class="confirm-label">{{ $t('exchangeAmount') }}</span>
          <span class="confirm-value">{{ formatNumber(exchangeAmount) }}</span>
        </div>
      </div>
    </a-modal>

    <!-- 兌換列表 -->
    <a-card :title="$t('exchangeList')" class="exchange-card list-card">
      <a-table 
        :dataSource="exchangeList" 
        :columns="columns" 
        :loading="loading" 
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'action'">
            <a-button 
              type="link" 
              size="small"
              @click="handleViewAuditDetail(record)"
            >
              {{ $t('detail') }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'

// 錢包表單數據
const fromWalletForm = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

const toWalletForm = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

// 錢包詳情數據
const fromWalletDetail = reactive({
  currency: '',
  balance: 0,
  availableOutflow: 0
})

const toWalletDetail = reactive({
  currency: '',
  balance: 0,
  availableInflow: 0
})

// 兌換相關數據
const exchangeAmount = ref(0)
const maxAmount = computed(() => fromWalletDetail.availableOutflow)
const useMaxAmount = ref(false)

// 處理最大數量變更
const handleMaxAmountChange = (checked) => {
  if (checked) {
    exchangeAmount.value = maxAmount.value
  }
}

// 格式化數字
const formatNumber = (value) => {
  return value ? Number(value).toLocaleString() : '0'
}

// 處理兌出錢包查詢
const handleFromWalletQuery = async () => {
  try {
    // 這裡添加查詢邏輯
    message.success('查詢成功')
  } catch (error) {
    message.error('查詢失敗')
  }
}

// 處理兌入錢包查詢
const handleToWalletQuery = async () => {
  try {
    // 這裡添加查詢邏輯
    message.success('查詢成功')
  } catch (error) {
    message.error('查詢失敗')
  }
}

// 兌換確認相關
const confirmModalVisible = ref(false)
const confirmLoading = ref(false)

// 處理兌換按鈕點擊
const handleExchange = () => {
  if (!exchangeAmount.value) {
    message.warning('請輸入兌換金額')
    return
  }
  if (exchangeAmount.value > maxAmount.value) {
    message.warning('兌換金額不能超過可用餘額')
    return
  }
  confirmModalVisible.value = true
}

// 處理確認兌換
const handleConfirmExchange = async () => {
  try {
    confirmLoading.value = true
    // 這裡添加兌換邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('兌換成功')
    confirmModalVisible.value = false
    handleQuery() // 重新加載列表
  } catch (error) {
    message.error('兌換失敗')
  } finally {
    confirmLoading.value = false
  }
}

// 處理取消兌換
const handleCancelExchange = () => {
  confirmModalVisible.value = false
}

// 查詢參數
const queryParams = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  status: undefined,
  pageSize: 10,
  current: 1
})

// 列表相關數據
const loading = ref(false)
const exchangeList = ref([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 表格列定義
const columns = [
  {
    title: '兌換ID',
    dataIndex: 'exchangeId',
    key: 'exchangeId'
  },
  {
    title: '兌出商戶',
    dataIndex: 'fromMerchant',
    key: 'fromMerchant'
  },
  {
    title: '兌入商戶',
    dataIndex: 'toMerchant',
    key: 'toMerchant'
  },
  {
    title: '兌換金額',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }) => formatNumber(text)
  },
  {
    title: '兌換狀態',
    dataIndex: 'exchangeStatus',
    key: 'exchangeStatus',
    customRender: ({ text, record }) => {
      const statusMap = {
        pending: '待處理',
        processing: '處理中',
        completed: '已完成',
        failed: '失敗'
      }
      return statusMap[text] || text
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right'
  }
]

// 生成模擬數據
const generateMockData = () => {
  const data = []
  for (let i = 0; i < 10; i++) {
    data.push({
      exchangeId: `EX${String(i + 1).padStart(6, '0')}`,
      fromMerchant: `商戶${i + 1}`,
      toMerchant: `商戶${i + 2}`,
      amount: Math.random() * 1000000,
      exchangeStatus: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
    })
  }
  return data
}

// 更新查詢方法
const handleQuery = async () => {
  try {
    loading.value = true
    // 這裡添加實際的查詢邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    exchangeList.value = generateMockData()
    pagination.total = 100 // 模擬總數據量
  } catch (error) {
    message.error('查詢失敗')
  } finally {
    loading.value = false
  }
}

// 初始化數據
onMounted(() => {
  handleQuery()
})

// 重置方法
const handleReset = () => {
  Object.assign(queryParams, {
    merchant: undefined,
    chainType: undefined,
    currency: undefined,
    status: undefined,
    pageSize: 10,
    current: 1
  })
  handleQuery()
}

// 審核相關
const auditDetailModalVisible = ref(false)
const currentAuditDetail = ref(null)

// 處理查看審核詳情
const handleViewAuditDetail = (record) => {
  currentAuditDetail.value = record
  auditDetailModalVisible.value = true
}

// 處理表格變更
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  handleQuery()
}
</script>

<style scoped>
@import '../../styles/common.css';

.wallet-token-exchange {
  padding: 24px;
}

.exchange-card,
.detail-card {
  margin-bottom: 24px;
  background-color: var(--component-background);
}

.exchange-info {
  margin-top: 32px;
  background-color: var(--component-background);
}

.from-wallet,
.to-wallet,
.from-detail,
.to-detail {
  background-color: var(--component-background);
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  flex: 1;
}

.form-label {
  margin-bottom: 8px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.full-width {
  width: 100%;
}

.detail-content {
  padding: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-label {
  color: var(--text-color-secondary);
}

.detail-value {
  color: var(--text-color);
  font-weight: 500;
}

.exchange-amount-container {
  padding: 16px;
}

.confirm-content {
  padding: 16px;
}

.confirm-card {
  margin-bottom: 16px;
}

.confirm-card-content {
  padding: 16px;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.confirm-label {
  color: var(--text-color-secondary);
}

.confirm-value {
  color: var(--text-color);
}

.confirm-amount {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--item-hover-bg);
  border-radius: 4px;
}

.list-card {
  margin-top: 24px;
  background-color: var(--component-background);
}

/* Dark mode variables */
:root {
  --component-background: #ffffff;
  --text-color: rgba(0, 0, 0, 0.85);
  --text-color-secondary: rgba(0, 0, 0, 0.45);
  --item-hover-bg: #f5f5f5;
}

:root[theme='dark'] {
  --component-background: #141414;
  --text-color: rgba(255, 255, 255, 0.85);
  --text-color-secondary: rgba(255, 255, 255, 0.45);
  --item-hover-bg: #1f1f1f;
}
</style>