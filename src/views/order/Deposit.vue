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
      <template #extra>
        <a-button type="primary" @click="handleDownload">
          <template #icon><DownloadOutlined /></template>
          {{ t('action.download') }}
        </a-button>
      </template>
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          :bordered="true"
          :scroll="{ x: 1500 }"
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
                <div class="info-item notify-history">
                  <a-button type="link" size="small" @click="handleNotifyHistory(record)">
                    {{ t('title.notifyHistory') }}
                  </a-button>
                </div>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 通知歷史彈窗 -->
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
import OrderStatusSelect from '@/components/selectors/OrderStatusSelect.vue'
import '@/styles/common.css'
import zhLocale from '@/locales/order/Deposit/zh.json'
import enLocale from '@/locales/order/Deposit/en.json'
import mockData from '@/mock/order/Deposit/deposit.mock.json'
import type { TablePaginationConfig } from 'ant-design-vue'

// 定義介面
interface QueryParams {
  dateRange: string[]
  merchant: string | undefined
  status: string | undefined
  orderId: string
  address: string
  txHash: string
  userId: string
}

interface DepositRecord {
  platformOrderId: string
  merchantOrderId: string
  transferId: string
  txHash: string
  merchant: string
  amount: string
  usdtValue: string
  address: string
  orderStatus: 'confirming' | 'success' | 'failed' | 'timeout'
  notifyStatus: 'retrying' | 'success' | 'timeout'
  confirmations?: number
  requiredConfirmations?: number
  createTime: string
  successTime?: string
  notifyTime?: string
}

interface NotifyHistoryRecord {
  reason: string
  notifyTime: string
  result: string
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const queryParams = ref<QueryParams>({
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

const tableData = ref<DepositRecord[]>(mockData.data as unknown as DepositRecord[])
const pagination = ref({
  total: mockData.total,
  current: mockData.current,
  pageSize: mockData.pageSize,
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

const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 4)}****${address.slice(-4)}`
}

const copyAddress = async (address: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const getOrderStatusText = (record: DepositRecord): string => {
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

const getNotifyStatusText = (status: DepositRecord['notifyStatus']): string => {
  const statusMap = {
    success: t('status.successful'),
    timeout: t('status.timeout'),
    retrying: t('status.retrying')
  }
  return statusMap[status] || status
}

const handleTransferIdClick = (transferId: string) => {
  // 處理轉帳單號點擊事件
  console.log('TransferId clicked:', transferId)
}

const handleTxHashClick = (txHash: string) => {
  // 處理 TxHash 點擊事件
  console.log('TxHash clicked:', txHash)
}

// 通知詳情相關
const notifyDetailVisible = ref<boolean>(false)
const notifyUrl = ref<string>('')
const notifyContent = ref<Record<string, unknown>>({})
const errorContent = ref<Record<string, unknown>>({})
const currentRecord = ref<DepositRecord | null>(null)

const handleRetryNotify = (record: DepositRecord) => {
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

const highlightJson = (json: object): string => {
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

const copyContent = async (content: object) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(content, null, 2))
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const formatTxHash = (hash: string): string => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}****${hash.slice(-6)}`
}

const copyTxHash = async (hash: string) => {
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
      const value = row[col.dataIndex as keyof DepositRecord] || ''
      return `"${value}"`
    }).join(',')
  })
  
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `deposit_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(t('message.downloadSuccess'))
}

// 通知歷史相關
const notifyHistoryVisible = ref<boolean>(false)
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

const handleNotifyHistory = (record: DepositRecord) => {
  currentRecord.value = record
  notifyHistoryVisible.value = true
  // 使用模擬的通知歷史資料
  notifyHistoryData.value = [
    {
      reason: '首次通知',
      notifyTime: '2024-03-15 10:00:00',
      result: '成功'
    },
    {
      reason: '重試通知',
      notifyTime: '2024-03-15 10:05:00',
      result: '失敗'
    },
    {
      reason: '最終通知',
      notifyTime: '2024-03-15 10:10:00',
      result: '成功'
    }
  ]
}
</script>

<style scoped>
.deposit-order {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
}

.table-card {
  margin-bottom: 24px;
}

.deposit-order :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.deposit-order :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.deposit-order :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.deposit-order :deep(.ant-card-body) {
  background-color: #141414;
  padding: 20px 24px;
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

/* 表格內的按鈕樣式 */
:deep(.ant-btn-link) {
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}

/* 地址欄位的省略樣式 */
:deep(.ant-table-cell-ellipsis) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.copy-icon {
  margin-left: 8px;
  color: var(--ant-primary-color);
  cursor: pointer;
  transition: all 0.3s;
}

.copy-icon:hover {
  opacity: 0.8;
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

/* 訂單資訊樣式 */
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

/* 狀態標籤樣式 */
.status-tag {
  min-width: 90px;
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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

/* 通知狀態容器樣式 */
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

/* 通知詳情樣式 */
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

.json-string { color: #6a8759; }
.json-number { color: #6897bb; }
.json-boolean { color: #cc7832; }
.json-null { color: #cc7832; }
.json-key { color: #9876aa; }
</style> 