<template>
  <div class="wallet-transfer">
    <a-row :gutter="24">
      <!-- 左側轉出錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card from-wallet">
          <template #title>
            <span class="card-title">{{ t('wallet.fromWalletInfo') }}</span>
          </template>
          <a-form layout="vertical" :model="fromWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.merchant') }}</div>
                <merchant-select v-model="fromWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.chainType') }}</div>
                <chain-type-select v-model="fromWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.currency') }}</div>
                <currency-select v-model="fromWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.address') }}</div>
                <a-input
                  v-model:value="fromWalletForm.address"
                  :placeholder="t('common.prompt.pleaseInputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item class="query-button">
                <div class="form-label">&nbsp;</div>
                <a-button type="primary" @click="handleFromWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ t('common.action.search') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右側轉入錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card to-wallet">
          <template #title>
            <span class="card-title">{{ t('wallet.toWalletInfo') }}</span>
          </template>
          <a-form layout="vertical" :model="toWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.merchant') }}</div>
                <merchant-select v-model="toWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.chainType') }}</div>
                <chain-type-select v-model="toWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.currency') }}</div>
                <currency-select v-model="toWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('common.field.address') }}</div>
                <a-input
                  v-model:value="toWalletForm.address"
                  :placeholder="t('common.prompt.pleaseInputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item label="&nbsp;" class="query-button">
                <a-button type="primary" @click="handleToWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ t('common.action.search') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 轉出錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card from-detail">
          <template #title>
            <span class="card-title">{{ t('wallet.fromWalletDetail') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ t('common.field.currency') }}</span>
              <span class="detail-value">{{ fromWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('wallet.balance.current') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('wallet.balance.availableOutflow') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.availableOutflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 轉入錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card to-detail">
          <template #title>
            <span class="card-title">{{ t('wallet.toWalletDetail') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ t('common.field.currency') }}</span>
              <span class="detail-value">{{ toWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('wallet.balance.current') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('wallet.balance.availableInflow') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.availableInflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 轉帳資訊 -->
    <a-card :bordered="false" class="transfer-info">
      <template #title>
        <span class="card-title">{{ t('wallet.transferInfo') }}</span>
      </template>
      <div class="transfer-amount-container">
        <a-form layout="inline">
          <a-form-item :label="t('common.field.transferAmount')">
            <a-input-number
              v-model:value="transferAmount"
              :min="0"
              :max="maxAmount"
              :precision="8"
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="useMaxAmount" @change="handleMaxAmountChange">
              {{ t('common.field.maxAmount') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleTransfer">
              {{ t('common.action.transfer') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <!-- 轉帳確認彈窗 -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="t('wallet.prompt.confirmTransfer')"
      @ok="handleConfirmTransfer"
      @cancel="handleCancelTransfer"
      :confirmLoading="confirmLoading"
      width="600px"
    >
      <div class="confirm-content">
        <!-- 轉出資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ t('wallet.fromWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.typeLabel') }}</span>
              <span class="confirm-value">{{ fromWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.chainType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.currency') }}</span>
              <span class="confirm-value">{{ fromWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.address') }}</span>
              <span class="confirm-value">{{ fromWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 轉帳數量卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <div class="amount-title">
              <span>{{ t('common.field.transferAmount') }}：</span>
              <span class="amount-value">{{ formatNumber(transferAmount) }}</span>
            </div>
          </template>
        </a-card>

        <!-- 轉入資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ t('wallet.toWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.typeLabel') }}</span>
              <span class="confirm-value">{{ toWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.chainType') }}</span>
              <span class="confirm-value">{{ toWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.currency') }}</span>
              <span class="confirm-value">{{ toWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('common.field.address') }}</span>
              <span class="confirm-value">{{ toWalletForm.address }}</span>
            </div>
          </div>
        </a-card>
      </div>
    </a-modal>

    <!-- 轉帳申請查詢 -->
    <a-card :title="t('wallet.transferQueryTitle')" class="transfer-card query-card">
      <a-form layout="inline" class="query-form">
        <div class="form-row">
          <a-form-item :label="$t('common.field.merchant')" class="form-item">
            <merchant-select v-model="queryParams.merchant" class="full-width" />
          </a-form-item>
          <a-form-item :label="$t('common.field.chainType')" class="form-item">
            <chain-type-select v-model="queryParams.chainType" class="full-width" />
          </a-form-item>
          <a-form-item :label="$t('common.field.currency')" class="form-item">
            <currency-select v-model="queryParams.currency" class="full-width" />
          </a-form-item>
          <a-form-item :label="$t('common.field.typeLabel')" class="form-item">
            <wallet-type-select v-model="queryParams.walletType" class="full-width" />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item :label="$t('common.field.address')" class="form-item address-input">
            <a-input v-model:value="queryParams.address" class="full-width" :placeholder="$t('common.prompt.pleaseInputAddress')" />
          </a-form-item>
          <a-form-item :label="'\u00A0'" class="form-item query-button">
            <a-space>
              <a-button type="primary" @click="handleQuery">
                {{ t('common.action.search') }}
              </a-button>
              <a-button @click="handleReset">
                {{ t('common.action.reset') }}
              </a-button>
            </a-space>
          </a-form-item>
        </div>
      </a-form>
    </a-card>

    <!-- 轉帳列表 -->
    <a-card :title="$t('wallet.transferList')" class="transfer-card list-card">
      <a-table 
        :dataSource="transferList" 
        :columns="columns" 
        :loading="loading" 
        :pagination="pagination" 
        @change="handleTableChange"
        :scroll="{ y: 480 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button 
                type="primary" 
                size="small" 
                v-if="record.auditStatus === 'pending'"
                @click="handleAudit(record)"
              >
                {{ t('common.action.audit') }}
              </a-button>
              <a-button 
                type="link" 
                size="small" 
                v-if="['approved', 'rejected'].includes(record.auditStatus)"
                @click="handleViewAuditDetail(record)"
              >
                {{ t('common.action.detail') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 審核操作彈窗 -->
    <a-modal
      v-model:open="auditModalVisible"
      :title="$t('wallet.auditOperation')"
      @ok="handleConfirmAudit"
      @cancel="handleCancelAudit"
      :confirmLoading="auditLoading"
    >
      <a-form :model="auditForm" layout="vertical">
        <a-form-item :label="$t('common.field.auditOperation')" required>
          <a-select v-model:value="auditForm.status" style="width: 100%">
            <a-select-option value="approved">{{ t('common.auditStatus.approved') }}</a-select-option>
            <a-select-option value="rejected">{{ t('common.auditStatus.rejected') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('wallet.field.auditReason')" required>
          <a-textarea 
            v-model:value="auditForm.reason"
            :rows="4"
            :placeholder="$t('wallet.prompt.pleaseInputAuditReason')"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 審核詳情彈窗 -->
    <a-modal
      v-model:open="auditDetailModalVisible"
      :title="$t('wallet.auditDetail')"
      @cancel="() => auditDetailModalVisible = false"
      :footer="null"
    >
      <div class="audit-detail">
        <div class="audit-detail-item">
          <span class="audit-detail-label">{{ t('common.field.auditOperation') }}：</span>
          <span class="audit-detail-value">{{ selectedRecord?.auditStatus === 'approved' ? t('common.auditStatus.approved') : t('common.auditStatus.rejected') }}</span>
        </div>
        <div class="audit-detail-item">
          <span class="audit-detail-label">{{ t('wallet.field.auditReason') }}：</span>
          <span class="audit-detail-value">{{ selectedRecord?.auditReason }}</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import MerchantSelect from '../../components/selectors/MerchantSelect.vue'
import ChainTypeSelect from '../../components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '../../components/selectors/CurrencySelect.vue'
import WalletTypeSelect from '../../components/selectors/WalletTypeSelect.vue'

const { t } = useI18n()

// 轉出錢包表單
const fromWalletForm = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

// 轉入錢包表單
const toWalletForm = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

// 錢包詳情
const fromWalletDetail = reactive({
  currency: 'USDT',
  balance: '10000.00000000',
  availableOutflow: '8000.00000000'
})

const toWalletDetail = reactive({
  currency: 'USDT',
  balance: '5000.00000000',
  availableInflow: '15000.00000000'
})

// 轉帳相關
const transferAmount = ref(0)
const useMaxAmount = ref(false)
const maxAmount = computed(() => Number(fromWalletDetail.availableOutflow))

// 處理最大數量變更
const handleMaxAmountChange = (checked) => {
  if (checked) {
    transferAmount.value = maxAmount.value
  }
}

// 格式化數字
const formatNumber = (value) => {
  if (!value) return '0.00000000'
  return Number(value).toFixed(8)
}

// 處理轉出錢包查詢
const handleFromWalletQuery = () => {
  if (!fromWalletForm.address) {
    message.error(t('wallet.prompt.pleaseInputAddress'))
    return
  }
  // TODO: 實現查詢邏輯
  console.log('查詢轉出錢包:', fromWalletForm)
}

// 處理轉入錢包查詢
const handleToWalletQuery = () => {
  if (!toWalletForm.address) {
    message.error(t('wallet.prompt.pleaseInputAddress'))
    return
  }
  // TODO: 實現查詢邏輯
  console.log('查詢轉入錢包:', toWalletForm)
}

// 轉帳確認相關
const confirmModalVisible = ref(false)
const confirmLoading = ref(false)

// 處理轉帳按鈕點擊
const handleTransfer = () => {
  if (!fromWalletForm.address || !toWalletForm.address) {
    message.error(t('wallet.prompt.pleaseSelectFromAndToWallet'))
    return
  }

  if (!transferAmount.value) {
    message.error(t('wallet.prompt.pleaseInputTransferAmount'))
    return
  }

  // 顯示確認彈窗
  confirmModalVisible.value = true
}

// 處理確認轉帳
const handleConfirmTransfer = async () => {
  confirmLoading.value = true
  try {
    // TODO: 實現轉帳邏輯
    console.log('轉帳資訊:', {
      from: fromWalletForm,
      to: toWalletForm,
      amount: transferAmount.value
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 調用
    message.success(t('wallet.prompt.transferRequestSubmitted'))
    confirmModalVisible.value = false
  } catch (error) {
    message.error(t('wallet.prompt.transferFailed'))
  } finally {
    confirmLoading.value = false
  }
}

// 處理取消轉帳
const handleCancelTransfer = () => {
  confirmModalVisible.value = false
}

// 查詢參數
const queryParams = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  walletType: undefined,
  address: ''
})

// 轉帳列表數據
const transferList = ref([])
const loading = ref(false)

// 表格列定義
const columns = [
  {
    title: t('common.field.fromWalletId'),
    dataIndex: 'fromWalletId',
    key: 'fromWalletId',
    width: 180,
  },
  {
    title: t('common.field.fromChainType'),
    dataIndex: 'fromChainType',
    key: 'fromChainType',
    width: 120,
  },
  {
    title: t('common.field.fromCurrency'),
    dataIndex: 'fromCurrency',
    key: 'fromCurrency',
    width: 120,
  },
  {
    title: t('wallet.transferAmount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 140,
    align: 'right'
  },
  {
    title: t('wallet.toWallet'),
    dataIndex: 'toMerchant',
    key: 'toMerchant',
    width: 120
  },
  {
    title: t('wallet.toWalletId'),
    dataIndex: 'toWalletId',
    key: 'toWalletId',
    width: 140
  },
  {
    title: t('wallet.toChainType'),
    dataIndex: 'toChainType',
    key: 'toChainType',
    width: 100
  },
  {
    title: t('wallet.toCurrency'),
    dataIndex: 'toCurrency',
    key: 'toCurrency',
    width: 100
  },
  {
    title: t('common.field.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160
  },
  {
    title: t('common.field.auditTime'),
    dataIndex: 'auditTime',
    key: 'auditTime',
    width: 160
  },
  {
    title: t('common.field.auditStatus'),
    dataIndex: 'auditStatus',
    key: 'auditStatus',
    width: 100,
    customRender: ({ text }) => {
      const statusMap = {
        pending: t('common.auditStatus.pending'),
        approved: t('common.auditStatus.approved'),
        rejected: t('common.auditStatus.rejected')
      }
      return statusMap[text] || text
    }
  },
  {
    title: t('wallet.transferStatus.label'),
    dataIndex: 'transferStatus',
    key: 'transferStatus',
    width: 120,
    customRender: ({ text, record }) => {
      if (['pending', 'rejected'].includes(record.auditStatus)) {
        return ''
      }
      const statusMap = {
        submitted: t('wallet.transferStatus.submitted'),
        onchain: t('wallet.transferStatus.onchain'),
        confirming: (record) => `${t('wallet.transferStatus.confirming')}(${record.confirmations}/${record.requiredConfirmations})`,
        completed: t('wallet.transferStatus.completed'),
        failed: t('wallet.transferStatus.failed')
      }
      return typeof statusMap[text] === 'function' ? statusMap[text](record) : statusMap[text] || text
    }
  },
  {
    title: t('common.action.action'),
    key: 'action',
    width: 80,
    fixed: 'right'
  }
]

// 格式化表格分頁
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
  showSizeChanger: true,
  showQuickJumper: true
})

// 生成模擬數據
const generateMockData = () => {
  const data = []
  const statuses = ['pending', 'approved', 'rejected']
  const transferStatuses = ['submitted', 'onchain', 'confirming', 'completed', 'failed']
  const merchants = ['商戶A', '商戶B', '商戶C']
  const chainTypes = ['BTC', 'ETH', 'TRX']
  const currencies = ['BTC', 'ETH', 'USDT']

  for (let i = 0; i < 10; i++) {
    const auditStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const transferStatus = ['pending', 'rejected'].includes(auditStatus) 
      ? null 
      : transferStatuses[Math.floor(Math.random() * transferStatuses.length)]
    
    const confirmations = transferStatus === 'confirming' ? Math.floor(Math.random() * 5) + 1 : null
    const requiredConfirmations = transferStatus === 'confirming' ? 12 : null

    data.push({
      key: i,
      fromMerchant: merchants[Math.floor(Math.random() * merchants.length)],
      fromWalletId: `W${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      fromChainType: chainTypes[Math.floor(Math.random() * chainTypes.length)],
      fromCurrency: currencies[Math.floor(Math.random() * currencies.length)],
      amount: (Math.random() * 1000).toFixed(8),
      toMerchant: merchants[Math.floor(Math.random() * merchants.length)],
      toWalletId: `W${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      toChainType: chainTypes[Math.floor(Math.random() * chainTypes.length)],
      toCurrency: currencies[Math.floor(Math.random() * currencies.length)],
      createTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      auditTime: auditStatus !== 'pending' ? new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) : null,
      auditStatus,
      transferStatus,
      confirmations,
      requiredConfirmations
    })
  }
  return data
}

// 更新查詢方法
const handleQuery = () => {
  loading.value = true
  // 模擬API調用
  setTimeout(() => {
    transferList.value = generateMockData()
    loading.value = false
  }, 1000)
}

// 初始化數據
onMounted(() => {
  handleQuery()
})

// 重置方法
const handleReset = () => {
  queryParams.merchant = undefined
  queryParams.chainType = undefined
  queryParams.currency = undefined
  queryParams.walletType = undefined
  queryParams.address = ''
}

// 審核相關
const auditModalVisible = ref(false)
const auditDetailModalVisible = ref(false)
const auditLoading = ref(false)
const selectedRecord = ref(null)
const auditForm = reactive({
  status: undefined,
  reason: ''
})

// 處理審核按鈕點擊
const handleAudit = (record) => {
  selectedRecord.value = record
  auditForm.status = undefined
  auditForm.reason = ''
  auditModalVisible.value = true
}

// 處理確認審核
const handleConfirmAudit = async () => {
  if (!auditForm.status) {
    message.error(t('wallet.prompt.pleaseSelectAuditOperation'))
    return
  }
  if (!auditForm.reason) {
    message.error(t('wallet.prompt.pleaseInputAuditReason'))
    return
  }

  auditLoading.value = true
  try {
    // TODO: 實現審核邏輯
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 調用
    
    // 更新本地數據
    const index = transferList.value.findIndex(item => item.key === selectedRecord.value.key)
    if (index !== -1) {
      transferList.value[index] = {
        ...transferList.value[index],
        auditStatus: auditForm.status,
        auditReason: auditForm.reason,
        auditTime: new Date().toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      }
    }
    
    message.success(t('wallet.prompt.auditSuccess'))
    auditModalVisible.value = false
  } catch (error) {
    message.error(t('wallet.prompt.auditFailed'))
  } finally {
    auditLoading.value = false
  }
}

// 處理取消審核
const handleCancelAudit = () => {
  auditModalVisible.value = false
}

// 處理查看審核詳情
const handleViewAuditDetail = (record) => {
  selectedRecord.value = record
  auditDetailModalVisible.value = true
}

// 處理表格變更
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  handleQuery()
}
</script>

<style scoped>
@import '../../styles/common.css';

.wallet-transfer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  :deep(.ant-row) {
    flex: 1;
    display: flex;
    margin-bottom: 0;
  }

  :deep(.ant-col) {
    height: auto;
    display: flex;
    flex-direction: column;
  }

  .transfer-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    
    &.from-wallet,
    &.to-wallet {
      min-height: 280px;

      .ant-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow: auto;
        padding: 16px 0;

        .form-row {
          flex-shrink: 0;
          display: flex;
          gap: 16px;
          margin-bottom: 0;

          .form-item {
            flex: 1;
            min-width: 0;
            margin-bottom: 0;
          }

          .query-button {
            flex: 0 0 auto;
            margin-left: auto;
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .detail-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    min-height: 200px;

    .detail-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
      overflow: auto;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .detail-label {
        color: rgba(255, 255, 255, 0.45);
        min-width: 80px;
      }

      .detail-value {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .query-card {
    margin-bottom: 16px;

    :deep(.ant-card-body) {
      padding: 24px;
    }

    .query-form {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .form-row {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        margin: 0;
        flex-wrap: nowrap;

        .form-item {
          flex: 1;
          min-width: 0;
          margin: 0;
          
          :deep(.ant-form-item-label) {
            padding-bottom: 8px;
          }

          :deep(.ant-form-item-control-input) {
            width: 100%;
          }

          :deep(.ant-select),
          :deep(.ant-input),
          :deep(.ant-select-selector) {
            width: 100% !important;
          }

          &.address-input {
            flex: 2;
          }

          &.query-button {
            flex: 0 0 auto;
            margin: 0;

            :deep(.ant-form-item-control) {
              margin-top: 30px;
            }

            :deep(.ant-space) {
              gap: 8px !important;
            }
          }
        }
      }
    }
  }

  .list-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;

    :deep(.ant-card-body) {
      flex: 1;
      padding: 0;
      overflow: hidden;

      .ant-table-wrapper {
        height: 100%;
      }

      .ant-spin-nested-loading,
      .ant-spin-container,
      .ant-table {
        height: 100%;
      }

      .ant-table-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ant-table-body {
        flex: 1;
        overflow: auto;
      }
    }
  }
}
</style> 