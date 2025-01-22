<template>
  <div class="transfer-record">
    <a-card :title="t('title.transferOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('field.orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('prompt.pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.walletId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.walletId"
              :placeholder="t('prompt.pleaseInputWalletId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.address')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="t('prompt.pleaseInputAddress')"
              allow-clear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="TxHash" class="form-item-lg">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('prompt.pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.relatedOrderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.relatedOrderId"
              :placeholder="t('prompt.pleaseInputRelatedOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('field.status')" class="form-item-md">
            <transfer-status-select
              v-model="queryParams.status"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('field.transferType')" class="form-item-md">
            <transfer-type-select
              v-model="queryParams.transferType"
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

    <a-card :title="t('title.transferList')" class="list-card">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :bordered="true"
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'transferId'">
            {{ record.transferId }}
          </template>
          
          <template v-else-if="column.key === 'txHash'">
            <div class="hash-container">
              <span>{{ formatTxHash(record.txHash) }}</span>
              <div class="icon-group">
                <copy-outlined class="action-icon" @click="copyTxHash(record.txHash)" />
                <link-outlined class="action-icon" @click="openTxHashLink(record.txHash)" />
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :class="['status-tag', `status-${record.status}`]">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'timeInfo'">
            <div class="time-info">
              <div class="info-item">
                <span class="label">{{ t('field.createTime') }}:</span>
                <span>{{ record.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('field.onChainTime') }}:</span>
                <span>{{ record.onChainTime || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('field.successTime') }}:</span>
                <span>{{ record.successTime || '-' }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'transferType'">
            <template v-if="['manualOut', 'manualIn', 'systemError'].includes(record.transferType.type)">
              <a-button type="link" @click="showReason(record)">
                {{ t(`transferType.${record.transferType.type}`) }}
              </a-button>
            </template>
            <template v-else>
              <div class="transfer-type-container">
                <div class="type-text">{{ t(`transferType.${record.transferType.type}`) }}</div>
                <div v-if="['deposit', 'withdraw', 'collection', 'exchange', 'replenish', 'manual'].includes(record.transferType.type)" 
                  class="order-id"
                >
                  <a-button 
                    type="link" 
                    class="order-link"
                    @click="handleOrderClick(record.transferType.orderId, record.transferType.type)"
                  >
                    {{ record.transferType.orderId }}
                  </a-button>
                </div>
              </div>
            </template>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-button 
              v-if="record.transferType.type === 'pendingConfirm'"
              type="link" 
              @click="handleTypeChange(record)"
            >
              {{ t('action.changeType') }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="typeChangeModalVisible"
      :title="t('prompt.changeTransferType')"
      @ok="handleTypeChangeConfirm"
      @cancel="handleTypeChangeCancel"
    >
      <a-form :model="typeChangeForm" layout="vertical">
        <a-form-item :label="t('field.transferType')" required>
          <a-select
            v-model:value="typeChangeForm.type"
            :placeholder="t('prompt.pleaseSelectTransferType')"
          >
            <a-select-option value="manualOut">{{ t('transferType.manualOut') }}</a-select-option>
            <a-select-option value="manualIn">{{ t('transferType.manualIn') }}</a-select-option>
            <a-select-option value="systemError">{{ t('transferType.systemError') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('field.reason')" required>
          <a-textarea
            v-model:value="typeChangeForm.reason"
            :placeholder="t('prompt.pleaseInputReason')"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="reasonModalVisible"
      :title="t('prompt.transferTypeReason')"
      :footer="null"
    >
      <p>{{ currentReason }}</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { CopyOutlined, LinkOutlined } from '@ant-design/icons-vue'
import TransferStatusSelect from '@/components/selectors/TransferStatusSelect.vue'
import TransferTypeSelect from '@/components/selectors/TransferTypeSelect.vue'
import zhLocale from '@/locales/order/TransferRecord/zh.json'
import enLocale from '@/locales/order/TransferRecord/en.json'
import mockData from '@/mock/order/TransferRecord/transferRecord.mock.json'
import '@/styles/common.css'
import { useRouter } from 'vue-router'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const queryParams = ref({
  orderId: '',
  walletId: '',
  address: '',
  txHash: '',
  relatedOrderId: '',
  status: undefined,
  transferType: undefined
})

const router = useRouter()

const handleReset = () => {
  queryParams.value = {
    orderId: '',
    walletId: '',
    address: '',
    txHash: '',
    relatedOrderId: '',
    status: undefined,
    transferType: undefined
  }
}

const handleQuery = () => {
  // 實現查詢邏輯
  console.log('Query with params:', queryParams.value)
}

const columns = computed(() => [
  {
    title: t('field.transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    width: 150,
  },
  {
    title: t('field.fromWallet'),
    dataIndex: 'fromWalletId',
    key: 'fromWalletId',
    width: 150,
  },
  {
    title: t('field.toWallet'),
    dataIndex: 'toWalletId',
    key: 'toWalletId',
    width: 150,
  },
  {
    title: t('field.transferType'),
    dataIndex: 'transferType',
    key: 'transferType',
    width: 200
  },
  {
    title: t('field.transferAmount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    align: 'right',
  },
  {
    title: t('field.status'),
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: 'TxHash',
    dataIndex: 'txHash',
    key: 'txHash',
    width: 200,
  },
  {
    title: t('field.timeInfo'),
    dataIndex: 'timeInfo',
    key: 'timeInfo',
    width: 300,
  },
  {
    title: t('field.action'),
    key: 'action',
    fixed: 'right',
    width: 120
  }
])

const tableData = ref(mockData.records)

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

const getStatusText = (status) => {
  const statusMap = {
    pending: t('status.pending'),
    processing: t('status.processing'),
    manualConfirm: t('status.manualConfirm'),
    success: t('status.success'),
    failed: t('status.failed')
  }
  return statusMap[status] || status
}

const formatTxHash = (hash) => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}****${hash.slice(-6)}`
}

const copyTxHash = async (txHash) => {
  try {
    await navigator.clipboard.writeText(txHash)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
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

const handleOrderClick = (orderId, type) => {
  // 根據不同的轉帳類型跳轉到不同的訂單詳情頁
  const typeToPath = {
    deposit: '/order/deposit',
    withdraw: '/order/withdraw',
    collection: '/wallet/collection',
    exchange: '/wallet/exchange',
    replenish: '/wallet/replenish',
    manual: '/order/manual'
  }
  
  const path = typeToPath[type]
  if (path) {
    router.push({
      path: path,
      query: { orderId }
    })
  }
}

// 類型變更相關
const typeChangeModalVisible = ref(false)
const typeChangeForm = ref({
  type: undefined,
  reason: '',
  recordId: null
})

const handleTypeChange = (record) => {
  typeChangeForm.value.recordId = record.key
  typeChangeForm.value.type = undefined
  typeChangeForm.value.reason = ''
  typeChangeModalVisible.value = true
}

const handleTypeChangeConfirm = () => {
  if (!typeChangeForm.value.type) {
    message.error(t('pleaseSelectTransferType'))
    return
  }
  if (!typeChangeForm.value.reason.trim()) {
    message.error(t('pleaseInputReason'))
    return
  }
  
  // TODO: 調用API更新轉賬類型
  console.log('Change type for record:', typeChangeForm.value)
  
  message.success(t('updateSuccess'))
  typeChangeModalVisible.value = false
}

const handleTypeChangeCancel = () => {
  typeChangeModalVisible.value = false
}

// 原因查看相關
const reasonModalVisible = ref(false)
const currentReason = ref('')

const showReason = (record) => {
  if (['manualOut', 'manualIn', 'systemError'].includes(record.transferType.type)) {
    currentReason.value = record.transferType.reason || t('noReasonProvided')
    reasonModalVisible.value = true
  }
}
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

.status-manualConfirm {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
  border: 1px solid #fa8c16;
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

:deep(.ant-table) {
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background: #1f1f1f;
  border-bottom: 1px solid #303030;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-table-tbody > tr > td) {
  background: transparent;
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

.transfer-type-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.type-text {
  color: rgba(255, 255, 255, 0.85);
}

.order-id {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid #303030;
}

.order-link {
  color: rgba(255, 255, 255, 0.85);
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}
</style>