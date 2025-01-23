<template>
  <div class="wallet-balance">
    <a-card :title="t('reconciliation.WalletBalance.title.walletBalanceQuery')" :bordered="false" class="filter-card">
      <!-- 搜索表單 -->
      <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="query-form">
        <a-form-item :label="t('field.dateRange')" class="form-item">
          <date-range-select
            v-model="searchForm.dateRange"
            :style="{ width: '280px' }"
          />
        </a-form-item>
        <a-form-item :label="t('reconciliation.WalletBalance.form.walletId')" class="form-item">
          <a-input
            v-model:value="searchForm.walletId"
            :placeholder="t('reconciliation.WalletBalance.form.pleaseEnterWalletId')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('reconciliation.WalletBalance.form.walletAddress')" class="form-item">
          <a-input
            v-model:value="searchForm.walletAddress"
            :placeholder="t('reconciliation.WalletBalance.form.pleaseEnterWalletAddress')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('reconciliation.WalletBalance.form.walletType')" class="form-item">
          <wallet-type-select
            v-model="searchForm.walletType"
            :style="{ width: '180px' }"
          />
        </a-form-item>
        <a-form-item :label="t('reconciliation.WalletBalance.form.chainType')" class="form-item">
          <chain-type-select
            v-model="searchForm.chainType"
            :style="{ width: '180px' }"
          />
        </a-form-item>
        <a-form-item :label="t('reconciliation.WalletBalance.form.currency')" class="form-item">
          <currency-select
            v-model="searchForm.currency"
            :style="{ width: '180px' }"
          />
        </a-form-item>
        <a-form-item class="form-item">
          <a-space>
            <a-button type="primary" html-type="submit">
              <template #icon><SearchOutlined /></template>
              {{ t('reconciliation.WalletBalance.common.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              {{ t('reconciliation.WalletBalance.common.reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 對帳明細表格 -->
    <a-card :title="t('reconciliation.WalletBalance.title.reconciliationDetails')" :bordered="false" class="table-card">
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <!-- 餘額列自定義渲染 -->
            <template v-if="column.key === 'balance'">
              {{ formatBalance(record.balance) }}
            </template>
            <!-- 對帳狀態列自定義渲染 -->
            <template v-if="column.key === 'reconciliationStatus'">
              <a-tag :color="record.reconciliationStatus === 'success' ? 'success' : 'error'">
                {{ t(`reconciliation.WalletBalance.status.${record.reconciliationStatus}`) }}
              </a-tag>
            </template>
            <!-- 操作列自定義渲染 -->
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="handleViewDetails(record)">
                {{ t('reconciliation.WalletBalance.action.viewDetails') }}
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 對帳明細彈窗 -->
    <a-modal
      v-model:open="detailsModalVisible"
      :title="t('reconciliation.WalletBalance.title.reconciliationDetails')"
      :width="1200"
      @cancel="handleCloseDetails"
    >
      <!-- 對帳資訊 -->
      <div class="reconciliation-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">{{ t('reconciliation.WalletBalance.details.openingBalance') }}:</span>
            <span class="value">{{ formatBalance(currentDetails?.openingBalance) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('reconciliation.WalletBalance.details.outAmount') }}:</span>
            <span class="value">{{ formatBalance(currentDetails?.outAmount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('reconciliation.WalletBalance.details.inAmount') }}:</span>
            <span class="value">{{ formatBalance(currentDetails?.inAmount) }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">{{ t('reconciliation.WalletBalance.details.theoreticalBalance') }}:</span>
            <span class="value">{{ formatBalance(currentDetails?.theoreticalBalance) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('reconciliation.WalletBalance.details.closingBalance') }}:</span>
            <span class="value">{{ formatBalance(currentDetails?.closingBalance) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('reconciliation.WalletBalance.details.difference') }}:</span>
            <span class="value" :class="{ 'error-text': hasDifference }">
              {{ formatBalance(currentDetails?.difference) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 轉帳訂單表格 -->
      <div class="transfer-orders">
        <div class="section-title">{{ t('reconciliation.WalletBalance.title.transferOrders') }}</div>
        <a-table
          :columns="transferColumns"
          :data-source="currentDetails?.transferOrders"
          :pagination="{ pageSize: 5 }"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <!-- 轉帳類型列自定義渲染 -->
            <template v-if="column.key === 'type'">
              {{ t(`reconciliation.WalletBalance.transferType.${record.type}`) }}
            </template>
            <!-- 轉帳數量列自定義渲染 -->
            <template v-if="column.key === 'amount'">
              <span :class="{ 'negative-amount': isNegativeAmount(record.amount) }">
                {{ formatBalance(record.amount) }}
              </span>
            </template>
            <!-- 交易哈希列自定義渲染 -->
            <template v-if="column.key === 'txHash'">
              <span v-if="record.txHash !== '-'" class="hash-text">{{ record.txHash }}</span>
              <span v-else>-</span>
            </template>
          </template>
        </a-table>
      </div>

      <template #footer>
        <a-button @click="handleCloseDetails">
          {{ t('reconciliation.WalletBalance.common.close') }}
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import WalletTypeSelect from '@/components/selectors/WalletTypeSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import zhLocale from '@/locales/reconciliation/WalletBalance/zh.json'
import enLocale from '@/locales/reconciliation/WalletBalance/en.json'
import dateRangeSelectZh from '@/locales/components/DateRangeSelect/zh.json'
import dateRangeSelectEn from '@/locales/components/DateRangeSelect/en.json'
import mockData from '@/mock/reconciliation/walletbalance/list.mock.json'

const messages = {
  zh: {
    ...zhLocale,
    ...dateRangeSelectZh
  },
  en: {
    ...enLocale,
    ...dateRangeSelectEn
  }
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 搜索表單數據
const searchForm = reactive({
  dateRange: [],
  walletId: '',
  walletAddress: '',
  walletType: undefined,
  chainType: undefined,
  currency: undefined
})

// 表格列定義
const columns = [
  {
    title: t('reconciliation.WalletBalance.table.date'),
    dataIndex: 'date',
    key: 'date',
    width: 120
  },
  {
    title: t('reconciliation.WalletBalance.table.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120
  },
  {
    title: t('reconciliation.WalletBalance.table.walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 150
  },
  {
    title: t('reconciliation.WalletBalance.table.chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 120
  },
  {
    title: t('reconciliation.WalletBalance.table.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 120
  },
  {
    title: t('reconciliation.WalletBalance.table.balance'),
    dataIndex: 'balance',
    key: 'balance',
    width: 200,
    align: 'right'
  },
  {
    title: t('reconciliation.WalletBalance.table.reconciliationStatus'),
    dataIndex: 'reconciliationStatus',
    key: 'reconciliationStatus',
    width: 120
  },
  {
    title: t('reconciliation.WalletBalance.table.action'),
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]

// 表格數據
const tableData = ref(mockData.walletBalanceList)
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: mockData.walletBalanceList.length,
  showSizeChanger: true,
  showQuickJumper: true
})

// 對帳明細相關
const detailsModalVisible = ref(false)
const currentDetails = ref(null)

// 轉帳訂單表格列定義
const transferColumns = [
  {
    title: t('reconciliation.WalletBalance.details.transferId'),
    dataIndex: 'id',
    key: 'id',
    width: 150
  },
  {
    title: t('reconciliation.WalletBalance.details.fromWallet'),
    dataIndex: 'fromWallet',
    key: 'fromWallet',
    width: 150
  },
  {
    title: t('reconciliation.WalletBalance.details.toWallet'),
    dataIndex: 'toWallet',
    key: 'toWallet',
    width: 150
  },
  {
    title: t('reconciliation.WalletBalance.details.transferType'),
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: t('reconciliation.WalletBalance.details.amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    align: 'right'
  },
  {
    title: t('reconciliation.WalletBalance.details.txHash'),
    dataIndex: 'txHash',
    key: 'txHash',
    width: 200
  },
  {
    title: t('reconciliation.WalletBalance.details.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  }
]

// 處理搜索
const handleSearch = () => {
  loading.value = true
  // 模擬 API 調用
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 處理重置
const handleReset = () => {
  searchForm.dateRange = []
  searchForm.walletId = ''
  searchForm.walletAddress = ''
  searchForm.walletType = undefined
  searchForm.chainType = undefined
  searchForm.currency = undefined
  handleSearch()
}

// 處理表格變更
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  handleSearch()
}

// 格式化餘額
const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(balance)
}

// 查看對帳明細
const handleViewDetails = (record) => {
  currentDetails.value = mockData.reconciliationDetails[record.id]
  detailsModalVisible.value = true
}

// 關閉對帳明細
const handleCloseDetails = () => {
  detailsModalVisible.value = false
  currentDetails.value = null
}

// 判斷是否為負數金額
const isNegativeAmount = (amount) => {
  return parseFloat(amount) < 0
}

// 判斷是否有誤差
const hasDifference = computed(() => {
  if (!currentDetails.value) return false
  return parseFloat(currentDetails.value.difference) !== 0
})
</script>

<style scoped>
.wallet-balance {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
  background: #141414;
}

.wallet-balance :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.wallet-balance :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.wallet-balance :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.wallet-balance :deep(.ant-card-body) {
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

.reconciliation-info {
  margin-bottom: 24px;
  background: #1f1f1f;
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  
  .label {
    color: rgba(255, 255, 255, 0.45);
    margin-right: 8px;
    white-space: nowrap;
  }
  
  .value {
    color: rgba(255, 255, 255, 0.85);
    font-family: monospace;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.85);
}

.transfer-orders {
  background: #1f1f1f;
  border-radius: 8px;
  padding: 16px;
}

.negative-amount {
  color: #ff4d4f;
}

.error-text {
  color: #ff4d4f;
}

.hash-text {
  font-family: monospace;
  color: var(--ant-primary-color);
}
</style> 