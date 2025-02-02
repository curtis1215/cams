<template>
  <div class="exchange-order">
    <a-card :title="t('exchange.exchangeOrderQuery')" :bordered="false">
      <a-form layout="inline" :model="queryParams">
        <a-form-item :label="t('exchange.fromWalletId')">
          <a-input
            v-model="queryParams.fromWalletId"
            :placeholder="t('prompt.inputFromWalletId')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('exchange.toWalletId')">
          <a-input
            v-model="queryParams.toWalletId"
            :placeholder="t('prompt.inputToWalletId')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('exchange.fromChainType')">
          <chain-type-select
            v-model="queryParams.fromChainType"
            :placeholder="t('prompt.selectFromChainType')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('exchange.fromCurrency')">
          <currency-select
            v-model="queryParams.fromCurrency"
            :placeholder="t('prompt.selectFromCurrency')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('exchange.toChainType')">
          <chain-type-select
            v-model="queryParams.toChainType"
            :placeholder="t('prompt.selectToChainType')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('exchange.toCurrency')">
          <currency-select
            v-model="queryParams.toCurrency"
            :placeholder="t('prompt.selectToCurrency')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('status.label')">
          <a-select
            v-model:value="queryParams.status"
            :placeholder="t('prompt.select')"
            :style="{ width: '180px' }"
            :dropdown-match-select-width="false"
            allow-clear
          >
            <a-select-option value="pending">{{ t('status.pending') }}</a-select-option>
            <a-select-option value="rejected">{{ t('status.rejected') }}</a-select-option>
            <a-select-option value="transferringOut">{{ t('status.transferringOut') }}</a-select-option>
            <a-select-option value="exchanging">{{ t('status.exchanging') }}</a-select-option>
            <a-select-option value="transferringIn">{{ t('status.transferringIn') }}</a-select-option>
            <a-select-option value="success">{{ t('status.success') }}</a-select-option>
            <a-select-option value="transferOutFailed">{{ t('status.transferOutFailed') }}</a-select-option>
            <a-select-option value="exchangeFailed">{{ t('status.exchangeFailed') }}</a-select-option>
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

    <a-card :title="t('exchange.exchangeOrderList')" :bordered="false" class="mt-4">
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
          :scroll="{ x: 2400 }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'status'">
              <a-tag :class="['status-tag', `status-${record.status}`]">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <template v-if="column.key === 'fee'">
              <div class="fee-info">
                <div>{{ record.feeCurrency }}: {{ record.feeAmount }}</div>
                <div class="fee-value">${{ record.feeValue }}</div>
              </div>
            </template>

            <template v-if="column.key === 'exchangeOrderId'">
              <span>{{ text }}</span>
            </template>

            <template v-if="column.key === 'fromTransferId'">
              <a v-if="text" @click="handleTransferClick(text, 'from')" class="order-link">{{ text }}</a>
              <span v-else>-</span>
            </template>

            <template v-if="column.key === 'toTransferId'">
              <a v-if="text" @click="handleTransferClick(text, 'to')" class="order-link">{{ text }}</a>
              <span v-else>-</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import mockData from '@/mock/order/Exchange/exchange.mock.json'
import zhLocale from '@/locales/order/Exchange/zh.json'
import enLocale from '@/locales/order/Exchange/en.json'
import type { TableColumnType } from 'ant-design-vue'

interface QueryParams {
  fromWalletId: string
  toWalletId: string
  fromChainType: string | undefined
  fromCurrency: string | undefined
  toChainType: string | undefined
  toCurrency: string | undefined
  status: string | undefined
}

interface ExchangeRecord {
  exchangeOrderId: string
  fromWalletId: string
  fromChainType: string
  fromCurrency: string
  fromAmount: string
  fromTransferCreateTime: string
  fromTransferOnChainTime: string
  fromTransferCompleteTime: string
  fromTransferId: string
  toWalletId: string
  toChainType: string
  toCurrency: string
  toAmount: string
  toTransferCreateTime: string
  toTransferOnChainTime: string
  toTransferCompleteTime: string
  toTransferId: string
  feeCurrency: string
  feeAmount: string
  feeValue: string
  status: 'pending' | 'rejected' | 'transferringOut' | 'exchanging' | 'transferringIn' | 'success' | 'transferOutFailed' | 'exchangeFailed'
  createTime: string
  updateTime: string
}

interface ColumnRenderProps<T = any> {
  text: T
  record: ExchangeRecord
  index: number
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
  fromWalletId: '',
  toWalletId: '',
  fromChainType: undefined,
  fromCurrency: undefined,
  toChainType: undefined,
  toCurrency: undefined,
  status: undefined
})

const handleSearch = () => {
  console.log('Search with params:', queryParams)
  // TODO: 實現搜索邏輯
}

const handleReset = () => {
  (Object.keys(queryParams) as Array<keyof QueryParams>).forEach(key => {
    if (key === 'fromWalletId' || key === 'toWalletId') {
      queryParams[key] = ''
    } else {
      queryParams[key] = undefined
    }
  })
}

const columns: TableColumnType<ExchangeRecord>[] = [
  {
    title: t('exchange.exchangeOrderId'),
    dataIndex: 'exchangeOrderId',
    key: 'exchangeOrderId',
    width: 180,
  },
  {
    title: t('exchange.fromWalletId'),
    dataIndex: 'fromWalletId',
    key: 'fromWalletId',
    width: 150,
  },
  {
    title: t('exchange.fromChainType'),
    key: 'fromChainType',
    width: 120,
    customRender: ({ record }: ColumnRenderProps) => {
      return h('div', { class: 'chain-currency-info' }, [
        h('div', { class: 'chain-type' }, record.fromChainType),
        h('div', { class: 'currency' }, record.fromCurrency)
      ])
    }
  },
  {
    title: t('exchange.fromAmount'),
    dataIndex: 'fromAmount',
    key: 'fromAmount',
    width: 120,
  },
  {
    title: t('exchange.fromTransferTime'),
    key: 'fromTransferTime',
    width: 180,
    customRender: ({ record }: ColumnRenderProps) => {
      return h('div', { class: 'time-info' }, [
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.createTime')}:`),
          h('span', null, record.fromTransferCreateTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.onChainTime')}:`),
          h('span', null, record.fromTransferOnChainTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.completeTime')}:`),
          h('span', null, record.fromTransferCompleteTime)
        ])
      ])
    }
  },
  {
    title: t('exchange.fromTransferId'),
    dataIndex: 'fromTransferId',
    key: 'fromTransferId',
    width: 180,
    customRender: ({ text }: ColumnRenderProps<string>) => {
      if (!text) return h('span', null, '-')
      return h('a', {
        class: 'order-link',
        onClick: () => handleTransferClick(text, 'from')
      }, text)
    }
  },
  {
    title: t('exchange.targetExchange'),
    dataIndex: 'targetExchange',
    key: 'targetExchange',
    width: 120,
  },
  {
    title: t('exchange.exchangeRate'),
    dataIndex: 'exchangeRate',
    key: 'exchangeRate',
    width: 120,
  },
  {
    title: t('exchange.toWalletId'),
    dataIndex: 'toWalletId',
    key: 'toWalletId',
    width: 150,
  },
  {
    title: t('exchange.toChainType'),
    key: 'toChainType',
    width: 120,
    customRender: ({ record }: ColumnRenderProps) => {
      return h('div', { class: 'chain-currency-info' }, [
        h('div', { class: 'chain-type' }, record.toChainType),
        h('div', { class: 'currency' }, record.toCurrency)
      ])
    }
  },
  {
    title: t('exchange.toAmount'),
    dataIndex: 'toAmount',
    key: 'toAmount',
    width: 120,
  },
  {
    title: t('exchange.toTransferTime'),
    key: 'toTransferTime',
    width: 180,
    customRender: ({ record }: ColumnRenderProps) => {
      return h('div', { class: 'time-info' }, [
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.createTime')}:`),
          h('span', null, record.toTransferCreateTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.onChainTime')}:`),
          h('span', null, record.toTransferOnChainTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.completeTime')}:`),
          h('span', null, record.toTransferCompleteTime)
        ])
      ])
    }
  },
  {
    title: t('exchange.toTransferId'),
    dataIndex: 'toTransferId',
    key: 'toTransferId',
    width: 180,
    customRender: ({ text }: ColumnRenderProps<string>) => {
      if (!text) return h('span', null, '-')
      return h('a', {
        class: 'order-link',
        onClick: () => handleTransferClick(text, 'to')
      }, text)
    }
  },
  {
    title: t('field.fee'),
    key: 'fee',
    width: 150,
  },
  {
    title: t('field.feeValue'),
    dataIndex: 'feeValue',
    key: 'feeValue',
    width: 120,
  },
  {
    title: t('exchange.exchangeTime'),
    key: 'exchangeTime',
    width: 180,
    customRender: ({ record }: ColumnRenderProps) => {
      return h('div', { class: 'time-info' }, [
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.createTime')}:`),
          h('span', null, record.createTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('field.updateTime')}:`),
          h('span', null, record.updateTime)
        ])
      ])
    }
  },
  {
    title: t('status.label'),
    key: 'status',
    width: 150,
  },
]

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => t('total', { total }),
  showSizeChanger: true,
})

const tableData = ref<ExchangeRecord[]>(
  (mockData.exchangeOrders as any[]).map(item => ({
    ...item,
    status: item.status as ExchangeRecord['status']
  }))
)

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // TODO: 實現分頁邏輯
}

const getStatusText = (status: ExchangeRecord['status']) => {
  const statusMap = {
    pending: t('status.pending'),
    rejected: t('status.rejected'),
    transferringOut: t('status.transferringOut'),
    exchanging: t('status.exchanging'),
    transferringIn: t('status.transferringIn'),
    success: t('status.success'),
    transferOutFailed: t('status.transferOutFailed'),
    exchangeFailed: t('status.exchangeFailed'),
  }
  return statusMap[status] || status
}

const handleOrderClick = (orderId: string) => {
  console.log('Navigate to exchange order detail:', orderId)
  // TODO: 實現導航到兌幣訂單詳情頁面的邏輯
}

const handleTransferClick = (transferId: string, type: 'from' | 'to') => {
  console.log(`Navigate to ${type} transfer detail:`, transferId)
  // TODO: 實現導航到轉帳訂單詳情頁面的邏輯
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success(t('message.copyToClipboardSuccess'))
  } catch (err) {
    message.error(t('message.copyToClipboardFailed'))
  }
}

const handleDownload = () => {
  // 將表格數據轉換為CSV格式
  const headers = columns.map(col => col.title).join(',')
  const rows = tableData.value.map(row => {
    return columns.map(col => {
      const dataIndex = col.dataIndex as keyof ExchangeRecord | undefined
      const value = dataIndex ? row[dataIndex] : ''
      return `"${value}"`
    }).join(',')
  })
  
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `exchange_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(t('message.downloadSuccess'))
}
</script>

<style scoped>
.exchange-order {
  padding: 24px;
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

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 0;
  margin-right: 0;
}

.mt-4 {
  margin-top: 16px;
}

.status-tag {
  min-width: 90px;
  text-align: center;
}

.status-pending {
  color: #177ddc;
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid #177ddc;
}

.status-rejected {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid #ff4d4f;
}

.status-transferringOut,
.status-exchanging,
.status-transferringIn {
  color: #faad14;
  background: rgba(250, 173, 20, 0.1);
  border: 1px solid #faad14;
}

.status-success {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid #52c41a;
}

.status-transferOutFailed,
.status-exchangeFailed {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid #ff4d4f;
}

.fee-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fee-value {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

.transfer-id {
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

.table-container {
  width: 100%;
  overflow-x: auto;
}

:deep(.ant-table) {
  overflow-x: auto;
  white-space: nowrap;
}

:deep(.ant-table-thead > tr > th) {
  white-space: nowrap;
  background: #1f1f1f;
  border-bottom: 1px solid #303030;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-table-tbody > tr > td) {
  white-space: nowrap;
  background: transparent;
  border-bottom: 1px solid #303030;
}

.order-link {
  color: #177ddc;
  cursor: pointer;
  transition: all 0.3s;
}

.order-link:hover {
  color: #1890ff;
  text-decoration: underline;
}

.chain-currency-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chain-type {
  color: rgba(255, 255, 255, 0.85);
}

.currency {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-row {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.time-label {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-select-dropdown) {
  min-width: 200px !important;
}
</style>