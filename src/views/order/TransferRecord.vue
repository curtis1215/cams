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
        :columns="columns"
        :data-source="tableData"
        :row-key="(record) => record.id"
        :pagination="pagination"
        :bordered="true"
        :scroll="{ x: 2000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag
              :class="['status-tag', `status-${record.status}`, { 'status-clickable': record.status === 'manualConfirm' }]"
              @click="record.status === 'manualConfirm' ? handleManualConfirmClick(record) : undefined"
            >
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'transferType'">
            {{ t(`transferType.${record.transferType?.type || 'unknown'}`) }}
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

          <template v-else-if="column.key === 'fromAddress' || column.key === 'toAddress'">
            <div class="address-container">
              <span>{{ formatAddress(record[column.key]) }}</span>
              <copy-outlined class="copy-icon" @click="copyAddress(record[column.key])" />
            </div>
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

    <a-modal
      v-model:open="manualConfirmModalVisible"
      :title="`${t('field.transferId')}${currentTransferId} ${t('title.manualConfirmList')}`"
      width="1200px"
      :footer="null"
    >
      <a-table
        :columns="manualConfirmColumns"
        :data-source="manualConfirmList"
        :row-selection="manualConfirmRowSelection"
        :row-key="(record) => record.id"
        :pagination="false"
        :bordered="true"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ manualConfirmList.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'fromAddress' || column.key === 'toAddress'">
            <div class="address-container">
              <span>{{ formatAddress(record[column.key]) }}</span>
              <copy-outlined class="copy-icon" @click="copyAddress(record[column.key])" />
            </div>
          </template>
        </template>
      </a-table>
      <div class="modal-footer">
        <a-button danger type="primary" :disabled="hasSelectedRows" @click="handleSetFailed">
          {{ t('action.setFailed') }}
        </a-button>
        <a-button type="primary" :disabled="!hasSelectedRows" @click="handleSetSuccessAndRelate">
          {{ t('action.setSuccessAndRelate') }}
        </a-button>
      </div>
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
  merchant?: string
  fromAddress: string
  toAddress: string
  amount: string
  coinCode?: string
  chainCoin?: string
  txHash: string
  status: string
  createTime: string
  onChainTime: string | null
  successTime: string | null
  transferType: TransferType
  transactionId?: string
  relatedOrderIds?: string
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
    title: t('field.index'),
    dataIndex: 'index',
    key: 'index',
    width: 70,
    customRender: ({ text, index }: { text: any; index: number }) => {
      return (pagination.value.current! - 1) * pagination.value.pageSize! + index + 1
    }
  },
  {
    title: t('field.transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    width: 150,
  },
  {
    title: t('field.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('field.transferStatus'),
    dataIndex: 'status',
    key: 'status',
    width: 130,
  },
  {
    title: t('field.transferType'),
    dataIndex: 'transferType',
    key: 'transferType',
    width: 130
  },
  {
    title: t('field.chainCoin'),
    dataIndex: 'chainCoin',
    key: 'chainCoin',
    width: 150,
  },
  {
    title: t('field.amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    align: 'right',
  },
  {
    title: 'TxHash',
    dataIndex: 'txHash',
    key: 'txHash',
    width: 200,
  },
  {
    title: t('field.fromAddress'),
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    width: 200,
  },
  {
    title: t('field.toAddress'),
    dataIndex: 'toAddress',
    key: 'toAddress',
    width: 200,
  },
  {
    title: t('field.transactionId'),
    dataIndex: 'transactionId',
    key: 'transactionId',
    width: 180,
  },
  {
    title: t('field.relatedOrderIds'),
    dataIndex: 'relatedOrderIds',
    key: 'relatedOrderIds',
    width: 200,
  },
  {
    title: t('field.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
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

// 表格列定義已在上面的 columns computed 中定義
const tableColumns = columns

// 待人工確認功能
const manualConfirmModalVisible = ref(false)
const manualConfirmList = ref<TransferRecord[]>([])
const selectedRowKeys = ref<string[]>([])
const currentTransferId = ref('')
const currentTransferType = ref('')

const manualConfirmColumns = computed(() => [
  {
    title: t('field.index'),
    key: 'index',
    width: 70,
  },
  {
    title: t('field.transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    width: 150,
  },
  {
    title: t('field.chainCoin'),
    dataIndex: 'chainCoin',
    key: 'chainCoin',
    width: 150,
  },
  {
    title: t('field.amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'right',
  },
  {
    title: t('field.fromAddress'),
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    width: 200,
  },
  {
    title: t('field.toAddress'),
    dataIndex: 'toAddress',
    key: 'toAddress',
    width: 200,
  }
])

const manualConfirmRowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    // 非 SWAP 類型只能勾選一條記錄
    if (currentTransferType.value !== 'swap' && keys.length > 1) {
      message.warning(t('message.nonSwapOnlyOneRecord'))
      return
    }
    selectedRowKeys.value = keys
  }
}))

const hasSelectedRows = computed(() => selectedRowKeys.value.length > 0)

const handleManualConfirmClick = (record: TransferRecord) => {
  // 設定當前轉帳單號和轉帳類型
  currentTransferId.value = record.transferId
  currentTransferType.value = record.transferType?.type || ''

  // 判斷是否為 SWAP 類型
  const isSwap = record.transferType?.type === 'swap'

  if (isSwap) {
    // SWAP 類型：生成一正一負的配對資料（共2筆，txHash 一致）
    const baseTxHash = record.txHash
    manualConfirmList.value = [
      {
        id: `${record.id}_out`,
        transferId: `${record.transferId}-OUT`,
        merchant: record.merchant,
        fromAddress: record.fromAddress,
        toAddress: '0x1234567890abcdef1234567890abcdef12345678',
        amount: `-${record.amount}`, // 負數（出帳）
        chainCoin: record.chainCoin || record.coinCode,
        txHash: baseTxHash, // 相同的 txHash
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: `${record.transactionId}-OUT`,
        relatedOrderIds: 'OUT-SWAP-001'
      },
      {
        id: `${record.id}_in`,
        transferId: `${record.transferId}-IN`,
        merchant: record.merchant,
        fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
        toAddress: record.toAddress,
        amount: record.amount, // 正數（入帳）
        chainCoin: record.chainCoin || record.coinCode,
        txHash: baseTxHash, // 相同的 txHash
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: `${record.transactionId}-IN`,
        relatedOrderIds: 'IN-SWAP-001'
      }
    ]
  } else {
    // 非 SWAP 類型：生成多筆資料方便展示多選
    manualConfirmList.value = [
      {
        id: `${record.id}_1`,
        transferId: `${record.transferId}-1`,
        merchant: record.merchant,
        fromAddress: record.fromAddress,
        toAddress: record.toAddress,
        amount: record.amount,
        chainCoin: record.chainCoin || record.coinCode,
        txHash: record.txHash,
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: record.transactionId,
        relatedOrderIds: record.relatedOrderIds
      },
      {
        id: `${record.id}_2`,
        transferId: `${record.transferId}-2`,
        merchant: record.merchant,
        fromAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        toAddress: '0x1234567890abcdef1234567890abcdef12345678',
        amount: '750.00',
        chainCoin: record.chainCoin || record.coinCode,
        txHash: '0xaabbccdd1122334455667788aabbccdd11223344',
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: `${record.transactionId}-2`,
        relatedOrderIds: 'OUT-101/IN-101'
      },
      {
        id: `${record.id}_3`,
        transferId: `${record.transferId}-3`,
        merchant: record.merchant,
        fromAddress: '0x9988776655443322119988776655443322119988',
        toAddress: '0x2211334455667788992211334455667788992211',
        amount: '1250.50',
        chainCoin: record.chainCoin || record.coinCode,
        txHash: '0x1122334455667788aabbccdd1122334455667788',
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: `${record.transactionId}-3`,
        relatedOrderIds: 'OUT-102'
      },
      {
        id: `${record.id}_4`,
        transferId: `${record.transferId}-4`,
        merchant: record.merchant,
        fromAddress: '0xffeeddccbbaa99887766554433221100ffeeddcc',
        toAddress: '0x0011223344556677889900112233445566778899',
        amount: '320.75',
        chainCoin: record.chainCoin || record.coinCode,
        txHash: '0xffeeddccbbaa99887766554433221100ffeeddcc',
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: `${record.transactionId}-4`,
        relatedOrderIds: 'OUT-103/IN-103'
      },
      {
        id: `${record.id}_5`,
        transferId: `${record.transferId}-5`,
        merchant: record.merchant,
        fromAddress: '0x5544332211009988776655443322110099887766',
        toAddress: '0x6677889900112233445566778899001122334455',
        amount: '890.25',
        chainCoin: record.chainCoin || record.coinCode,
        txHash: '0x5544332211009988776655443322110099887766',
        status: record.status,
        createTime: record.createTime,
        onChainTime: record.onChainTime,
        successTime: record.successTime,
        transferType: record.transferType,
        transactionId: `${record.transactionId}-5`,
        relatedOrderIds: 'OUT-104/IN-104'
      }
    ]
  }

  selectedRowKeys.value = []
  manualConfirmModalVisible.value = true
}

const handleSetFailed = () => {
  if (selectedRowKeys.value.length > 0) {
    message.warning(t('message.cannotSetFailedWhenSelected'))
    return
  }

  // TODO: 調用API設定為失敗（將所有未勾選的記錄設定為失敗）
  console.log('設定失敗 - 處理所有記錄')
  message.success(t('message.operationSuccess'))
  manualConfirmModalVisible.value = false
  handleQuery() // 重新加載列表
}

const handleSetSuccessAndRelate = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning(t('message.pleaseSelectRecords'))
    return
  }

  // SWAP 類型驗證
  if (currentTransferType.value === 'swap') {
    // 1. 必須勾選兩筆
    if (selectedRowKeys.value.length !== 2) {
      message.warning(t('message.swapNeedTwoRecords'))
      return
    }

    // 獲取選中的兩筆記錄
    const selectedRecords = manualConfirmList.value.filter(r =>
      selectedRowKeys.value.includes(r.id)
    )

    if (selectedRecords.length !== 2) {
      message.warning(t('message.swapNeedTwoRecords'))
      return
    }

    const [record1, record2] = selectedRecords

    // 2. 驗證一正一負（一入帳一出帳）
    const amount1 = parseFloat(record1.amount)
    const amount2 = parseFloat(record2.amount)

    const hasPositive = amount1 > 0 || amount2 > 0
    const hasNegative = amount1 < 0 || amount2 < 0

    if (!hasPositive || !hasNegative) {
      message.warning(t('message.swapNeedInAndOut'))
      return
    }

    // 3. 驗證 txHash 一致
    if (record1.txHash !== record2.txHash) {
      message.warning(t('message.swapTxHashMismatch'))
      return
    }
  }

  // TODO: 調用API關聯且設定成功
  console.log('關聯且設定成功:', selectedRowKeys.value)
  message.success(t('message.operationSuccess'))
  manualConfirmModalVisible.value = false
  handleQuery() // 重新加載列表
}

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

.status-clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.status-clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #303030;
}

.modal-footer .ant-btn-primary {
  background-color: #52c41a;
  border-color: #52c41a;
}

.modal-footer .ant-btn-primary:hover {
  background-color: #73d13d;
  border-color: #73d13d;
}

.modal-footer .ant-btn-primary.ant-btn-dangerous {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

.modal-footer .ant-btn-primary.ant-btn-dangerous:hover {
  background-color: #ff7875;
  border-color: #ff7875;
}
</style>