<template>
  <div class="withdraw-order">
    <a-card :title="t('withdrawOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('dateRange')" class="form-item-lg">
            <date-range-select
              v-model="queryParams.dateRange"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('merchant')" class="form-item-md">
            <merchant-select
              v-model="queryParams.merchant"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('status')" class="form-item-sm">
            <withdraw-status-select
              v-model="queryParams.status"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('userId')" class="form-item-md">
            <a-input
              v-model:value="queryParams.userId"
              :placeholder="t('pleaseInputUserId')"
              allow-clear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item :label="t('address')" class="form-item-xl">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="t('pleaseInputAddress')"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="TxHash" class="form-item-xl">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <div class="form-item-sm button-group">
            <a-space>
              <a-button @click="handleReset">{{ t('reset') }}</a-button>
              <a-button type="primary" @click="handleQuery">{{ t('query') }}</a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>

    <a-card :title="t('orderList')" class="list-card">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :bordered="true"
        @change="handleTableChange"
      >
        <template #merchant="{ text }">
          {{ text }}
        </template>

        <template #orderInfo="{ record }">
          <div class="order-info">
            <div class="info-item">
              <span class="label">{{ t('platformOrderId') }}:</span>
              <span>{{ record.platformOrderId }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('merchantOrderId') }}:</span>
              <span>{{ record.merchantOrderId }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('transferId') }}:</span>
              <template v-if="record.showTransferDetail">
                <a-button type="link" size="small" @click="handleTransferDetail(record.transferId)">
                  {{ t('details') }}
                </a-button>
              </template>
              <template v-else>
                <a @click="handleTransferIdClick(record.transferId)">{{ record.transferId }}</a>
              </template>
            </div>
            <div class="info-item">
              <span class="label">TxHash:</span>
              <a @click="handleTxHashClick(record.txHash)">{{ record.txHash }}</a>
            </div>
          </div>
        </template>

        <template #address="{ text }">
          <div class="address-container">
            <span>{{ formatAddress(text) }}</span>
            <copy-outlined class="copy-icon" @click="copyAddress(text)" />
          </div>
        </template>

        <template #orderStatus="{ record }">
          <a-tag :class="['status-tag', `status-${record.orderStatus}`]">
            {{ record.orderStatus === 'confirming' 
              ? `${getOrderStatusText(record.orderStatus)}(${record.confirmations}/${record.requiredConfirmations})` 
              : getOrderStatusText(record.orderStatus) }}
          </a-tag>
        </template>

        <template #notifyStatus="{ record }">
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
              {{ t('retry') }}
            </a-button>
          </div>
        </template>

        <template #timeInfo="{ record }">
          <div class="time-info">
            <div class="info-item">
              <span class="label">{{ t('createTime') }}:</span>
              <span>{{ record.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('successTime') }}:</span>
              <span>{{ record.successTime || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('notifyTime') }}:</span>
              <span>{{ record.notifyTime || '-' }}</span>
            </div>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import WithdrawStatusSelect from '@/components/selectors/WithdrawStatusSelect.vue'
import '@/styles/common.css'

const { t } = useI18n()

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
    title: t('merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    slots: { customRender: 'merchant' },
    width: 120,
  },
  {
    title: t('transactionDocument'),
    dataIndex: 'orderInfo',
    key: 'orderInfo',
    slots: { customRender: 'orderInfo' },
    width: 300,
  },
  {
    title: t('transactionAmount'),
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    width: 120,
  },
  {
    title: t('usdtValue'),
    dataIndex: 'usdtValue',
    key: 'usdtValue',
    align: 'right',
    width: 120,
  },
  {
    title: t('receivingAddress'),
    dataIndex: 'address',
    key: 'address',
    slots: { customRender: 'address' },
    width: 200,
  },
  {
    title: t('orderStatus'),
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    slots: { customRender: 'orderStatus' },
    width: 120,
  },
  {
    title: t('notifyStatus'),
    dataIndex: 'notifyStatus',
    key: 'notifyStatus',
    slots: { customRender: 'notifyStatus' },
    width: 120,
  },
  {
    title: t('timeInfo'),
    dataIndex: 'timeInfo',
    key: 'timeInfo',
    slots: { customRender: 'timeInfo' },
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
    message.success(t('copySuccess'))
  } catch (err) {
    message.error(t('copyFailed'))
  }
}

const getOrderStatusText = (status) => {
  const statusMap = {
    waiting: t('waiting'),
    confirming: t('confirming'),
    processing: t('processing'),
    retrying: t('retrying'),
    success: `${t('successful')}(x/x)`,
    failed: t('failed')
  }
  return statusMap[status] || status
}

const getNotifyStatusText = (status) => {
  const statusMap = {
    success: t('successful'),
    timeout: t('notifyTimeout'),
    retrying: t('retrying')
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

const handleRetryNotify = (record) => {
  // 處理重試通知邏輯
  console.log('Retry notify for record:', record)
}

const handleTransferDetail = (transferId) => {
  // 處理詳情按鈕點擊事件
  console.log('Transfer detail clicked:', transferId)
}

const tableData = [
  {
    key: '1',
    merchant: 'Merchant A',
    platformOrderId: 'W202403150001',
    merchantOrderId: 'M202403150001',
    transferId: 'T202403150001',
    showTransferDetail: true,
    txHash: '0x1234...5678',
    amount: '1000.00000000',
    usdtValue: '1000.00',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    orderStatus: 'confirming',
    notifyStatus: 'success',
    createTime: '2024-03-15 10:00:00',
    successTime: null,
    notifyTime: '2024-03-15 10:01:00',
    confirmations: '3',
    requiredConfirmations: '6'
  },
  {
    key: '2',
    merchant: 'Merchant B',
    platformOrderId: 'W202403150002',
    merchantOrderId: 'M202403150002',
    transferId: 'T202403150002',
    showTransferDetail: false,
    txHash: '0x2345...6789',
    amount: '2000.00000000',
    usdtValue: '2000.00',
    address: '0x2345678901abcdef2345678901abcdef23456789',
    orderStatus: 'processing',
    notifyStatus: 'timeout',
    createTime: '2024-03-15 09:00:00',
    successTime: null,
    notifyTime: null
  },
  {
    key: '3',
    merchant: 'Merchant C',
    platformOrderId: 'W202403150003',
    merchantOrderId: 'M202403150003',
    transferId: 'T202403150003',
    showTransferDetail: true,
    txHash: '0x3456...7890',
    amount: '3000.00000000',
    usdtValue: '3000.00',
    address: '0x3456789012abcdef3456789012abcdef34567890',
    orderStatus: 'failed',
    notifyStatus: 'retrying',
    createTime: '2024-03-15 08:00:00',
    successTime: null,
    notifyTime: null
  },
  {
    key: '4',
    merchant: 'Merchant A',
    platformOrderId: 'W202403150004',
    merchantOrderId: 'M202403150004',
    transferId: 'T202403150004',
    showTransferDetail: false,
    txHash: '0x4567...8901',
    amount: '4000.00000000',
    usdtValue: '4000.00',
    address: '0x4567890123abcdef4567890123abcdef45678901',
    orderStatus: 'retrying',
    notifyStatus: 'success',
    createTime: '2024-03-15 07:00:00',
    successTime: null,
    notifyTime: '2024-03-15 07:01:00'
  },
  {
    key: '5',
    merchant: 'Merchant B',
    platformOrderId: 'W202403150005',
    merchantOrderId: 'M202403150005',
    transferId: 'T202403150005',
    showTransferDetail: false,
    txHash: '0x5678...9012',
    amount: '5000.00000000',
    usdtValue: '5000.00',
    address: '0x5678901234abcdef5678901234abcdef56789012',
    orderStatus: 'success',
    notifyStatus: 'success',
    createTime: '2024-03-15 06:00:00',
    successTime: '2024-03-15 06:05:00',
    notifyTime: '2024-03-15 06:06:00'
  },
  {
    key: '6',
    merchant: 'Merchant C',
    platformOrderId: 'W202403150006',
    merchantOrderId: 'M202403150006',
    transferId: 'T202403150006',
    showTransferDetail: false,
    txHash: '0x6789...0123',
    amount: '6000.00000000',
    usdtValue: '6000.00',
    address: '0x6789012345abcdef6789012345abcdef67890123',
    orderStatus: 'failed',
    notifyStatus: 'timeout',
    createTime: '2024-03-15 05:00:00',
    successTime: null,
    notifyTime: null
  },
  {
    key: '7',
    merchant: 'Merchant A',
    platformOrderId: 'W202403150007',
    merchantOrderId: 'M202403150007',
    transferId: 'T202403150007',
    showTransferDetail: false,
    txHash: '0x7890...1234',
    amount: '7000.00000000',
    usdtValue: '7000.00',
    address: '0x7890123456abcdef7890123456abcdef78901234',
    orderStatus: 'processing',
    notifyStatus: 'retrying',
    createTime: '2024-03-15 04:00:00',
    successTime: null,
    notifyTime: null
  },
  {
    key: '8',
    merchant: 'Merchant B',
    platformOrderId: 'W202403150008',
    merchantOrderId: 'M202403150008',
    transferId: 'T202403150008',
    showTransferDetail: false,
    txHash: '0x8901...2345',
    amount: '8000.00000000',
    usdtValue: '8000.00',
    address: '0x8901234567abcdef8901234567abcdef89012345',
    orderStatus: 'success',
    notifyStatus: 'success',
    createTime: '2024-03-15 03:00:00',
    successTime: '2024-03-15 03:05:00',
    notifyTime: '2024-03-15 03:06:00'
  },
  {
    key: '9',
    merchant: 'Merchant C',
    platformOrderId: 'W202403150009',
    merchantOrderId: 'M202403150009',
    transferId: 'T202403150009',
    showTransferDetail: false,
    txHash: '0x9012...3456',
    amount: '9000.00000000',
    usdtValue: '9000.00',
    address: '0x9012345678abcdef9012345678abcdef90123456',
    orderStatus: 'waiting',
    notifyStatus: 'timeout',
    createTime: '2024-03-15 02:00:00',
    successTime: null,
    notifyTime: null
  },
  {
    key: '10',
    merchant: 'Merchant A',
    platformOrderId: 'W202403150010',
    merchantOrderId: 'M202403150010',
    transferId: 'T202403150010',
    showTransferDetail: false,
    txHash: '0x0123...4567',
    amount: '10000.00000000',
    usdtValue: '10000.00',
    address: '0x0123456789abcdef0123456789abcdef01234567',
    orderStatus: 'retrying',
    notifyStatus: 'retrying',
    createTime: '2024-03-15 01:00:00',
    successTime: null,
    notifyTime: null
  }
]
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
</style> 