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
      <template #extra>
        <a-button type="primary" @click="handleDownload">
          <template #icon><DownloadOutlined /></template>
          {{ t('action.download') }}
        </a-button>
      </template>
      <a-table
        :columns="tableColumns"
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

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { FilterValue } from 'ant-design-vue/es/table/interface'
import { CopyOutlined, LinkOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import TransferStatusSelect from '@/components/selectors/TransferStatusSelect.vue'
import TransferTypeSelect from '@/components/selectors/TransferTypeSelect.vue'
import zhLocale from '@/locales/order/TransferRecord/zh.json'
import enLocale from '@/locales/order/TransferRecord/en.json'
import mockData from '@/mock/order/transfer/list.json'
import '@/styles/common.css'
import { useRouter } from 'vue-router'

interface TransferType {
  type: string
  orderId?: string
}

interface TransferRecord {
  id: string
  transferId: string
  fromAddress: string
  toAddress: string
  amount: string
  coinCode: string
  txHash: string
  status: string
  createTime: string
  onChainTime: string | null
  successTime: string | null
  transferType: TransferType
}

interface QueryParams {
  orderId: string
  walletId: string
  address: string
  fromAddress: string
  toAddress: string
  txHash: string
  relatedOrderId: string
  status: string | undefined
  transferType: string | undefined
}

interface TableColumn {
  title: string
  dataIndex: string | string[]
  key: string
  width?: number
  align?: 'left' | 'right' | 'center'
  fixed?: 'left' | 'right'
  customRender?: (params: { text: any; record: TransferRecord }) => any
}

interface TypeChangeRecord {
  key: string
  transferType: {
    type: string
  }
}

interface TypeChangeFormData {
  type: string | undefined
  reason: string
  recordId: string | null
}

interface ReasonRecord {
  transferType: {
    type: string
    reason?: string
  }
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
  orderId: '',
  walletId: '',
  address: '',
  fromAddress: '',
  toAddress: '',
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
    fromAddress: '',
    toAddress: '',
    txHash: '',
    relatedOrderId: '',
    status: undefined,
    transferType: undefined
  }
  handleQuery()
}

const handleQuery = () => {
  // 模擬 API 請求
  tableData.value = mockData.data as TransferRecord[]
  pagination.value.total = mockData.total
}

// 定義狀態和類型的枚舉
enum TransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  MANUAL_CONFIRM = 'manualConfirm',
  SUCCESS = 'success',
  FAILED = 'failed'
}

enum TransferTypeEnum {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  COLLECTION = 'collection',
  EXCHANGE = 'exchange',
  REPLENISH = 'replenish',
  MANUAL = 'manual'
}

// 格式化狀態
const formatStatus = (status: TransferStatus): string => {
  const statusMap: Record<TransferStatus, string> = {
    [TransferStatus.PENDING]: t('status.pending'),
    [TransferStatus.PROCESSING]: t('status.processing'),
    [TransferStatus.MANUAL_CONFIRM]: t('status.manualConfirm'),
    [TransferStatus.SUCCESS]: t('status.success'),
    [TransferStatus.FAILED]: t('status.failed')
  }
  return statusMap[status]
}

// 格式化轉賬類型
const formatTransferType = (type: TransferTypeEnum): string => {
  const typeMap: Record<TransferTypeEnum, string> = {
    [TransferTypeEnum.DEPOSIT]: t('transferType.deposit'),
    [TransferTypeEnum.WITHDRAW]: t('transferType.withdraw'),
    [TransferTypeEnum.COLLECTION]: t('transferType.collection'),
    [TransferTypeEnum.EXCHANGE]: t('transferType.exchange'),
    [TransferTypeEnum.REPLENISH]: t('transferType.replenish'),
    [TransferTypeEnum.MANUAL]: t('transferType.manual')
  }
  return typeMap[type]
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

const tableData = ref<TransferRecord[]>([])

const pagination = ref<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const handleTableChange = (
  pag: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  sorter: { field: string; order: string }
) => {
  pagination.value.current = pag.current || 1
  pagination.value.pageSize = pag.pageSize || 10
  handleQuery()
}

const getStatusText = (status: TransferStatus): string => {
  const statusMap: Record<TransferStatus, string> = {
    [TransferStatus.PENDING]: t('status.pending'),
    [TransferStatus.PROCESSING]: t('status.processing'),
    [TransferStatus.MANUAL_CONFIRM]: t('status.manualConfirm'),
    [TransferStatus.SUCCESS]: t('status.success'),
    [TransferStatus.FAILED]: t('status.failed')
  }
  return statusMap[status] || status
}

const formatTxHash = (hash: string): string => {
  if (!hash) return '-'
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

const copyTxHash = async (txHash: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(txHash)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

const openTxHashLink = (txHash: string): void => {
  // 實現打開區塊鏈瀏覽器的邏輯
  window.open(`https://example.com/tx/${txHash}`, '_blank')
}

const handleStatusSetting = (record: TransferRecord): void => {
  // 實現狀態設定的邏輯
  console.log('Status setting for record:', record)
}

const handleOrderClick = (orderId: string, type: TransferTypeEnum): void => {
  // 根據不同的轉帳類型跳轉到不同的訂單詳情頁
  const typeToPath: Record<TransferTypeEnum, string> = {
    [TransferTypeEnum.DEPOSIT]: '/order/deposit',
    [TransferTypeEnum.WITHDRAW]: '/order/withdraw',
    [TransferTypeEnum.COLLECTION]: '/wallet/collection',
    [TransferTypeEnum.EXCHANGE]: '/wallet/exchange',
    [TransferTypeEnum.REPLENISH]: '/wallet/replenish',
    [TransferTypeEnum.MANUAL]: '/order/manual'
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
const typeChangeForm = ref<TypeChangeFormData>({
  type: undefined,
  reason: '',
  recordId: null
})

const handleTypeChange = (record: TypeChangeRecord): void => {
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

const showReason = (record: ReasonRecord): void => {
  if (['manualOut', 'manualIn', 'systemError'].includes(record.transferType.type)) {
    currentReason.value = record.transferType.reason || t('noReasonProvided')
    reasonModalVisible.value = true
  }
}

// 處理轉賬類型變更
const handleTransferTypeChange = (record: TransferRecord, type: TransferTypeEnum, orderId: string): void => {
  console.log('Change transfer type:', { record, type, orderId })
}

// 處理查看詳情
const handleViewDetail = (record: TransferRecord): void => {
  console.log('View detail:', record)
}

// 處理下載
const handleDownload = (): void => {
  // 將表格數據轉換為CSV格式
  const columnsValue = tableColumns.value
  const headers = columnsValue.map(col => col.title).join(',')
  const rows = tableData.value.map(row => {
    return columnsValue.map(col => {
      let value = ''
      if (typeof col.dataIndex === 'string') {
        value = (row as Record<string, any>)[col.dataIndex] || ''
      } else if (Array.isArray(col.dataIndex)) {
        // 處理嵌套屬性，例如 ['transferType', 'type']
        let current: any = row
        for (const key of col.dataIndex) {
          current = current?.[key]
        }
        value = current || ''
      }
      return `"${value}"`
    }).join(',')
  })
  
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `transfer_record_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(t('message.downloadSuccess'))
}

// 格式化地址顯示
const formatAddress = (address: string): string => {
  if (!address) return '-'
  return `${address.slice(0, 4)}***${address.slice(-4)}`
}

// 複製地址
const copyAddress = async (address: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

// 表格列定義
const tableColumns = computed(() => {
  const columns: TableColumn[] = [
    {
      title: t('field.transferId'),
      dataIndex: 'transferId',
      key: 'transferId',
      width: 150
    },
    {
      title: t('field.fromAddress'),
      dataIndex: 'fromAddress',
      key: 'fromAddress',
      width: 200,
      customRender: ({ text, record }: { text: string; record: TransferRecord }) => {
        return h('div', { class: 'address-container' }, [
          h('span', {}, formatAddress(text)),
          h(CopyOutlined, {
            class: 'copy-icon',
            onClick: () => copyAddress(text)
          })
        ])
      }
    },
    {
      title: t('field.toAddress'),
      dataIndex: 'toAddress',
      key: 'toAddress',
      width: 200,
      customRender: ({ text, record }: { text: string; record: TransferRecord }) => {
        return h('div', { class: 'address-container' }, [
          h('span', {}, formatAddress(text)),
          h(CopyOutlined, {
            class: 'copy-icon',
            onClick: () => copyAddress(text)
          })
        ])
      }
    },
    {
      title: t('field.txHash'),
      dataIndex: 'txHash',
      key: 'txHash',
      width: 200,
      customRender: ({ text, record }: { text: string; record: TransferRecord }) => {
        return h('div', { class: 'hash-container' }, [
          h('span', {}, formatTxHash(text)),
          h(CopyOutlined, {
            class: 'copy-icon',
            onClick: () => copyTxHash(text)
          })
        ])
      }
    },
    {
      title: t('field.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      customRender: ({ text }: { text: TransferStatus }) => formatStatus(text)
    },
    {
      title: t('field.transferType'),
      dataIndex: ['transferType', 'type'],
      key: 'transferType',
      width: 120,
      customRender: ({ text }: { text: TransferTypeEnum }) => formatTransferType(text)
    }
  ]
  return columns
})

// 組件掛載時加載數據
onMounted(() => {
  handleQuery()
})
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

.address-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  cursor: pointer;
  color: #1890ff;
  font-size: 16px;
  transition: color 0.3s;
}

.copy-icon:hover {
  color: #40a9ff;
}
</style>