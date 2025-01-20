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

        <a-form-item :label="t('status')">
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

<script setup>
import { ref, reactive, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'

const { t } = useI18n()

const queryParams = reactive({
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
  Object.keys(queryParams).forEach(key => {
    if (typeof queryParams[key] === 'string') {
      queryParams[key] = ''
    } else {
      queryParams[key] = undefined
    }
  })
}

const columns = [
  {
    title: t('exchange.exchangeOrderId'),
    dataIndex: 'exchangeOrderId',
    key: 'exchangeOrderId',
    width: 180,
    customRender: ({ text }) => h('span', null, text)
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
    customRender: ({ record }) => {
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
    customRender: ({ record }) => {
      return h('div', { class: 'time-info' }, [
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('createTime')}:`),
          h('span', null, record.fromTransferCreateTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('onChainTime')}:`),
          h('span', null, record.fromTransferOnChainTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('completeTime')}:`),
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
    customRender: ({ text }) => {
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
    customRender: ({ record }) => {
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
    customRender: ({ record }) => {
      return h('div', { class: 'time-info' }, [
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('createTime')}:`),
          h('span', null, record.toTransferCreateTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('onChainTime')}:`),
          h('span', null, record.toTransferOnChainTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('completeTime')}:`),
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
    customRender: ({ text }) => {
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
    customRender: ({ record }) => {
      return h('div', { class: 'time-info' }, [
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('createTime')}:`),
          h('span', null, record.createTime)
        ]),
        h('div', { class: 'time-row' }, [
          h('span', { class: 'time-label' }, `${t('updateTime')}:`),
          h('span', null, record.updateTime)
        ])
      ])
    }
  },
  {
    title: t('status'),
    key: 'status',
    width: 150,
  },
]

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => t('total', { total }),
  showSizeChanger: true,
})

const tableData = ref([
  {
    key: '1',
    exchangeOrderId: 'EX202501160001',
    fromWalletId: 'W202501160001',
    fromChainType: 'ETH',
    fromCurrency: 'USDT',
    fromAmount: '1000.00',
    fromTransferId: 'T202501160001OUT',
    fromTransferCreateTime: '2025-01-16 09:00:00',
    fromTransferOnChainTime: '2025-01-16 09:01:30',
    fromTransferCompleteTime: '2025-01-16 09:15:00',
    targetExchange: 'Binance',
    exchangeRate: '1.002',
    toWalletId: 'W202501160002',
    toChainType: 'BSC',
    toCurrency: 'USDT',
    toAmount: '998.00',
    toTransferId: 'T202501160001IN',
    toTransferCreateTime: '2025-01-16 09:16:00',
    toTransferOnChainTime: '2025-01-16 09:17:30',
    toTransferCompleteTime: '2025-01-16 09:30:00',
    feeCurrency: 'USDT',
    feeAmount: '2.00',
    feeValue: '2.00',
    createTime: '2025-01-16 09:00:00',
    updateTime: '2025-01-16 09:30:00',
    status: 'success'
  },
  {
    key: '2',
    exchangeOrderId: 'EX202501160002',
    fromWalletId: 'W202501160003',
    fromChainType: 'BSC',
    fromCurrency: 'BUSD',
    fromAmount: '500.00',
    fromTransferId: 'T202501160002OUT',
    fromTransferCreateTime: '2025-01-16 09:30:00',
    fromTransferOnChainTime: '2025-01-16 09:31:30',
    fromTransferCompleteTime: '2025-01-16 09:45:00',
    targetExchange: 'OKX',
    exchangeRate: '0.999',
    toWalletId: 'W202501160004',
    toChainType: 'ETH',
    toCurrency: 'USDT',
    toAmount: '498.50',
    toTransferId: 'T202501160002IN',
    toTransferCreateTime: '2025-01-16 09:46:00',
    toTransferOnChainTime: '2025-01-16 09:47:30',
    toTransferCompleteTime: '2025-01-16 10:00:00',
    feeCurrency: 'BUSD',
    feeAmount: '1.50',
    feeValue: '1.50',
    createTime: '2025-01-16 09:30:00',
    updateTime: '2025-01-16 10:00:00',
    status: 'pending'
  },
  {
    key: '3',
    exchangeOrderId: 'EX202501160003',
    fromWalletId: 'W202501160005',
    fromChainType: 'TRX',
    fromCurrency: 'USDT',
    fromAmount: '2000.00',
    fromTransferId: 'T202501160003OUT',
    fromTransferCreateTime: '2025-01-16 10:00:00',
    fromTransferOnChainTime: '2025-01-16 10:01:30',
    fromTransferCompleteTime: '2025-01-16 10:15:00',
    targetExchange: 'Binance',
    exchangeRate: '1.001',
    toWalletId: 'W202501160006',
    toChainType: 'BSC',
    toCurrency: 'BUSD',
    toAmount: '1997.00',
    toTransferId: 'T202501160003IN',
    toTransferCreateTime: '2025-01-16 10:16:00',
    toTransferOnChainTime: '2025-01-16 10:17:30',
    toTransferCompleteTime: '2025-01-16 10:30:00',
    feeCurrency: 'USDT',
    feeAmount: '3.00',
    feeValue: '3.00',
    createTime: '2025-01-16 10:00:00',
    updateTime: '2025-01-16 10:30:00',
    status: 'transferringOut'
  },
  {
    key: '4',
    exchangeOrderId: 'EX202501160004',
    fromWalletId: 'W202501160007',
    fromChainType: 'ETH',
    fromCurrency: 'ETH',
    fromAmount: '10.00',
    fromTransferId: 'T202501160004OUT',
    fromTransferCreateTime: '2025-01-16 10:30:00',
    fromTransferOnChainTime: '2025-01-16 10:31:30',
    fromTransferCompleteTime: '2025-01-16 10:45:00',
    targetExchange: 'OKX',
    exchangeRate: '1900.50',
    toWalletId: 'W202501160008',
    toChainType: 'BSC',
    toCurrency: 'USDT',
    toAmount: '18950.00',
    toTransferId: 'T202501160004IN',
    toTransferCreateTime: '2025-01-16 10:46:00',
    toTransferOnChainTime: '2025-01-16 10:47:30',
    toTransferCompleteTime: '2025-01-16 11:00:00',
    feeCurrency: 'ETH',
    feeAmount: '0.05',
    feeValue: '95.03',
    createTime: '2025-01-16 10:30:00',
    updateTime: '2025-01-16 11:00:00',
    status: 'exchanging'
  },
  {
    key: '5',
    exchangeOrderId: 'EX202501160005',
    fromWalletId: 'W202501160009',
    fromChainType: 'BSC',
    fromCurrency: 'USDT',
    fromAmount: '3000.00',
    fromTransferId: 'T202501160005OUT',
    fromTransferCreateTime: '2025-01-16 11:00:00',
    fromTransferOnChainTime: '2025-01-16 11:01:30',
    fromTransferCompleteTime: '2025-01-16 11:15:00',
    targetExchange: 'Binance',
    exchangeRate: '1.003',
    toWalletId: 'W202501160010',
    toChainType: 'TRX',
    toCurrency: 'USDT',
    toAmount: '2994.00',
    toTransferId: 'T202501160005IN',
    toTransferCreateTime: '2025-01-16 11:16:00',
    toTransferOnChainTime: '2025-01-16 11:17:30',
    toTransferCompleteTime: '2025-01-16 11:30:00',
    feeCurrency: 'USDT',
    feeAmount: '6.00',
    feeValue: '6.00',
    createTime: '2025-01-16 11:00:00',
    updateTime: '2025-01-16 11:30:00',
    status: 'transferringIn'
  },
  {
    key: '6',
    exchangeOrderId: 'EX202501160006',
    fromWalletId: 'W202501160011',
    fromChainType: 'ETH',
    fromCurrency: 'USDT',
    fromAmount: '5000.00',
    fromTransferId: 'T202501160006OUT',
    fromTransferCreateTime: '2025-01-16 11:30:00',
    fromTransferOnChainTime: '2025-01-16 11:31:30',
    fromTransferCompleteTime: '2025-01-16 11:45:00',
    targetExchange: 'OKX',
    exchangeRate: '1.001',
    toWalletId: 'W202501160012',
    toChainType: 'BSC',
    toCurrency: 'BUSD',
    toAmount: '4990.00',
    toTransferId: '',
    toTransferCreateTime: '',
    toTransferOnChainTime: '',
    toTransferCompleteTime: '',
    feeCurrency: 'USDT',
    feeAmount: '10.00',
    feeValue: '10.00',
    createTime: '2025-01-16 11:30:00',
    updateTime: '2025-01-16 11:45:00',
    status: 'transferOutFailed'
  },
  {
    key: '7',
    exchangeOrderId: 'EX202501160007',
    fromWalletId: 'W202501160013',
    fromChainType: 'TRX',
    fromCurrency: 'USDT',
    fromAmount: '1500.00',
    fromTransferId: 'T202501160007OUT',
    fromTransferCreateTime: '2025-01-16 11:45:00',
    fromTransferOnChainTime: '2025-01-16 11:46:30',
    fromTransferCompleteTime: '2025-01-16 12:00:00',
    targetExchange: 'Binance',
    exchangeRate: '1.002',
    toWalletId: 'W202501160014',
    toChainType: 'BSC',
    toCurrency: 'BUSD',
    toAmount: '1497.00',
    toTransferId: '',
    toTransferCreateTime: '',
    toTransferOnChainTime: '',
    toTransferCompleteTime: '',
    feeCurrency: 'USDT',
    feeAmount: '3.00',
    feeValue: '3.00',
    createTime: '2025-01-16 11:45:00',
    updateTime: '2025-01-16 12:00:00',
    status: 'exchangeFailed'
  },
  {
    key: '8',
    exchangeOrderId: 'EX202501160008',
    fromWalletId: 'W202501160015',
    fromChainType: 'BSC',
    fromCurrency: 'BUSD',
    fromAmount: '800.00',
    fromTransferId: 'T202501160008OUT',
    fromTransferCreateTime: '2025-01-16 12:00:00',
    fromTransferOnChainTime: '2025-01-16 12:01:30',
    fromTransferCompleteTime: '2025-01-16 12:15:00',
    targetExchange: 'OKX',
    exchangeRate: '0.998',
    toWalletId: 'W202501160016',
    toChainType: 'ETH',
    toCurrency: 'USDT',
    toAmount: '797.60',
    toTransferId: '',
    toTransferCreateTime: '',
    toTransferOnChainTime: '',
    toTransferCompleteTime: '',
    feeCurrency: 'BUSD',
    feeAmount: '2.40',
    feeValue: '2.40',
    createTime: '2025-01-16 12:00:00',
    updateTime: '2025-01-16 12:15:00',
    status: 'rejected'
  },
  {
    key: '9',
    exchangeOrderId: 'EX202501160009',
    fromWalletId: 'W202501160017',
    fromChainType: 'ETH',
    fromCurrency: 'ETH',
    fromAmount: '5.00',
    fromTransferId: 'T202501160009OUT',
    fromTransferCreateTime: '2025-01-16 12:15:00',
    fromTransferOnChainTime: '2025-01-16 12:16:30',
    fromTransferCompleteTime: '2025-01-16 12:30:00',
    targetExchange: 'Binance',
    exchangeRate: '1905.20',
    toWalletId: 'W202501160018',
    toChainType: 'BSC',
    toCurrency: 'USDT',
    toAmount: '9488.00',
    toTransferId: 'T202501160009IN',
    toTransferCreateTime: '2025-01-16 12:31:00',
    toTransferOnChainTime: '2025-01-16 12:32:30',
    toTransferCompleteTime: '2025-01-16 12:45:00',
    feeCurrency: 'ETH',
    feeAmount: '0.03',
    feeValue: '57.16',
    createTime: '2025-01-16 12:15:00',
    updateTime: '2025-01-16 12:45:00',
    status: 'success'
  },
  {
    key: '10',
    exchangeOrderId: 'EX202501160010',
    fromWalletId: 'W202501160019',
    fromChainType: 'BSC',
    fromCurrency: 'USDT',
    fromAmount: '2500.00',
    fromTransferId: 'T202501160010OUT',
    fromTransferCreateTime: '2025-01-16 12:45:00',
    fromTransferOnChainTime: '2025-01-16 12:46:30',
    fromTransferCompleteTime: '2025-01-16 13:00:00',
    targetExchange: 'OKX',
    exchangeRate: '1.001',
    toWalletId: 'W202501160020',
    toChainType: 'TRX',
    toCurrency: 'USDT',
    toAmount: '2495.00',
    toTransferId: 'T202501160010IN',
    toTransferCreateTime: '2025-01-16 13:01:00',
    toTransferOnChainTime: '2025-01-16 13:02:30',
    toTransferCompleteTime: '2025-01-16 13:15:00',
    feeCurrency: 'USDT',
    feeAmount: '5.00',
    feeValue: '5.00',
    createTime: '2025-01-16 12:45:00',
    updateTime: '2025-01-16 13:15:00',
    status: 'success'
  }
])

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // TODO: 實現分頁邏輯
}

const getStatusText = (status) => {
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

const handleOrderClick = (orderId) => {
  console.log('Navigate to exchange order detail:', orderId)
  // TODO: 實現導航到兌幣訂單詳情頁面的邏輯
}

const handleTransferClick = (transferId, type) => {
  console.log(`Navigate to ${type} transfer detail:`, transferId)
  // TODO: 實現導航到轉帳訂單詳情頁面的邏輯
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success(t('copyToClipboardSuccess'))
  } catch (err) {
    message.error(t('copyToClipboardFailed'))
  }
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