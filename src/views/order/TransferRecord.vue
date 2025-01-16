<template>
  <div class="transfer-record">
    <a-card :title="t('transferOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('walletId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.walletId"
              :placeholder="t('pleaseInputWalletId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('address')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="t('pleaseInputAddress')"
              allow-clear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="TxHash" class="form-item-lg">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('relatedOrderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.relatedOrderId"
              :placeholder="t('pleaseInputRelatedOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('status')" class="form-item-md">
            <transfer-status-select
              v-model="queryParams.status"
              style="width: 100%"
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

    <a-card :title="t('transferList')" class="list-card">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :bordered="true"
        @change="handleTableChange"
      >
        <template #transferId="{ text }">
          {{ text }}
        </template>

        <template #txHash="{ text }">
          <div class="hash-container">
            <span>{{ text }}</span>
            <div class="icon-group">
              <copy-outlined class="action-icon" @click="copyTxHash(text)" />
              <link-outlined class="action-icon" @click="openTxHashLink(text)" />
            </div>
          </div>
        </template>

        <template #status="{ record }">
          <a-tag :class="['status-tag', `status-${record.status}`]">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #timeInfo="{ record }">
          <div class="time-info">
            <div class="info-item">
              <span class="label">{{ t('createTime') }}:</span>
              <span>{{ record.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('onChainTime') }}:</span>
              <span>{{ record.onChainTime || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('successTime') }}:</span>
              <span>{{ record.successTime || '-' }}</span>
            </div>
          </div>
        </template>

        <template #action="{ record }">
          <a-button type="link" @click="handleStatusSetting(record)">
            {{ t('changeStatus') }}
          </a-button>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { CopyOutlined, LinkOutlined } from '@ant-design/icons-vue'
import TransferStatusSelect from '@/components/selectors/TransferStatusSelect.vue'
import '@/styles/common.css'

const { t } = useI18n()

const queryParams = ref({
  orderId: '',
  walletId: '',
  address: '',
  txHash: '',
  relatedOrderId: '',
  status: undefined
})

const handleReset = () => {
  queryParams.value = {
    orderId: '',
    walletId: '',
    address: '',
    txHash: '',
    relatedOrderId: '',
    status: undefined
  }
}

const handleQuery = () => {
  // 實現查詢邏輯
  console.log('Query with params:', queryParams.value)
}

const columns = computed(() => [
  {
    title: t('transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    slots: { customRender: 'transferId' },
    width: 150,
  },
  {
    title: t('fromWallet'),
    dataIndex: 'fromWalletId',
    key: 'fromWalletId',
    width: 150,
  },
  {
    title: t('toWallet'),
    dataIndex: 'toWalletId',
    key: 'toWalletId',
    width: 150,
  },
  {
    title: t('transferAmount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    align: 'right',
  },
  {
    title: t('status'),
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    width: 120,
  },
  {
    title: 'TxHash',
    dataIndex: 'txHash',
    key: 'txHash',
    slots: { customRender: 'txHash' },
    width: 200,
  },
  {
    title: t('timeInfo'),
    dataIndex: 'timeInfo',
    key: 'timeInfo',
    slots: { customRender: 'timeInfo' },
    width: 300,
  },
  {
    title: t('action'),
    key: 'action',
    slots: { customRender: 'action' },
    width: 100,
    fixed: 'right',
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

const getStatusText = (status) => {
  const statusMap = {
    submitted: t('statusSubmitted'),
    onChain: t('statusOnChain'),
    confirming: t('statusConfirming'),
    completed: t('statusCompleted'),
    failed: t('statusFailed')
  }
  return statusMap[status] || status
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
  // 實現打開區塊鏈瀏覽器的邏輯
  window.open(`https://example.com/tx/${txHash}`, '_blank')
}

const handleStatusSetting = (record) => {
  // 實現狀態設定的邏輯
  console.log('Status setting for record:', record)
}

// 模擬表格數據
const tableData = [
  {
    key: '1',
    transferId: 'T202403150001',
    fromWalletId: 'W202403150001',
    toWalletId: 'W202403150002',
    amount: '1000.00000000',
    status: 'completed',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    createTime: '2024-03-15 10:00:00',
    onChainTime: '2024-03-15 10:01:00',
    successTime: '2024-03-15 10:05:00'
  },
  {
    key: '2',
    transferId: 'T202403150002',
    fromWalletId: 'W202403150003',
    toWalletId: 'W202403150004',
    amount: '2000.00000000',
    status: 'confirming',
    txHash: '0x2345678901abcdef2345678901abcdef23456789',
    createTime: '2024-03-15 09:00:00',
    onChainTime: '2024-03-15 09:01:00',
    successTime: null
  },
  {
    key: '3',
    transferId: 'T202403150003',
    fromWalletId: 'W202403150005',
    toWalletId: 'W202403150006',
    amount: '3000.00000000',
    status: 'submitted',
    txHash: '0x3456789012abcdef3456789012abcdef34567890',
    createTime: '2024-03-15 08:00:00',
    onChainTime: null,
    successTime: null
  },
  {
    key: '4',
    transferId: 'T202403150004',
    fromWalletId: 'W202403150007',
    toWalletId: 'W202403150008',
    amount: '4000.00000000',
    status: 'onChain',
    txHash: '0x4567890123abcdef4567890123abcdef45678901',
    createTime: '2024-03-15 07:00:00',
    onChainTime: '2024-03-15 07:02:00',
    successTime: null
  },
  {
    key: '5',
    transferId: 'T202403150005',
    fromWalletId: 'W202403150009',
    toWalletId: 'W202403150010',
    amount: '5000.00000000',
    status: 'failed',
    txHash: '0x5678901234abcdef5678901234abcdef56789012',
    createTime: '2024-03-15 06:00:00',
    onChainTime: '2024-03-15 06:01:00',
    successTime: null
  },
  {
    key: '6',
    transferId: 'T202403150006',
    fromWalletId: 'W202403150011',
    toWalletId: 'W202403150012',
    amount: '6000.00000000',
    status: 'completed',
    txHash: '0x6789012345abcdef6789012345abcdef67890123',
    createTime: '2024-03-15 05:00:00',
    onChainTime: '2024-03-15 05:01:00',
    successTime: '2024-03-15 05:05:00'
  },
  {
    key: '7',
    transferId: 'T202403150007',
    fromWalletId: 'W202403150013',
    toWalletId: 'W202403150014',
    amount: '7000.00000000',
    status: 'confirming',
    txHash: '0x7890123456abcdef7890123456abcdef78901234',
    createTime: '2024-03-15 04:00:00',
    onChainTime: '2024-03-15 04:01:00',
    successTime: null
  },
  {
    key: '8',
    transferId: 'T202403150008',
    fromWalletId: 'W202403150015',
    toWalletId: 'W202403150016',
    amount: '8000.00000000',
    status: 'onChain',
    txHash: '0x8901234567abcdef8901234567abcdef89012345',
    createTime: '2024-03-15 03:00:00',
    onChainTime: '2024-03-15 03:02:00',
    successTime: null
  },
  {
    key: '9',
    transferId: 'T202403150009',
    fromWalletId: 'W202403150017',
    toWalletId: 'W202403150018',
    amount: '9000.00000000',
    status: 'submitted',
    txHash: '0x9012345678abcdef9012345678abcdef90123456',
    createTime: '2024-03-15 02:00:00',
    onChainTime: null,
    successTime: null
  },
  {
    key: '10',
    transferId: 'T202403150010',
    fromWalletId: 'W202403150019',
    toWalletId: 'W202403150020',
    amount: '10000.00000000',
    status: 'failed',
    txHash: '0x0123456789abcdef0123456789abcdef01234567',
    createTime: '2024-03-15 01:00:00',
    onChainTime: '2024-03-15 01:01:00',
    successTime: null
  }
]
</script>

<style scoped>
.transfer-record {
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

.hash-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-group {
  display: flex;
  gap: 4px;
}

.action-icon {
  cursor: pointer;
  color: #177ddc;
  transition: all 0.3s;
}

.action-icon:hover {
  opacity: 0.8;
}

.time-info {
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

.status-tag {
  min-width: 90px;
  text-align: center;
}

.status-submitted {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.status-onChain {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.status-confirming {
  background: rgba(24, 144, 255, 0.1);
  color: #177ddc;
  border: 1px solid #177ddc;
}

.status-completed {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-failed {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
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
</style> 