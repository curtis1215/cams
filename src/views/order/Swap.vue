<template>
  <div class="swap-order">
    <a-card :title="t('title.swapOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('field.orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('prompt.pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.orderStatus')" class="form-item-md">
            <swap-status-select
              v-model="queryParams.orderStatus"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('field.merchant')" class="form-item-md">
            <merchant-select
              v-model="queryParams.merchant"
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
          <a-form-item :label="t('field.txHash')" class="form-item-xl">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('prompt.pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.dateRange')" class="form-item-lg">
            <date-range-select
              v-model="queryParams.dateRange"
              style="width: 100%"
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
      <template #extra>
        <a-button type="primary" @click="handleDownload">
          <template #icon><DownloadOutlined /></template>
          {{ t('action.download') }}
        </a-button>
      </template>
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

          <template v-else-if="column.key === 'transactionDocument'">
            <div class="transaction-document">
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
                  <a class="txhash-link" @click="handleTxHashDetailClick(record.txHash)">{{ formatTxHash(record.txHash) }}</a>
                  <copy-outlined class="action-icon" @click="copyTxHash(record.txHash)" />
                  <link-outlined class="action-icon" @click="handleTxHashExplorerClick(record.txHash)" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'transactionAmount'">
            <div class="amount-info">
              <div class="info-item">
                <span class="label">{{ t('field.orderTransactionAmount') }}:</span>
                <span>{{ record.orderTransactionAmount }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('field.actualTransactionAmount') }}:</span>
                <span>{{ record.actualTransactionAmount }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'exchangeAmount'">
            <div class="amount-info">
              <div class="info-item">
                <span class="label">{{ t('field.orderExchangeAmount') }}:</span>
                <span>{{ record.orderExchangeAmount }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('field.actualExchangeAmount') }}:</span>
                <span>{{ record.actualExchangeAmount }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'unitPrice'">
            <div class="amount-info">
              <div class="info-item">
                <span class="label">{{ t('field.orderUnitPrice') }}:</span>
                <span>{{ record.orderUnitPrice }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('field.actualUnitPrice') }}:</span>
                <span>{{ record.actualUnitPrice }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'orderStatus'">
            <a-tag :class="['status-tag', `status-${record.orderStatus}`]">
              {{ getOrderStatusText(record.orderStatus) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'notifyStatus'">
            <div class="notify-status-container">
              <a-tag :class="['status-tag', `notify-${record.notifyStatus}`]">
                {{ getNotifyStatusText(record.notifyStatus) }}
              </a-tag>
              <a-button
                v-if="record.notifyStatus === 'notifyFailed'"
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
              <div class="info-item notify-history">
                <a-button type="link" size="small" @click="handleNotifyHistory(record)">
                  {{ t('title.notifyHistory') }}
                </a-button>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="notifyHistoryVisible"
      :title="`${currentRecord?.platformOrderId || ''} ${t('title.notifyHistory')}`"
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined, LinkOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import SwapStatusSelect from '@/components/selectors/SwapStatusSelect.vue'
import '@/styles/common.css'
import zhLocale from '@/locales/order/Swap/zh.json'
import enLocale from '@/locales/order/Swap/en.json'
import mockData from '@/mock/order/Swap/swap.mock.json'
import type { TablePaginationConfig } from 'ant-design-vue'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 定義介面
interface QueryParams {
  dateRange: string[]
  merchant: string | undefined
  orderStatus: string | undefined
  orderId: string
  txHash: string
  userId: string
}

interface SwapRecord {
  serialNumber: number
  merchant: string
  platformOrderId: string
  merchantOrderId: string
  transferId: string
  txHash: string
  chainType: string
  transactionCurrency: string
  orderTransactionAmount: string
  actualTransactionAmount: string
  exchangeCurrency: string
  orderExchangeAmount: string
  actualExchangeAmount: string
  orderUnitPrice: string
  actualUnitPrice: string
  orderStatus: 'pending' | 'processing' | 'swapSuccess' | 'swapFailed' | 'manualConfirm'
  notifyStatus: 'notifyPending' | 'notifyRetrying' | 'notifySuccess' | 'notifyFailed'
  createTime: string
  successTime?: string
  notifyTime?: string
  userId: string
}

interface NotifyHistoryRecord {
  reason: string
  notifyTime: string
  result: string
}

// 查詢參數
const queryParams = ref<QueryParams>({
  dateRange: [],
  merchant: undefined,
  orderStatus: undefined,
  orderId: '',
  txHash: '',
  userId: ''
})

const handleReset = () => {
  queryParams.value = {
    dateRange: [],
    merchant: undefined,
    orderStatus: undefined,
    orderId: '',
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
    title: t('field.serialNumber'),
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    width: 80,
  },
  {
    title: t('field.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('field.transactionDocument'),
    dataIndex: 'transactionDocument',
    key: 'transactionDocument',
    width: 300,
  },
  {
    title: t('field.chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 100,
  },
  {
    title: t('field.transactionCurrency'),
    dataIndex: 'transactionCurrency',
    key: 'transactionCurrency',
    width: 120,
  },
  {
    title: t('field.transactionAmount'),
    dataIndex: 'transactionAmount',
    key: 'transactionAmount',
    width: 150,
  },
  {
    title: t('field.exchangeCurrency'),
    dataIndex: 'exchangeCurrency',
    key: 'exchangeCurrency',
    width: 120,
  },
  {
    title: t('field.exchangeAmount'),
    dataIndex: 'exchangeAmount',
    key: 'exchangeAmount',
    width: 150,
  },
  {
    title: t('field.unitPrice'),
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: 150,
  },
  {
    title: t('field.orderStatus'),
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    width: 120,
  },
  {
    title: t('field.notifyStatus'),
    dataIndex: 'notifyStatus',
    key: 'notifyStatus',
    width: 120,
  },
  {
    title: t('field.timeInfo'),
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

const handleTableChange = (
  pag: TablePaginationConfig,
  filters: Record<string, string[]>,
  sorter: { field?: string; order?: 'ascend' | 'descend' | null }
) => {
  if (pag.current) pagination.value.current = pag.current
  if (pag.pageSize) pagination.value.pageSize = pag.pageSize
  // 這裡可以添加獲取數據的邏輯
}

const getOrderStatusText = (status: SwapRecord['orderStatus']): string => {
  return t(`status.${status}`)
}

const getNotifyStatusText = (status: SwapRecord['notifyStatus']): string => {
  return t(`status.${status}`)
}

const handleTransferIdClick = (transferId: string): void => {
  const route = {
    path: '/wallet/transfer',
    query: {
      transferId
    }
  }
  window.open(`#${route.path}?transferId=${route.query.transferId}`, '_blank')
}

const handleTxHashDetailClick = (txHash: string): void => {
  const route = {
    path: '/order/transaction',
    query: {
      txHash
    }
  }
  window.open(`#${route.path}?txHash=${route.query.txHash}`, '_blank')
}

const handleTxHashExplorerClick = (txHash: string): void => {
  const explorerUrl = import.meta.env.VITE_EXPLORER_URL || 'https://etherscan.io/tx/'
  window.open(`${explorerUrl}${txHash}`, '_blank')
}

const handleRetryNotify = (record: SwapRecord) => {
  currentRecord.value = record
  notifyUrl.value = 'https://api.example.com/callback' // 預設的通知 URL
  notifyContent.value = {
    orderId: record.platformOrderId,
    merchantId: record.merchant,
    status: record.orderStatus,
    transactionAmount: record.actualTransactionAmount,
    exchangeAmount: record.actualExchangeAmount,
    txHash: record.txHash,
  }
  errorContent.value = {
    code: 500,
    message: 'Internal Server Error',
    timestamp: '2024-01-15 10:05:00',
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

const highlightJson = (json: Record<string, unknown>): string => {
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

const copyContent = async (content: Record<string, unknown>): Promise<void> => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(content, null, 2))
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const notifyHistoryVisible = ref<boolean>(false)
const currentRecord = ref<SwapRecord | null>(null)
const notifyHistoryData = ref<NotifyHistoryRecord[]>([])

const notifyHistoryColumns = computed(() => [
  {
    title: t('field.notifyReason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 200,
  },
  {
    title: t('field.notifyTime'),
    dataIndex: 'notifyTime',
    key: 'notifyTime',
    width: 180,
  },
  {
    title: t('field.notifyResult'),
    dataIndex: 'result',
    key: 'result',
    width: 120,
  }
])

const handleNotifyHistory = (record: SwapRecord) => {
  currentRecord.value = record
  notifyHistoryVisible.value = true
  notifyHistoryData.value = mockData.notifyHistoryData as NotifyHistoryRecord[]
}

const tableData = ref<SwapRecord[]>(mockData.tableData as unknown as SwapRecord[])

// 通知詳情相關
const notifyDetailVisible = ref<boolean>(false)
const notifyUrl = ref<string>('')
const notifyContent = ref<Record<string, unknown>>({})
const errorContent = ref<Record<string, unknown>>({})

const formatTxHash = (hash: string): string => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}***${hash.slice(-6)}`
}

const copyTxHash = async (hash: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(hash)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const handleDownload = () => {
  const columnsArray = columns.value
  const headers = columnsArray.map(col => col.title).join(',')
  const rows = tableData.value.map(row => {
    return columnsArray.map(col => {
      const value = row[col.dataIndex as keyof SwapRecord] || ''
      return `"${value}"`
    }).join(',')
  })
  
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `swap_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(t('message.downloadSuccess'))
}
</script>

<style scoped>
.swap-order {
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

.transaction-document {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount-info {
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

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-tag {
  min-width: 90px;
  text-align: center;
}

.status-pending {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.status-processing {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.status-swapSuccess {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-swapFailed {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.status-manualConfirm {
  background: rgba(114, 46, 209, 0.1);
  color: #722ed1;
  border: 1px solid #722ed1;
}

.notify-notifyPending {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.notify-notifyRetrying {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.notify-notifySuccess {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.notify-notifyFailed {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
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