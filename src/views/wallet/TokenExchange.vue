<template>
  <div class="wallet-token-exchange">
    <a-row :gutter="24">
      <!-- 左側兌出錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="exchange-card from-wallet">
          <template #title>
            <span class="card-title">{{ t('wallet.fromWalletTitle') }}</span>
          </template>
          <a-form layout="vertical" :model="fromWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.merchant') }}</div>
                <merchant-select v-model="fromWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.chainType') }}</div>
                <chain-type-select v-model="fromWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.currency') }}</div>
                <currency-select v-model="fromWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.address') }}</div>
                <a-input
                  v-model:value="fromWalletForm.address"
                  :placeholder="t('common.prompt.inputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item class="query-button">
                <div class="form-label">&nbsp;</div>
                <a-button type="primary" @click="handleFromWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ t('common.action.query') }}
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
            <span class="card-title">{{ t('wallet.toWalletTitle') }}</span>
          </template>
          <a-form layout="vertical" :model="toWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.merchant') }}</div>
                <merchant-select v-model="toWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.chainType') }}</div>
                <chain-type-select v-model="toWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.currency') }}</div>
                <currency-select v-model="toWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.address') }}</div>
                <a-input
                  v-model:value="toWalletForm.address"
                  :placeholder="t('common.prompt.inputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item label="&nbsp;" class="query-button">
                <a-button type="primary" @click="handleToWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ t('common.action.query') }}
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
            <span class="card-title">{{ t('wallet.fromWalletDetailTitle') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ t('common.currency') }}</span>
              <span class="detail-value">{{ fromWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('common.balance') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('common.availableAmount') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.availableOutflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 兌入錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card to-detail">
          <template #title>
            <span class="card-title">{{ t('wallet.toWalletDetailTitle') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ t('common.currency') }}</span>
              <span class="detail-value">{{ toWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('common.balance') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('common.availableAmount') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.availableInflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 兌換資訊 -->
    <a-card :bordered="false" class="exchange-info">
      <template #title>
        <span class="card-title">{{ t('exchange.exchangeInfo') }}</span>
      </template>
      <div class="exchange-amount-container">
        <a-form layout="vertical">
          <div class="exchange-form-row">
            <a-form-item :label="t('common.field.exchangeAmount')" class="exchange-amount-item">
              <a-input-number
                v-model:value="exchangeAmount"
                :min="0"
                :max="maxAmount"
                :precision="8"
                class="exchange-input"
              />
              <a-checkbox v-model:checked="useMaxAmount" @change="handleMaxAmountChange">
                {{ t('exchange.useMaxAmount') }}
              </a-checkbox>
            </a-form-item>
          </div>
          
          <div class="exchange-info-row">
            <div class="info-item">
              <span class="info-label">{{ t('exchange.rate') }}</span>
              <span class="info-value">{{ formatNumber(currentPrice) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('exchange.receiveAmount') }}</span>
              <span class="info-value">{{ formatNumber(receiveAmount) }}</span>
            </div>
          </div>

          <div class="exchange-button-row">
            <a-button type="primary" @click="handleExchange">
              {{ t('common.action.exchange') }}
            </a-button>
          </div>
        </a-form>
      </div>
    </a-card>

    <!-- 兌換確認彈窗 -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="t('common.prompt.exchangeConfirmation')"
      @ok="handleConfirmExchange"
      @cancel="handleCancelExchange"
      :confirmLoading="confirmLoading"
      width="600px"
    >
      <div class="confirm-content">
        <!-- 兌出資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ t('wallet.fromWalletInfoTitle') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.merchant') }}</span>
              <span class="confirm-value">{{ fromWalletForm.merchant }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.chainType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.currency') }}</span>
              <span class="confirm-value">{{ fromWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.address') }}</span>
              <span class="confirm-value">{{ fromWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 兌入資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ t('wallet.toWalletInfoTitle') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.merchant') }}</span>
              <span class="confirm-value">{{ toWalletForm.merchant }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.chainType') }}</span>
              <span class="confirm-value">{{ toWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.currency') }}</span>
              <span class="confirm-value">{{ toWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.address') }}</span>
              <span class="confirm-value">{{ toWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 兌換金額資訊 -->
        <div class="confirm-amount">
          <span class="confirm-label">{{ t('common.field.exchangeAmount') }}</span>
          <span class="confirm-value">{{ formatNumber(exchangeAmount) }}</span>
        </div>
      </div>
    </a-modal>

    <!-- 兌換列表 -->
    <a-card :title="t('exchange.exchangeList')" class="exchange-card list-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            {{ t('common.action.query') }}
          </a-button>
          <a-button @click="handleReset">{{ t('common.action.reset') }}</a-button>
        </a-space>
      </template>
      <a-table
        :columns="columns"
        :data-source="exchangeList"
        :loading="loading"
        :pagination="pagination"
        :bordered="true"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'exchangeStatus'">
            <a-tag :color="getStatusColor(record.exchangeStatus)">
              {{ t(`common.status.${record.exchangeStatus}`) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <template v-if="record.exchangeStatus === 'pending'">
                <a-button type="primary" size="small" @click="handleAudit(record)">
                  {{ t('common.action.audit') }}
                </a-button>
              </template>
              <template v-else>
                <a-button type="link" size="small" @click="handleViewDetail(record)">
                  {{ t('common.action.detail') }}
                </a-button>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 審核彈窗 -->
    <a-modal
      v-model:open="auditModalVisible"
      :title="t('common.action.audit')"
      @ok="handleConfirmAudit"
      @cancel="handleCancelAudit"
      :confirmLoading="auditLoading"
      width="500px"
    >
      <a-form :model="auditForm" layout="vertical">
        <a-form-item :label="t('common.field.auditStatus')" required>
          <a-radio-group v-model:value="auditForm.status">
            <a-radio value="approved">{{ t('common.auditStatus.approved') }}</a-radio>
            <a-radio value="rejected">{{ t('common.auditStatus.rejected') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('common.field.auditReason')" required>
          <a-textarea
            v-model:value="auditForm.reason"
            :placeholder="t('common.prompt.pleaseInputAuditReason')"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 詳情彈窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="t('common.action.detail')"
      :footer="null"
      width="800px"
    >
      <template v-if="currentRecord">
        <a-descriptions bordered :column="2">
          <a-descriptions-item :label="t('common.field.exchangeId')">
            {{ currentRecord.exchangeId }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.exchangeStatus')">
            <a-tag :color="getStatusColor(currentRecord.exchangeStatus)">
              {{ t(`common.status.${currentRecord.exchangeStatus}`) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.fromWalletId')">
            {{ currentRecord.fromWalletId }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.toWalletId')">
            {{ currentRecord.toWalletId }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.fromChainType')">
            {{ currentRecord.fromChainType }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.toChainType')">
            {{ currentRecord.toChainType }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.fromCurrency')">
            {{ currentRecord.fromCurrency }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.toCurrency')">
            {{ currentRecord.toCurrency }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.fromAmount')">
            {{ formatNumber(currentRecord.fromAmount) }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('common.field.toAmount')">
            {{ formatNumber(currentRecord.toAmount) }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Tag, Button, Space, Modal, Form, Radio, Input, Descriptions } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'

const { t } = useI18n()

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
const currentPrice = ref(1.5) // 當前兌換價格
const receiveAmount = computed(() => exchangeAmount.value * currentPrice.value) // 計算獲得數量
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
    message.success(t('common.prompt.querySuccess'))
  } catch (error) {
    message.error(t('common.prompt.queryFailed'))
  }
}

// 處理兌入錢包查詢
const handleToWalletQuery = async () => {
  try {
    // 這裡添加查詢邏輯
    message.success(t('common.prompt.querySuccess'))
  } catch (error) {
    message.error(t('common.prompt.queryFailed'))
  }
}

// 兌換確認相關
const confirmModalVisible = ref(false)
const confirmLoading = ref(false)

// 處理兌換按鈕點擊
const handleExchange = () => {
  if (!exchangeAmount.value) {
    message.warning(t('common.prompt.pleaseInputExchangeAmount'))
    return
  }
  if (exchangeAmount.value > maxAmount.value) {
    message.warning(t('common.prompt.exchangeAmountExceedsAvailableBalance'))
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
    message.success(t('common.prompt.exchangeSuccess'))
    confirmModalVisible.value = false
    handleQuery() // 重新加載列表
  } catch (error) {
    message.error(t('common.prompt.exchangeFailed'))
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
    title: t('common.field.exchangeId'),
    dataIndex: 'exchangeId',
    key: 'exchangeId',
    width: 180,
  },
  {
    title: t('common.field.fromWalletId'),
    dataIndex: 'fromWalletId',
    key: 'fromWalletId',
    width: 180,
  },
  {
    title: t('common.field.fromChainType'),
    dataIndex: 'fromChainType',
    key: 'fromChainType',
    width: 120,
  },
  {
    title: t('common.field.fromCurrency'),
    dataIndex: 'fromCurrency',
    key: 'fromCurrency',
    width: 120,
  },
  {
    title: t('common.field.fromAmount'),
    dataIndex: 'fromAmount',
    key: 'fromAmount',
    width: 120,
  },
  {
    title: t('common.field.toWalletId'),
    dataIndex: 'toWalletId',
    key: 'toWalletId',
    width: 180,
  },
  {
    title: t('common.field.toChainType'),
    dataIndex: 'toChainType',
    key: 'toChainType',
    width: 120,
  },
  {
    title: t('common.field.toCurrency'),
    dataIndex: 'toCurrency',
    key: 'toCurrency',
    width: 120,
  },
  {
    title: t('common.field.toAmount'),
    dataIndex: 'toAmount',
    key: 'toAmount',
    width: 120,
  },
  {
    title: t('common.field.exchangeStatus'),
    dataIndex: 'exchangeStatus',
    key: 'exchangeStatus',
    width: 160,
  },
  {
    title: t('common.field.action'),
    key: 'action',
    width: 100,
    fixed: 'right',
  }
]

// 獲取狀態顏色
const getStatusColor = (status) => {
  const statusMap = {
    pending: 'warning',
    transferringOut: 'processing',
    exchanging: 'processing',
    transferringIn: 'processing',
    success: 'success',
    transferOutFailed: 'error',
    exchangeFailed: 'error',
    rejected: 'error',
  }
  return statusMap[status] || 'default'
}

// 審核相關
const auditModalVisible = ref(false)
const auditLoading = ref(false)
const currentRecord = ref(null)
const auditForm = reactive({
  status: 'approved',
  reason: ''
})

// 詳情相關
const detailModalVisible = ref(false)

// 處理審核
const handleAudit = (record) => {
  currentRecord.value = record
  auditModalVisible.value = true
}

// 確認審核
const handleConfirmAudit = async () => {
  if (!auditForm.reason) {
    message.warning(t('common.prompt.pleaseInputAuditReason'))
    return
  }

  try {
    auditLoading.value = true
    // TODO: 調用審核 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(t('common.prompt.auditSuccess'))
    auditModalVisible.value = false
    handleQuery() // 重新加載列表
  } catch (error) {
    message.error(t('common.prompt.auditFailed'))
  } finally {
    auditLoading.value = false
  }
}

// 取消審核
const handleCancelAudit = () => {
  auditModalVisible.value = false
  auditForm.status = 'approved'
  auditForm.reason = ''
}

// 查看詳情
const handleViewDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

// 生成模擬數據
const generateMockData = () => {
  const data = []
  for (let i = 0; i < 10; i++) {
    data.push({
      exchangeId: `EX${String(i + 1).padStart(6, '0')}`,
      fromWalletId: `商戶${i + 1}`,
      fromChainType: 'ETH',
      fromCurrency: 'USDT',
      fromAmount: Math.random() * 1000000,
      toWalletId: `商戶${i + 2}`,
      toChainType: 'BSC',
      toCurrency: 'USDT',
      toAmount: Math.random() * 1000000,
      exchangeStatus: ['pending', 'transferringOut', 'exchanging', 'transferringIn', 'success', 'transferOutFailed', 'exchangeFailed', 'rejected'][Math.floor(Math.random() * 8)],
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
    message.error(t('common.prompt.queryFailed'))
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
  padding: 24px;
}

.exchange-form-row {
  margin-bottom: 24px;
}

.exchange-amount-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.exchange-input {
  width: 200px;
}

.exchange-info-row {
  display: flex;
  gap: 48px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--item-hover-bg);
  border-radius: 4px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.info-value {
  color: var(--text-color);
  font-size: 16px;
  font-weight: 500;
}

.exchange-button-row {
  display: flex;
  justify-content: flex-end;
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