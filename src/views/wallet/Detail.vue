<template>
  <div class="wallet-detail">
    <!-- 篩選器卡片 -->
    <a-card :bordered="false" :bodyStyle="{ padding: '20px 24px' }" class="filter-card">
      <template #title>
        <span class="card-title">{{ $t('walletDetail') }}</span>
      </template>
      
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item :label="$t('address')">
          <a-input
            v-model:value="queryParams.address"
            :placeholder="$t('pleaseInputAddress')"
            style="width: 400px"
            allow-clear
          />
        </a-form-item>

        <a-form-item :label="$t('chainType')">
          <a-select
            v-model:value="queryParams.chainType"
            style="width: 200px"
            :placeholder="$t('pleaseSelectChainType')"
            allow-clear
          >
            <a-select-option v-for="type in chainTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">
              <template #icon><SearchOutlined /></template>
              {{ $t('query') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              {{ $t('reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 錢包資訊卡片 -->
    <a-card :bordered="false" class="info-card">
      <template #title>
        <span class="card-title">{{ $t('walletInfo') }}</span>
      </template>
      
      <div class="info-section">
        <div class="info-item">
          <span class="info-label">
            <WalletOutlined /> {{ $t('walletId') }}
          </span>
          <span class="info-value">{{ walletInfo.walletId }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <LinkOutlined /> {{ $t('address') }}
          </span>
          <span class="info-value address-container">
            {{ walletInfo.address }}
            <CopyOutlined
              class="copy-icon"
              @click="copyAddress(walletInfo.address)"
            />
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <ShopOutlined /> {{ $t('merchant') }}
          </span>
          <span class="info-value">{{ walletInfo.merchant }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <UserOutlined /> {{ $t('userId') }}
          </span>
          <span class="info-value">{{ walletInfo.userId }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <AppstoreOutlined /> {{ $t('walletType') }}
          </span>
          <span class="info-value">{{ walletInfo.walletType }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <KeyOutlined /> {{ $t('privateKeyManagement') }}
          </span>
          <span class="info-value">
            <a-space>
              <a-button type="primary" @click="handleDownloadPrivateKey">
                <template #icon><DownloadOutlined /></template>
                {{ $t('downloadPrivateKey') }}
              </a-button>
              <a-button @click="showPrivateKeyHistory">
                <template #icon><HistoryOutlined /></template>
                {{ $t('privateKeyHistory') }}
              </a-button>
            </a-space>
          </span>
        </div>
      </div>
    </a-card>

    <!-- 在錢包資訊卡片後添加代幣詳情卡片 -->
    <a-card :bordered="false" class="token-card">
      <template #title>
        <span class="card-title">{{ $t('tokenDetail') }}</span>
      </template>
      
      <a-table
        :columns="tokenColumns"
        :data-source="tokenData"
        :pagination="false"
        :bordered="true"
        :scroll="{ x: 1300 }"
      >
        <!-- 自定義列渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 餘額列 -->
          <template v-if="column.key === 'balance'">
            <div class="stacked-values">
              <div>{{ record.currentBalance }}</div>
              <div class="secondary-value">{{ record.availableBalance }}</div>
            </div>
          </template>
          
          <!-- 轉入量列 -->
          <template v-if="column.key === 'inflow'">
            <div class="stacked-values">
              <div>{{ record.currentInflow }}</div>
              <div class="secondary-value">{{ record.availableInflow }}</div>
            </div>
          </template>
          
          <!-- 轉出量列 -->
          <template v-if="column.key === 'outflow'">
            <div class="stacked-values">
              <div>{{ record.currentOutflow }}</div>
              <div class="secondary-value">{{ record.availableOutflow }}</div>
            </div>
          </template>
          
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showTransferHistory(record)">
                {{ $t('transferHistory') }}
              </a-button>
              <a-button type="link" size="small" @click="showTransactionDetail(record)">
                {{ $t('transactionDetail') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 私鑰相關的 Modal 保持不變 -->
    <a-modal
      v-model:visible="downloadModalVisible"
      :title="$t('downloadPrivateKey')"
      @ok="confirmDownload"
    >
      <a-form :model="downloadForm">
        <a-form-item :label="$t('operationReason')" required>
          <a-textarea
            v-model:value="downloadForm.reason"
            :placeholder="$t('pleaseInputReason')"
            :rows="4"
            :maxLength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="historyModalVisible"
      :title="$t('privateKeyHistory')"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="historyColumns"
        :data-source="historyData"
        :pagination="false"
        :bordered="true"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  CopyOutlined,
  DownloadOutlined,
  HistoryOutlined,
  WalletOutlined,
  LinkOutlined,
  ShopOutlined,
  UserOutlined,
  AppstoreOutlined,
  KeyOutlined
} from '@ant-design/icons-vue'

const { t } = useI18n()
const route = useRoute()

// 查詢參數
const queryParams = reactive({
  address: '',
  chainType: undefined
})

// 鏈類型選項
const chainTypes = [
  { value: 'evm', label: 'EVM' },
  { value: 'btc', label: 'BTC' },
  { value: 'tron', label: 'TRON' },
  { value: 'eos', label: 'EOS' }
]

// 錢包信息
const walletInfo = reactive({
  walletId: 'W123456789',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  merchant: 'Fameex',
  userId: 'U123456',
  walletType: '用戶錢包'
})

// 查詢方法
const handleQuery = () => {
  console.log('查詢參數:', queryParams)
}

// 重置方法
const handleReset = () => {
  queryParams.address = ''
  queryParams.chainType = undefined
}

// 複製地址
const copyAddress = async (address) => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('copySuccess'))
  } catch (err) {
    message.error(t('copyFailed'))
  }
}

// 私鑰下載相關
const downloadModalVisible = ref(false)
const downloadForm = reactive({
  reason: ''
})

const handleDownloadPrivateKey = () => {
  downloadModalVisible.value = true
}

const confirmDownload = () => {
  if (!downloadForm.reason.trim()) {
    message.error(t('pleaseInputReason'))
    return
  }
  
  // 這裡添加下載私鑰的邏輯
  message.success(t('privateKeyDownloaded'))
  downloadModalVisible.value = false
  downloadForm.reason = ''
}

// 私鑰歷史記錄相關
const historyModalVisible = ref(false)
const historyColumns = [
  {
    title: t('operatorUser'),
    dataIndex: 'operator',
    key: 'operator',
    width: 120,
  },
  {
    title: t('operationReason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 150,
  },
  {
    title: t('operationTime'),
    dataIndex: 'time',
    key: 'time',
    width: 180,
  }
]

const historyData = [
  {
    key: '1',
    operator: 'Admin',
    reason: t('routineBackup'),
    time: '2024-03-15 10:30:25'
  },
  {
    key: '2',
    operator: 'Manager',
    reason: t('securityCheck'),
    time: '2024-03-14 15:45:30'
  }
]

const showPrivateKeyHistory = () => {
  historyModalVisible.value = true
}

// 添加代幣詳情表格配置
const tokenColumns = [
  {
    title: t('transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    width: 150,
  },
  {
    title: `${t('currentBalance')} / ${t('availableBalance')}`,
    key: 'balance',
    width: 200,
  },
  {
    title: t('holdingCost'),
    dataIndex: 'holdingCost',
    key: 'holdingCost',
    width: 150,
  },
  {
    title: t('assetValue'),
    dataIndex: 'assetValue',
    key: 'assetValue',
    width: 150,
  },
  {
    title: `${t('currentInflow')} / ${t('availableInflow')}`,
    key: 'inflow',
    width: 200,
  },
  {
    title: `${t('currentOutflow')} / ${t('availableOutflow')}`,
    key: 'outflow',
    width: 200,
  },
  {
    title: t('action'),
    key: 'action',
    fixed: 'right',
    width: 200,
  },
]

// 模擬數據
const tokenData = [
  {
    key: '1',
    transferId: 'T202403150001',
    fromWallet: 'W123456789',
    toWallet: 'W987654321',
    currentBalance: '1000.00000000',
    availableBalance: '900.00000000',
    holdingCost: '1.23456789',
    assetValue: '1234.56789000',
    currentInflow: '2000.00000000',
    availableInflow: '1800.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '900.00000000',
  },
  {
    key: '2',
    transferId: 'T202403150002',
    fromWallet: 'W234567890',
    toWallet: 'W876543210',
    currentBalance: '2500.00000000',
    availableBalance: '2300.00000000',
    holdingCost: '2.34567890',
    assetValue: '5678.90123000',
    currentInflow: '3000.00000000',
    availableInflow: '2800.00000000',
    currentOutflow: '500.00000000',
    availableOutflow: '400.00000000',
  },
  {
    key: '3',
    transferId: 'T202403150003',
    fromWallet: 'W345678901',
    toWallet: 'W765432109',
    currentBalance: '5000.00000000',
    availableBalance: '4800.00000000',
    holdingCost: '3.45678901',
    assetValue: '15678.90123000',
    currentInflow: '6000.00000000',
    availableInflow: '5800.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '800.00000000',
  },
  {
    key: '4',
    transferId: 'T202403150004',
    fromWallet: 'W456789012',
    toWallet: 'W654321098',
    currentBalance: '800.00000000',
    availableBalance: '750.00000000',
    holdingCost: '4.56789012',
    assetValue: '3456.78901000',
    currentInflow: '1000.00000000',
    availableInflow: '900.00000000',
    currentOutflow: '200.00000000',
    availableOutflow: '150.00000000',
  },
  {
    key: '5',
    transferId: 'T202403150005',
    fromWallet: 'W567890123',
    toWallet: 'W543210987',
    currentBalance: '3000.00000000',
    availableBalance: '2800.00000000',
    holdingCost: '5.67890123',
    assetValue: '16789.01234000',
    currentInflow: '4000.00000000',
    availableInflow: '3800.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '800.00000000',
  },
  {
    key: '6',
    transferId: 'T202403150006',
    fromWallet: 'W678901234',
    toWallet: 'W432109876',
    currentBalance: '1500.00000000',
    availableBalance: '1400.00000000',
    holdingCost: '6.78901234',
    assetValue: '9876.54321000',
    currentInflow: '2000.00000000',
    availableInflow: '1900.00000000',
    currentOutflow: '500.00000000',
    availableOutflow: '400.00000000',
  },
  {
    key: '7',
    transferId: 'T202403150007',
    fromWallet: 'W789012345',
    toWallet: 'W321098765',
    currentBalance: '4000.00000000',
    availableBalance: '3800.00000000',
    holdingCost: '7.89012345',
    assetValue: '28901.23456000',
    currentInflow: '5000.00000000',
    availableInflow: '4800.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '800.00000000',
  },
  {
    key: '8',
    transferId: 'T202403150008',
    fromWallet: 'W890123456',
    toWallet: 'W210987654',
    currentBalance: '2000.00000000',
    availableBalance: '1900.00000000',
    holdingCost: '8.90123456',
    assetValue: '16789.01234000',
    currentInflow: '3000.00000000',
    availableInflow: '2800.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '900.00000000',
  },
  {
    key: '9',
    transferId: 'T202403150009',
    fromWallet: 'W901234567',
    toWallet: 'W109876543',
    currentBalance: '6000.00000000',
    availableBalance: '5800.00000000',
    holdingCost: '9.01234567',
    assetValue: '45678.90123000',
    currentInflow: '7000.00000000',
    availableInflow: '6800.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '800.00000000',
  },
  {
    key: '10',
    transferId: 'T202403150010',
    fromWallet: 'W012345678',
    toWallet: 'W098765432',
    currentBalance: '3500.00000000',
    availableBalance: '3300.00000000',
    holdingCost: '10.12345678',
    assetValue: '32109.87654000',
    currentInflow: '4500.00000000',
    availableInflow: '4300.00000000',
    currentOutflow: '1000.00000000',
    availableOutflow: '800.00000000',
  }
]

// 處理轉帳記錄按鈕點擊
const showTransferHistory = (record) => {
  console.log('查看轉帳記錄:', record)
  // 實現查看轉帳記錄的邏輯
}

// 處理交易明細按鈕點擊
const showTransactionDetail = (record) => {
  console.log('查看交易明細:', record)
  // 實現查看交易明細的邏輯
}

// 頁面加載時從路由獲取參數
onMounted(() => {
  const { address, chainType } = route.query
  if (address) queryParams.address = address
  if (chainType) queryParams.chainType = chainType
  
  // 這裡可以添加獲取錢包詳情的API調用
  handleQuery()
})
</script>

<style scoped>
.wallet-detail {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
}

.info-card {
  background: #141414;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 16px 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.info-label {
  min-width: 120px;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  flex: 1;
  color: rgba(255, 255, 255, 0.85);
  word-break: break-all;
}

.address-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  cursor: pointer;
  color: var(--ant-primary-color);
  transition: all 0.3s;
}

.copy-icon:hover {
  opacity: 0.8;
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

/* 深色模式適配 */
:deep(.ant-modal-content),
:deep(.ant-modal-header) {
  background-color: #1f1f1f;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
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

/* 添加文本框樣式 */
:deep(.ant-input) {
  background-color: #1f1f1f;
  border-color: #434343;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-input:hover),
:deep(.ant-input:focus) {
  border-color: #177ddc;
}

:deep(.ant-input-data-count) {
  color: rgba(255, 255, 255, 0.45);
}

.token-card {
  margin-top: 24px;
}

.stacked-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.secondary-value {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

:deep(.ant-table-cell) {
  vertical-align: top;
  padding: 16px !important;
}

:deep(.ant-table-thead > tr > th) {
  white-space: nowrap;
}

:deep(.ant-btn-link) {
  color: #177ddc;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}

:deep(.ant-btn-link:hover) {
  color: #177ddc;
  opacity: 0.8;
}
</style> 