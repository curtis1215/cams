<template>
  <div class="withdraw-order">
    <a-card :title="t('withdraw.withdrawOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('withdraw.orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('withdraw.pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('withdraw.dateRange')" class="form-item-lg">
            <date-range-select
              v-model="queryParams.dateRange"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('withdraw.merchant')" class="form-item-md">
            <merchant-select
              v-model="queryParams.merchant"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('withdraw.status')" class="form-item-sm">
            <withdraw-status-select
              v-model="queryParams.status"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('withdraw.userId')" class="form-item-md">
            <a-input
              v-model:value="queryParams.userId"
              :placeholder="t('withdraw.pleaseInputUserId')"
              allow-clear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item :label="t('withdraw.address')" class="form-item-xl">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="t('withdraw.pleaseInputAddress')"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="TxHash" class="form-item-xl">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('withdraw.pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <div class="form-item-sm button-group">
            <a-space>
              <a-button @click="handleReset">{{ t('withdraw.reset') }}</a-button>
              <a-button type="primary" @click="handleQuery">{{ t('withdraw.query') }}</a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>

    <a-card :title="t('withdraw.orderList')" class="list-card">
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
                <span class="label">{{ t('withdraw.platformOrderId') }}:</span>
                <span>{{ record.platformOrderId }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('withdraw.merchantOrderId') }}:</span>
                <span>{{ record.merchantOrderId }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('withdraw.transferId') }}:</span>
                <template v-if="record.showTransferDetail">
                  <a-button type="link" size="small" @click="handleTransferDetail(record.transferId)">
                    {{ t('withdraw.details') }}
                  </a-button>
                </template>
                <template v-else>
                  <a @click="handleTransferIdClick(record.transferId)">{{ record.transferId }}</a>
                </template>
              </div>
              <div class="info-item">
                <span class="label">TxHash:</span>
                <div class="txhash-container">
                  <a class="txhash-link" @click="handleTxHashDetailClick(record.txHash)">{{ formatTxHash(record.txHash) }}</a>
                  <copy-outlined class="action-icon" @click="copyTxHash(record.txHash)" />
                  <link-outlined class="action-icon" @click="handleTxHashExplorerClick(record.txHash)" />
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
              {{ record.orderStatus === 'confirming' 
                ? `${getOrderStatusText(record.orderStatus)}(${record.confirmations}/${record.requiredConfirmations})` 
                : getOrderStatusText(record.orderStatus) }}
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
                {{ t('withdraw.retry') }}
              </a-button>
            </div>
          </template>

          <template v-else-if="column.key === 'timeInfo'">
            <div class="time-info">
              <div class="info-item">
                <span class="label">{{ t('withdraw.createTime') }}:</span>
                <span>{{ record.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('withdraw.successTime') }}:</span>
                <span>{{ record.successTime || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('withdraw.notifyTime') }}:</span>
                <span>{{ record.notifyTime || '-' }}</span>
              </div>
              <div class="info-item notify-history">
                <a-button type="link" size="small" @click="handleNotifyHistory(record)">
                  {{ t('withdraw.notifyHistory') }}
                </a-button>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="notifyHistoryVisible"
      :title="`${currentRecord?.platformOrderId || ''} ${t('withdraw.notifyHistory')}`"
      :footer="null"
      width="600px"
    >
      <a-table
        :columns="notifyHistoryColumns"
        :data-source="notifyHistoryData"
        :pagination="false"
        :bordered="true"
      />
    </a-modal>

    <!-- 通知詳情彈窗 -->
    <a-modal
      v-model:open="notifyDetailVisible"
      :title="t('withdraw.notifyDetail')"
      :width="800"
      @cancel="handleNotifyDetailCancel"
    >
      <div class="notify-detail">
        <div class="detail-item">
          <div class="detail-label">{{ t('withdraw.notifyUrl') }}:</div>
          <a-input v-model:value="notifyUrl" class="notify-url-input" />
        </div>
        <div class="detail-item">
          <div class="detail-label">{{ t('withdraw.notifyContent') }}:</div>
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
          <div class="detail-label">{{ t('withdraw.errorContent') }}:</div>
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
          <a-button @click="handleNotifyDetailCancel">{{ t('withdraw.cancel') }}</a-button>
          <a-button type="primary" @click="handleNotifyRetry">{{ t('withdraw.retry') }}</a-button>
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
import WithdrawStatusSelect from '@/components/selectors/WithdrawStatusSelect.vue'
import '@/styles/common.css'
import zhLocale from '@/locales/order/Withdraw/zh.json'
import enLocale from '@/locales/order/Withdraw/en.json'
import zhCommon from '@/locales/common/zh.json'
import enCommon from '@/locales/common/en.json'
import mockData from '@/mock/order/Withdraw/withdraw.mock.json'

const messages = {
  zh: {
    common: zhCommon,
    withdraw: zhLocale
  },
  en: {
    common: enCommon,
    withdraw: enLocale
  }
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
    title: t('withdraw.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('withdraw.transactionDocument'),
    dataIndex: 'orderInfo',
    key: 'orderInfo',
    width: 300,
  },
  {
    title: t('withdraw.transactionAmount'),
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    width: 120,
  },
  {
    title: t('withdraw.usdtValue'),
    dataIndex: 'usdtValue',
    key: 'usdtValue',
    align: 'right',
    width: 120,
  },
  {
    title: t('withdraw.receivingAddress'),
    dataIndex: 'address',
    key: 'address',
    width: 200,
  },
  {
    title: t('withdraw.orderStatus'),
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    width: 120,
  },
  {
    title: t('withdraw.notifyStatus'),
    dataIndex: 'notifyStatus',
    key: 'notifyStatus',
    width: 120,
  },
  {
    title: t('withdraw.timeInfo'),
    dataIndex: 'timeInfo',
    key: 'timeInfo',
    width: 300,
  },
])

const pagination = ref({
  total: 100,
  current: 1,
  pageSize: 10,
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
    message.success(t('withdraw.copySuccess'))
  } catch (err) {
    message.error(t('withdraw.copyFailed'))
  }
}

const getOrderStatusText = (status) => {
  const statusMap = {
    waiting: t('withdraw.waiting'),
    confirming: t('withdraw.confirming'),
    processing: t('withdraw.processing'),
    retrying: t('withdraw.retrying'),
    success: `${t('withdraw.successful')}(x/x)`,
    failed: t('withdraw.failed')
  }
  return statusMap[status] || status
}

const getNotifyStatusText = (status) => {
  const statusMap = {
    success: t('withdraw.successful'),
    timeout: t('withdraw.notifyTimeout'),
    retrying: t('withdraw.retrying')
  }
  return statusMap[status] || status
}

const handleTransferIdClick = (transferId) => {
  // 跳轉到轉帳訂單查詢頁面
  const route = {
    path: '/wallet/transfer',
    query: {
      transferId
    }
  }
  window.open(`#${route.path}?transferId=${route.query.transferId}`, '_blank')
}

const handleTxHashDetailClick = (txHash) => {
  // 跳轉到交易詳情查詢頁面
  const route = {
    path: '/order/transaction',
    query: {
      txHash
    }
  }
  window.open(`#${route.path}?txHash=${route.query.txHash}`, '_blank')
}

const handleTxHashExplorerClick = (txHash) => {
  // 跳轉到區塊鏈瀏覽器查看交易詳情
  const explorerUrl = import.meta.env.VITE_EXPLORER_URL || 'https://etherscan.io/tx/'
  window.open(`${explorerUrl}${txHash}`, '_blank')
}

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
    message.success(t('withdraw.copySuccess'))
  } catch (err) {
    message.error(t('withdraw.copyFailed'))
  }
}

const notifyHistoryVisible = ref(false)
const currentRecord = ref(null)
const notifyHistoryData = ref([])

const notifyHistoryColumns = computed(() => [
  {
    title: t('withdraw.notifyReason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 200,
  },
  {
    title: t('withdraw.notifyTime'),
    dataIndex: 'notifyTime',
    key: 'notifyTime',
    width: 180,
  },
  {
    title: t('withdraw.notifyResult'),
    dataIndex: 'result',
    key: 'result',
    width: 120,
  }
])

const handleNotifyHistory = (record) => {
  currentRecord.value = record
  notifyHistoryVisible.value = true
  notifyHistoryData.value = mockData.notifyHistoryData
}

const tableData = ref(mockData.tableData)

// 通知詳情相關
const notifyDetailVisible = ref(false)
const notifyUrl = ref('')
const notifyContent = ref({})
const errorContent = ref({})

const formatTxHash = (hash) => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}***${hash.slice(-6)}`
}

const copyTxHash = async (hash) => {
  try {
    await navigator.clipboard.writeText(hash)
    message.success(t('withdraw.copySuccess'))
  } catch (err) {
    message.error(t('withdraw.copyFailed'))
  }
}
</script>

<style scoped>
.withdraw-order {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
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

.list-card {
  margin-bottom: 24px;
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

.status-waiting {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.status-processing {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.status-retrying {
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

.status-confirming {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.notify-history {
  margin-top: 4px;
  padding-left: 88px;  /* 與上方 label 的 min-width 對齊 */
}

:deep(.notify-history .ant-btn-link) {
  padding: 0;
  height: 20px;
  line-height: 20px;
}

:deep(.ant-modal-content) {
  background-color: #141414;
  border: 1px solid #303030;
}

:deep(.ant-modal-header) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-modal-close:hover) {
  color: rgba(255, 255, 255, 0.85);
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

.txhash-link {
  color: #177ddc;
  cursor: pointer;
  text-decoration: none;
}

.txhash-link:hover {
  color: #1890ff;
  text-decoration: underline;
}
</style> 