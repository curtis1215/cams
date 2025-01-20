<template>
  <div class="transaction-detail">
    <a-card :title="t('transactionDetailQuery')" :bordered="false">
      <a-form layout="inline" :model="queryParams">
        <a-form-item :label="t('dateRange')">
          <date-range-select
            v-model="queryParams.dateRange"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item :label="t('chainType')">
          <ChainTypeSelect
            v-model="queryParams.chainType"
          />
        </a-form-item>

        <a-form-item :label="t('currency')">
          <CurrencySelect
            v-model="queryParams.currency"
          />
        </a-form-item>

        <a-form-item :label="t('fromAddress')">
          <a-input
            v-model:value="queryParams.fromAddress"
            :placeholder="t('pleaseInputFromAddress')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('toAddress')">
          <a-input
            v-model:value="queryParams.toAddress"
            :placeholder="t('pleaseInputToAddress')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('txHash')">
          <a-input
            v-model:value="queryParams.txHash"
            :placeholder="t('pleaseInputTxHash')"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="t('blockHeight')">
          <a-input-number
            v-model:value="queryParams.blockHeight"
            :placeholder="t('pleaseInputBlockHeight')"
            :min="0"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item :label="t('status')">
          <a-select
            v-model:value="queryParams.status"
            :placeholder="t('pleaseSelectStatus')"
            style="width: 200px"
            allow-clear
          >
            <a-select-option value="success">{{ t('success') }}</a-select-option>
            <a-select-option value="confirming">
              {{ t('confirming', { current: queryParams.confirmations?.current || 0, required: queryParams.confirmations?.required || 0 }) }}
            </a-select-option>
            <a-select-option value="failed">{{ t('failed') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              {{ t('search') }}
            </a-button>
            <a-button @click="handleReset">
              {{ t('reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :title="t('transactionList')" :bordered="false">
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

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { CopyOutlined, LinkOutlined } from '@ant-design/icons-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'

const { t } = useI18n()

const queryParams = reactive({
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
  Object.keys(queryParams).forEach(key => {
    if (key === 'confirmations') {
      queryParams[key] = { current: 0, required: 0 }
    } else {
      queryParams[key] = undefined
    }
  })
  queryParams.dateRange = []
}

const columns = [
  {
    title: t('detailId'),
    dataIndex: 'detailId',
    key: 'detailId',
    width: 180,
  },
  {
    title: t('chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 100,
  },
  {
    title: t('currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 100,
  },
  {
    title: t('fromInfo'),
    key: 'fromInfo',
    width: 300,
  },
  {
    title: t('toInfo'),
    key: 'toInfo',
    width: 300,
  },
  {
    title: t('txHash'),
    dataIndex: 'txHash',
    key: 'txHash',
    width: 300,
  },
  {
    title: t('feeCurrency'),
    dataIndex: 'feeCurrency',
    key: 'feeCurrency',
    width: 100,
  },
  {
    title: t('feeAmount'),
    dataIndex: 'feeAmount',
    key: 'feeAmount',
    width: 120,
  },
  {
    title: t('status'),
    key: 'status',
    width: 120,
  },
  {
    title: t('onChainTime'),
    dataIndex: 'onChainTime',
    key: 'onChainTime',
    width: 180,
  },
  {
    title: t('confirmTime'),
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
  showTotal: (total) => t('totalItems', { total })
})

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // TODO: Implement pagination query logic
}

const getStatusText = (status) => {
  const statusMap = {
    success: t('success'),
    confirming: t('confirming', { current: 6, required: 12 }),
    failed: t('failed')
  }
  return statusMap[status] || status
}

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 4)}****${address.slice(-4)}`
}

const formatTxHash = (hash) => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}****${hash.slice(-6)}`
}

const copyAddress = async (address) => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('copySuccess'))
  } catch (err) {
    message.error(t('copyFailed'))
  }
}

const copyTxHash = async (txHash) => {
  try {
    await navigator.clipboard.writeText(txHash)
    message.success(t('copySuccess'))
  } catch (err) {
    message.error(t('copyFailed'))
  }
}

const openTxHashLink = (txHash) => {
  // TODO: Open transaction hash link based on chain type
  window.open(`https://etherscan.io/tx/${txHash}`, '_blank')
}

// Simulated table data
const tableData = [
  {
    key: '1',
    detailId: 'TX202403150001',
    chainType: 'ETH',
    currency: 'USDT',
    fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
    fromWalletId: 'W202403150001',
    toAddress: '0x2345678901abcdef2345678901abcdef23456789',
    toWalletId: 'W202403150002',
    txHash: '0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
    feeCurrency: 'ETH',
    feeAmount: '0.005',
    status: 'success',
    onChainTime: '2024-03-15 10:00:00',
    confirmTime: '2024-03-15 10:30:00'
  },
  {
    key: '2',
    detailId: 'TX202403150002',
    chainType: 'BTC',
    currency: 'BTC',
    fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    fromWalletId: null,
    toAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    toWalletId: 'W202403150003',
    txHash: '6b912f1c30397c84472bf8588278f53986a4f0b1fc5d9b5d3c9f5c45f2f12345',
    feeCurrency: 'BTC',
    feeAmount: '0.0001',
    status: 'confirming',
    onChainTime: '2024-03-15 09:45:00',
    confirmTime: null
  },
  {
    key: '3',
    detailId: 'TX202403150003',
    chainType: 'TRON',
    currency: 'USDT',
    fromAddress: 'TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL',
    fromWalletId: 'W202403150004',
    toAddress: 'TYsbWxTuqQgpEJBHtFuVaXnGXzqQC8SWqz',
    toWalletId: null,
    txHash: '7b42f89e3b1f9c8d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
    feeCurrency: 'TRX',
    feeAmount: '1.5',
    status: 'failed',
    onChainTime: '2024-03-15 09:30:00',
    confirmTime: null
  },
  {
    key: '4',
    detailId: 'TX202403150004',
    chainType: 'ETH',
    currency: 'ETH',
    fromAddress: '0x3456789012abcdef3456789012abcdef34567890',
    fromWalletId: 'W202403150005',
    toAddress: '0x4567890123abcdef4567890123abcdef45678901',
    toWalletId: 'W202403150006',
    txHash: '0xdef5678def5678def5678def5678def5678def5678def5678def5678def5678',
    feeCurrency: 'ETH',
    feeAmount: '0.003',
    status: 'success',
    onChainTime: '2024-03-15 09:15:00',
    confirmTime: '2024-03-15 09:45:00'
  },
  {
    key: '5',
    detailId: 'TX202403150005',
    chainType: 'BTC',
    currency: 'BTC',
    fromAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    fromWalletId: 'W202403150007',
    toAddress: 'bc1q9h6mqkfqht9ckhz9txy6fmwp0xn6rz2qz7g8vg',
    toWalletId: null,
    txHash: '8c023f1d41397c84472bf8588278f53986a4f0b1fc5d9b5d3c9f5c45f2f12345',
    feeCurrency: 'BTC',
    feeAmount: '0.00015',
    status: 'confirming',
    onChainTime: '2024-03-15 09:00:00',
    confirmTime: null
  },
  {
    key: '6',
    detailId: 'TX202403150006',
    chainType: 'TRON',
    currency: 'TRX',
    fromAddress: 'TQVxjVy2sYt4at45ezD3ssQMm4qr3pKxvY',
    fromWalletId: null,
    toAddress: 'TWpWJGkZXHJKLmZCpHHpBRzMaKBk9SyL5H',
    toWalletId: 'W202403150008',
    txHash: '9d53e90f4c2f8d1e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    feeCurrency: 'TRX',
    feeAmount: '1.2',
    status: 'success',
    onChainTime: '2024-03-15 08:45:00',
    confirmTime: '2024-03-15 09:15:00'
  },
  {
    key: '7',
    detailId: 'TX202403150007',
    chainType: 'ETH',
    currency: 'USDC',
    fromAddress: '0x5678901234abcdef5678901234abcdef56789012',
    fromWalletId: 'W202403150009',
    toAddress: '0x6789012345abcdef6789012345abcdef67890123',
    toWalletId: 'W202403150010',
    txHash: '0xef678901ef678901ef678901ef678901ef678901ef678901ef678901ef678901',
    feeCurrency: 'ETH',
    feeAmount: '0.004',
    status: 'failed',
    onChainTime: '2024-03-15 08:30:00',
    confirmTime: null
  },
  {
    key: '8',
    detailId: 'TX202403150008',
    chainType: 'BTC',
    currency: 'BTC',
    fromAddress: 'bc1qxr4fjkvnxjqphuyaw5a08za9g6qqh65t8qwgum',
    fromWalletId: 'W202403150011',
    toAddress: 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej',
    toWalletId: 'W202403150012',
    txHash: 'ad134f2e52397c84472bf8588278f53986a4f0b1fc5d9b5d3c9f5c45f2f12345',
    feeCurrency: 'BTC',
    feeAmount: '0.00012',
    status: 'success',
    onChainTime: '2024-03-15 08:15:00',
    confirmTime: '2024-03-15 08:45:00'
  },
  {
    key: '9',
    detailId: 'TX202403150009',
    chainType: 'TRON',
    currency: 'USDT',
    fromAddress: 'TUrMmF9Gd4rzrXsUFrF2BrAkqjTquc1pXh',
    fromWalletId: null,
    toAddress: 'TVxm4GQK9QhFZsE1k8ekj4CgWzkkqYZZV4',
    toWalletId: null,
    txHash: 'be64f91g5d3h8e2j5k6l7m8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h',
    feeCurrency: 'TRX',
    feeAmount: '1.8',
    status: 'confirming',
    onChainTime: '2024-03-15 08:00:00',
    confirmTime: null
  },
  {
    key: '10',
    detailId: 'TX202403150010',
    chainType: 'ETH',
    currency: 'ETH',
    fromAddress: '0x7890123456abcdef7890123456abcdef78901234',
    fromWalletId: 'W202403150013',
    toAddress: '0x8901234567abcdef8901234567abcdef89012345',
    toWalletId: 'W202403150014',
    txHash: '0xf0123456f0123456f0123456f0123456f0123456f0123456f0123456f0123456',
    feeCurrency: 'ETH',
    feeAmount: '0.002',
    status: 'success',
    onChainTime: '2024-03-15 07:45:00',
    confirmTime: '2024-03-15 08:15:00'
  }
]

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