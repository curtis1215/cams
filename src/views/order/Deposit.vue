<template>
  <div class="deposit-order">
    <a-card :title="t('title.depositOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('field.orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('prompt.pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.dateRange')" class="form-item-lg">
            <date-range-select
              v-model="queryParams.dateRange"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('field.merchant')" class="form-item-md">
            <merchant-select
              v-model="queryParams.merchant"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('field.status')" class="form-item-sm">
            <order-status-select
              v-model="queryParams.status"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('field.userId')" class="form-item-md">
            <a-input
              v-model:value="queryParams.userId"
              :placeholder="t('prompt.pleaseInputUserId')"
              allow-clear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item :label="t('field.address')" class="form-item-xl">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="t('prompt.pleaseInputAddress')"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="TxHash" class="form-item-xl">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('prompt.pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <div class="form-item-sm button-group">
            <a-space>
              <a-button @click="handleReset">{{ t('action.reset') }}</a-button>
              <a-button type="primary" @click="handleQuery">{{ t('action.query') }}</a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>

    <a-card :title="t('title.orderList')" class="list-card">
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          :bordered="true"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'merchant'">
              {{ text }}
            </template>
            
            <template v-else-if="column.key === 'orderInfo'">
              <div class="order-info">
                <div class="info-item">
                  <span class="label">{{ t('field.platformOrderId') }}:</span>
                  <span>{{ record.platformOrderId }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('field.merchantOrderId') }}:</span>
                  <span>{{ record.merchantOrderId }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('field.transferId') }}:</span>
                  <a @click="handleTransferIdClick(record.transferId)">{{ record.transferId }}</a>
                </div>
                <div class="info-item">
                  <span class="label">TxHash:</span>
                  <div class="txhash-container">
                    <span>{{ formatTxHash(record.txHash) }}</span>
                    <copy-outlined class="action-icon" @click="copyTxHash(record.txHash)" />
                    <link-outlined class="action-icon" @click="handleTxHashClick(record.txHash)" />
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'address'">
              <div class="address-container">
                <span>{{ formatAddress(text) }}</span>
                <copy-outlined class="copy-icon" @click="copyAddress(text)" />
              </div>
            </template>

            <template v-else-if="column.key === 'orderStatus'">
              <a-tag :class="['status-tag', `status-${record.orderStatus}`]">
                {{ getOrderStatusText(record) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'notifyStatus'">
              <div class="notify-status-container">
                <a-tag :class="['status-tag', `notify-${record.notifyStatus}`]">
                  {{ getNotifyStatusText(record.notifyStatus) }}
                </a-tag>
                <a-button
                  v-if="record.notifyStatus === 'timeout'"
                  type="link"
                  size="small"
                  class="retry-button"
                  @click="handleRetryNotify(record)"
                >
                  {{ t('action.retry') }}
                </a-button>
              </div>
            </template>

            <template v-else-if="column.key === 'timeInfo'">
              <div class="time-info">
                <div class="info-item">
                  <span class="label">{{ t('field.createTime') }}:</span>
                  <span>{{ record.createTime }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('field.successTime') }}:</span>
                  <span>{{ record.successTime || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('field.notifyTime') }}:</span>
                  <span>{{ record.notifyTime || '-' }}</span>
                </div>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 通知詳情彈窗 -->
    <a-modal
      v-model:open="notifyDetailVisible"
      :title="t('title.notifyDetail')"
      :width="800"
      @cancel="handleNotifyDetailCancel"
    >
      <div class="notify-detail">
        <div class="detail-item">
          <div class="detail-label">{{ t('field.notifyUrl') }}:</div>
          <a-input v-model:value="notifyUrl" class="notify-url-input" />
        </div>
        <div class="detail-item">
          <div class="detail-label">{{ t('field.notifyContent') }}:</div>
          <div class="code-block-wrapper">
            <div class="code-header">
              <span>JSON</span>
              <copy-outlined class="copy-icon" @click="copyContent(notifyContent)" />
            </div>
            <a-card class="code-card">
              <pre class="code-block json"><code v-html="highlightJson(notifyContent)"></code></pre>
            </a-card>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">{{ t('field.errorContent') }}:</div>
          <div class="code-block-wrapper">
            <div class="code-header">
              <span>JSON</span>
              <copy-outlined class="copy-icon" @click="copyContent(errorContent)" />
            </div>
            <a-card class="code-card">
              <pre class="code-block json"><code v-html="highlightJson(errorContent)"></code></pre>
            </a-card>
          </div>
        </div>
      </div>
      <template #footer>
        <a-space>
          <a-button @click="handleNotifyDetailCancel">{{ t('action.cancel') }}</a-button>
          <a-button type="primary" @click="handleNotifyRetry">{{ t('action.retry') }}</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import OrderStatusSelect from '@/components/selectors/OrderStatusSelect.vue'
import '@/styles/common.css'
import zhLocale from '@/locales/order/Deposit/zh.json'
import enLocale from '@/locales/order/Deposit/en.json'
import mockData from '@/mock/order/Deposit/deposit.mock.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const queryParams = ref({
  dateRange: [],
  merchant: undefined,
  status: undefined,
  orderId: '',
  address: '',
  txHash: '',
  userId: ''
})

const handleReset = () => {
  queryParams.value = {
    dateRange: [],
    merchant: undefined,
    status: undefined,
    orderId: '',
    address: '',
    txHash: '',
    userId: ''
  }
}

const handleQuery = () => {
  // 實現查詢邏輯
  console.log('Query with params:', queryParams.value)
}

const columns = computed(() => [
  {
    title: t('table.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('table.transactionDocument'),
    dataIndex: 'orderInfo',
    key: 'orderInfo',
    width: 300,
  },
  {
    title: t('table.transactionAmount'),
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    width: 120,
  },
  {
    title: t('table.usdtValue'),
    dataIndex: 'usdtValue',
    key: 'usdtValue',
    align: 'right',
    width: 120,
  },
  {
    title: t('table.receivingAddress'),
    dataIndex: 'address',
    key: 'address',
    width: 200,
  },
  {
    title: t('table.orderStatus'),
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    width: 120,
  },
  {
    title: t('table.notifyStatus'),
    dataIndex: 'notifyStatus',
    key: 'notifyStatus',
    width: 120,
  },
  {
    title: t('table.timeInfo'),
    dataIndex: 'timeInfo',
    key: 'timeInfo',
    width: 300,
  },
])

const tableData = ref(mockData.data)
const pagination = ref({
  total: mockData.total,
  current: mockData.current,
  pageSize: mockData.pageSize,
  showSizeChanger: true,
  showQuickJumper: true,
})

const handleTableChange = (pag, filters, sorter) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  // 這裡可以添加獲取數據的邏輯
}

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 4)}****${address.slice(-4)}`
}

const copyAddress = async (address) => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const getOrderStatusText = (record) => {
  const { orderStatus, confirmations, requiredConfirmations } = record
  switch (orderStatus) {
    case 'confirming':
      return `${t('status.confirming')}(${confirmations}/${requiredConfirmations})`
    case 'success':
      return `${t('status.successful')}(${requiredConfirmations}/${requiredConfirmations})`
    case 'failed':
      return t('status.failed')
    default:
      return orderStatus
  }
}

const getNotifyStatusText = (status) => {
  const statusMap = {
    success: t('status.successful'),
    timeout: t('status.timeout'),
    retrying: t('status.retrying')
  }
  return statusMap[status] || status
}

const handleTransferIdClick = (transferId) => {
  // 處理轉帳單號點擊事件
  console.log('TransferId clicked:', transferId)
}

const handleTxHashClick = (txHash) => {
  // 處理 TxHash 點擊事件
  console.log('TxHash clicked:', txHash)
}

// 通知詳情相關
const notifyDetailVisible = ref(false)
const notifyUrl = ref('')
const notifyContent = ref({})
const errorContent = ref({})
const currentRecord = ref(null)

const handleRetryNotify = (record) => {
  currentRecord.value = record
  notifyUrl.value = 'https://api.example.com/callback' // 預設的通知 URL
  notifyContent.value = {
    orderId: record.platformOrderId,
    merchantId: record.merchant,
    status: record.orderStatus,
    amount: record.amount,
    txHash: record.txHash,
    // ... 其他通知內容
  }
  errorContent.value = {
    code: 500,
    message: 'Internal Server Error',
    timestamp: '2024-01-15 10:05:00',
    // ... 其他錯誤內容
  }
  notifyDetailVisible.value = true
}

const handleNotifyDetailCancel = () => {
  notifyDetailVisible.value = false
  currentRecord.value = null
}

const handleNotifyRetry = () => {
  // 實現重試邏輯
  console.log('Retry notify with URL:', notifyUrl.value)
  console.log('Record:', currentRecord.value)
  notifyDetailVisible.value = false
  currentRecord.value = null
}

const highlightJson = (json) => {
  const jsonString = JSON.stringify(json, null, 2)
  return jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key'
        } else {
          cls = 'string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (/null/.test(match)) {
        cls = 'null'
      }
      return `<span class="json-${cls}">${match}</span>`
    })
}

const copyContent = async (content) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(content, null, 2))
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const formatTxHash = (hash) => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}****${hash.slice(-6)}`
}

const copyTxHash = async (hash) => {
  try {
    await navigator.clipboard.writeText(hash)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}
</script>

<style scoped>
.deposit-order {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.list-card {
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

.query-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
}

.form-row:last-child {
  margin-bottom: 0;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.form-item-xl {
  flex: 3;
  min-width: 0;
}

.form-item-lg {
  flex: 2;
  min-width: 0;
}

.form-item-md {
  flex: 1.5;
  min-width: 0;
}

.form-item-sm {
  flex: 1;
  min-width: 0;
}

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item .label {
  color: rgba(255, 255, 255, 0.45);
  min-width: 80px;
}

.info-item a {
  color: #177ddc;
  cursor: pointer;
  text-decoration: none;
}

.info-item a:hover {
  color: #1890ff;
  text-decoration: underline;
}

.address-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  cursor: pointer;
  color: #177ddc;
  transition: all 0.3s;
}

.copy-icon:hover {
  opacity: 0.8;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-tag {
  min-width: 90px;
  text-align: center;
}

.status-confirming {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.status-success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-failed {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.notify-success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.notify-timeout {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.notify-retrying {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.notify-status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.retry-button {
  padding: 0;
  height: 20px;
  line-height: 20px;
}

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

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: rgba(255, 255, 255, 0.08);
}

.txhash-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  cursor: pointer;
  color: #177ddc;
  transition: all 0.3s;
}

.action-icon:hover {
  opacity: 0.8;
}

.notify-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.notify-url-input {
  width: 100%;
}

.code-block-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #303030;
  border-bottom: none;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  color: #a9b7c6;
}

.code-card {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: #000;
}

.code-block {
  margin: 0;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #a9b7c6;
  white-space: pre-wrap;
  word-break: break-all;
}

.json-string {
  color: #6a8759;
}

.json-number {
  color: #6897bb;
}

.json-boolean {
  color: #cc7832;
}

.json-null {
  color: #cc7832;
}

.json-key {
  color: #9876aa;
}
</style> 