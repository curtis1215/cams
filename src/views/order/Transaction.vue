<template>
  <div class="transaction-detail">
    <a-card :title="t('title.transactionDetailQuery')" :bordered="false">
      <a-form layout="inline" :model="queryParams">
        <a-form-item :label="t('field.dateRange')">
          <date-range-select
            v-model="queryParams.dateRange"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item :label="t('field.chainType')">
          <ChainTypeSelect
            v-model="queryParams.chainType"
          />
        </a-form-item>

        <a-form-item :label="t('field.currency')">
          <CurrencySelect
            v-model="queryParams.currency"
          />
        </a-form-item>

        <a-form-item :label="t('field.fromAddress')">
          <a-input
            v-model:value="queryParams.fromAddress"
            :placeholder="t('prompt.pleaseInputFromAddress')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('field.toAddress')">
          <a-input
            v-model:value="queryParams.toAddress"
            :placeholder="t('prompt.pleaseInputToAddress')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('field.txHash')">
          <a-input
            v-model:value="queryParams.txHash"
            :placeholder="t('prompt.pleaseInputTxHash')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('field.blockHeight')">
          <a-input-number
            v-model:value="queryParams.blockHeight"
            :placeholder="t('prompt.pleaseInputBlockHeight')"
            :min="0"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item :label="t('field.status')">
          <a-select
            v-model:value="queryParams.status"
            :placeholder="t('prompt.pleaseSelectStatus')"
            style="width: 200px"
            allow-clear
          >
            <a-select-option value="success">{{ t('status.success') }}</a-select-option>
            <a-select-option value="confirming">
              {{ t('status.confirming', { current: queryParams.confirmations?.current || 0, required: queryParams.confirmations?.required || 0 }) }}
            </a-select-option>
            <a-select-option value="failed">{{ t('status.failed') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              {{ t('action.search') }}
            </a-button>
            <a-button @click="handleReset">
              {{ t('action.reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :title="t('title.transactionList')" :bordered="false">
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
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'fromInfo'">
            <div class="address-info">
              <div class="address">
                <span>{{ formatAddress(record.fromAddress) }}</span>
                <CopyOutlined class="action-icon" @click="copyAddress(record.fromAddress)" />
              </div>
              <div v-if="record.fromWalletId" class="wallet-id">{{ record.fromWalletId }}</div>
            </div>
          </template>

          <template v-else-if="column.key === 'toInfo'">
            <div class="address-info">
              <div class="address">
                <span>{{ formatAddress(record.toAddress) }}</span>
                <CopyOutlined class="action-icon" @click="copyAddress(record.toAddress)" />
              </div>
              <div v-if="record.toWalletId" class="wallet-id">{{ record.toWalletId }}</div>
            </div>
          </template>

          <template v-else-if="column.key === 'txHash'">
            <div class="hash-container">
              <span class="hash-text">{{ formatTxHash(text) }}</span>
              <div class="icon-group">
                <CopyOutlined class="action-icon" @click="copyTxHash(text)" />
                <LinkOutlined class="action-icon" @click="openTxHashLink(text)" />
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :class="['status-tag', `status-${record.status}`]">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { CopyOutlined, LinkOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import zhLocale from '@/locales/order/Transaction/zh.json'
import enLocale from '@/locales/order/Transaction/en.json'
import mockData from '@/mock/order/Transaction/transaction.mock.json'
import type { TablePaginationConfig } from 'ant-design-vue'

interface QueryParams {
  dateRange: string[]
  chainType: string | undefined
  currency: string | undefined
  fromAddress: string
  toAddress: string
  txHash: string
  blockHeight: number | undefined
  status: string | undefined
  confirmations: {
    current: number
    required: number
  }
}

interface TransactionRecord {
  detailId: string
  chainType: string
  currency: string
  fromAddress: string
  fromWalletId?: string
  toAddress: string
  toWalletId?: string
  txHash: string
  feeCurrency: string
  feeAmount: string
  status: 'success' | 'confirming' | 'failed'
  onChainTime: string
  confirmTime: string
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const queryParams = reactive<QueryParams>({
  dateRange: [],
  chainType: undefined,
  currency: undefined,
  fromAddress: '',
  toAddress: '',
  txHash: '',
  blockHeight: undefined,
  status: undefined,
  confirmations: {
    current: 0,
    required: 0
  }
})

const handleSearch = () => {
  console.log('Search with form state:', queryParams)
  // TODO: Implement search logic
}

const handleReset = () => {
  (Object.keys(queryParams) as Array<keyof QueryParams>).forEach((key) => {
    if (key === 'confirmations') {
      queryParams[key] = { current: 0, required: 0 }
    } else if (key === 'dateRange') {
      queryParams[key] = []
    } else if (key === 'fromAddress' || key === 'toAddress' || key === 'txHash') {
      queryParams[key] = ''
    } else {
      queryParams[key] = undefined
    }
  })
}

const columns = [
  {
    title: t('field.detailId'),
    dataIndex: 'detailId',
    key: 'detailId',
    width: 180,
  },
  {
    title: t('field.chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 100,
  },
  {
    title: t('field.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 100,
  },
  {
    title: t('field.fromAddress'),
    key: 'fromInfo',
    width: 300,
  },
  {
    title: t('field.toAddress'),
    key: 'toInfo',
    width: 300,
  },
  {
    title: t('field.txHash'),
    dataIndex: 'txHash',
    key: 'txHash',
    width: 300,
  },
  {
    title: t('field.feeCurrency'),
    dataIndex: 'feeCurrency',
    key: 'feeCurrency',
    width: 100,
  },
  {
    title: t('field.feeAmount'),
    dataIndex: 'feeAmount',
    key: 'feeAmount',
    width: 120,
  },
  {
    title: t('field.status'),
    key: 'status',
    width: 120,
  },
  {
    title: t('field.onChainTime'),
    dataIndex: 'onChainTime',
    key: 'onChainTime',
    width: 180,
  },
  {
    title: t('field.confirmTime'),
    dataIndex: 'confirmTime',
    key: 'confirmTime',
    width: 180,
  }
]

const pagination = reactive({
  total: 100,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => t('totalItems', { total })
})

const handleTableChange = (
  pag: TablePaginationConfig,
  filters: Record<string, string[]>,
  sorter: { field?: string; order?: 'ascend' | 'descend' | null }
) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  // TODO: Implement pagination query logic
}

const getStatusText = (status: TransactionRecord['status']) => {
  const statusMap = {
    success: t('status.success'),
    confirming: t('status.confirming', { current: 6, required: 12 }),
    failed: t('status.failed')
  }
  return statusMap[status] || status
}

const formatAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}****${address.slice(-4)}`
}

const formatTxHash = (hash: string) => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}****${hash.slice(-6)}`
}

const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const copyTxHash = async (txHash: string) => {
  try {
    await navigator.clipboard.writeText(txHash)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const openTxHashLink = (txHash: string) => {
  // TODO: Open transaction hash link based on chain type
  window.open(`https://etherscan.io/tx/${txHash}`, '_blank')
}

// 使用 mock 數據並進行類型轉換
const tableData = ref<TransactionRecord[]>(
  (mockData.transactionList as any[]).map(item => ({
    ...item,
    status: item.status as TransactionRecord['status']
  }))
)

const handleDownload = () => {
  // 將表格數據轉換為CSV格式
  const headers = columns.map(col => col.title).join(',')
  const rows = tableData.value.map(row => {
    return columns.map(col => {
      const value = row[col.dataIndex as keyof TransactionRecord] || ''
      return `"${value}"`
    }).join(',')
  })
  
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `transaction_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(t('message.downloadSuccess'))
}

</script>

<style scoped>
.transaction-detail {
  padding: 24px;
}

:deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
  margin-bottom: 24px;
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
  padding: 24px;
  overflow-x: auto;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 0;
  margin-right: 0;
}

:deep(.ant-table-wrapper) {
  overflow-x: auto;
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

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: rgba(255, 255, 255, 0.08);
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

.address-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address {
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-all;
}

.address .action-icon {
  flex-shrink: 0;
}

.wallet-id {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

.hash-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hash-text {
  word-break: break-all;
}

.icon-group {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-icon {
  cursor: pointer;
  color: #177ddc;
  transition: all 0.3s;
}

.action-icon:hover {
  opacity: 0.8;
}

.status-tag {
  min-width: 90px;
  text-align: center;
}

.status-success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-confirming {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.status-failed {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}
</style>