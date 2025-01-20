<template>
  <div class="wallet-detail">
    <!-- 查詢表單 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ $t('wallet.queryCondition') }}</span>
      </template>
      <a-form layout="inline" :model="queryParams">
        <a-form-item :label="$t('wallet.merchant')">
          <merchant-select v-model="queryParams.merchant" :style="{ width: '180px' }" />
        </a-form-item>
        <a-form-item :label="$t('wallet.chainType')">
          <chain-type-select v-model="queryParams.chainType" :style="{ width: '180px' }" />
        </a-form-item>
        <a-form-item :label="$t('wallet.currency')">
          <currency-select v-model="queryParams.currency" :style="{ width: '180px' }" />
        </a-form-item>
        <a-form-item :label="$t('wallet.address')">
          <a-input
            v-model:value="queryParams.address"
            :placeholder="$t('wallet.prompt.pleaseInputAddress')"
            :style="{ width: '300px' }"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            {{ $t('wallet.action.query') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 錢包資訊卡片 -->
    <a-card :bordered="false" class="info-card">
      <template #title>
        <span class="card-title">{{ $t('wallet.info') }}</span>
      </template>
      
      <div class="info-section">
        <div class="info-item">
          <span class="info-label">
            <WalletOutlined /> {{ $t('wallet.id') }}
          </span>
          <span class="info-value">{{ walletInfo.walletId }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <LinkOutlined /> {{ $t('wallet.address') }}
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
            <ShopOutlined /> {{ $t('wallet.merchant') }}
          </span>
          <span class="info-value">{{ walletInfo.merchant }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <UserOutlined /> {{ $t('wallet.userId') }}
          </span>
          <span class="info-value">{{ walletInfo.userId }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <AppstoreOutlined /> {{ $t('wallet.type') }}
          </span>
          <span class="info-value wallet-type-container">
            {{ walletInfo.walletType }}
            <a-space>
              <a-button type="primary" @click="handleChangeType">
                <template #icon><EditOutlined /></template>
                {{ $t('wallet.action.changeType') }}
              </a-button>
              <a-button @click="showTypeHistory">
                <template #icon><HistoryOutlined /></template>
                {{ $t('wallet.action.changeHistory') }}
              </a-button>
            </a-space>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <CheckCircleOutlined /> {{ $t('wallet.status') }}
          </span>
          <span class="info-value wallet-status-container">
            <span :class="['status-tag', walletInfo.isDisabled ? 'status-disabled' : 'status-enabled']">
              {{ walletInfo.isDisabled ? $t('wallet.status.disabled') : $t('wallet.status.enabled') }}
            </span>
            <a-space>
              <a-button type="primary" @click="handleChangeStatus">
                <template #icon><EditOutlined /></template>
                {{ $t('wallet.action.changeStatus') }}
              </a-button>
              <a-button @click="showStatusHistory">
                <template #icon><HistoryOutlined /></template>
                {{ $t('wallet.action.changeHistory') }}
              </a-button>
            </a-space>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">
            <KeyOutlined /> {{ $t('wallet.privateKeyManagement') }}
          </span>
          <span class="info-value">
            <a-space>
              <a-button type="primary" @click="handleDownloadPrivateKey">
                <template #icon><DownloadOutlined /></template>
                {{ $t('wallet.action.downloadPrivateKey') }}
              </a-button>
              <a-button @click="showPrivateKeyHistory">
                <template #icon><HistoryOutlined /></template>
                {{ $t('wallet.action.privateKeyHistory') }}
              </a-button>
            </a-space>
          </span>
        </div>
      </div>
    </a-card>

    <!-- 代幣詳情卡片 -->
    <a-card :bordered="false" class="token-card">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('wallet.tokenDetail') }}</span>
          <a-input-search
            v-model:value="searchText"
            :placeholder="$t('wallet.prompt.pleaseInputCoin')"
            style="width: 200px"
            @change="onSearch"
            allowClear
          />
        </div>
      </template>
      
      <a-table
        :columns="tokenColumns"
        :data-source="filteredData"
        :pagination="false"
        :bordered="true"
        :scroll="{ x: 1400 }"
        @change="handleTableChange"
      >
        <!-- 自定義列渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 餘額列 -->
          <template v-if="column.key === 'balance'">
            <a-tooltip
              v-if="record.isExceeded"
              :title="`${$t('wallet.storageLimit')}: ${formatNumber(record.storageLimit)}`"
            >
              <div class="stacked-values" :class="{ 'exceeded-balance': record.isExceeded }">
                <div>{{ formatNumber(record.currentBalance) }}</div>
                <div class="secondary-value">{{ formatNumber(record.availableBalance) }}</div>
              </div>
            </a-tooltip>
            <div v-else class="stacked-values">
              <div>{{ formatNumber(record.currentBalance) }}</div>
              <div class="secondary-value">{{ formatNumber(record.availableBalance) }}</div>
            </div>
          </template>
          
          <!-- 持有成本列 -->
          <template v-else-if="column.key === 'holdingCost'">
            {{ formatNumber(record.holdingCost) }}
          </template>

          <!-- 資產價值列 -->
          <template v-else-if="column.key === 'assetValue'">
            {{ formatNumber(record.assetValue) }}
          </template>
          
          <!-- 轉入量列 -->
          <template v-if="column.key === 'inflow'">
            <div class="stacked-values" :class="{ 'active-inflow': record.currentInflow !== '0.00000000' }">
              <div>{{ formatNumber(record.currentInflow) }}</div>
              <div class="secondary-value">{{ formatNumber(record.availableInflow) }}</div>
            </div>
          </template>
          
          <!-- 轉出量列 -->
          <template v-if="column.key === 'outflow'">
            <div class="stacked-values" :class="{ 'active-outflow': record.currentOutflow !== '0.00000000' }">
              <div>{{ formatNumber(record.currentOutflow) }}</div>
              <div class="secondary-value">{{ formatNumber(record.availableOutflow) }}</div>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 私鑰下載彈窗 -->
    <a-modal
      v-model:visible="downloadModalVisible"
      :title="$t('wallet.prompt.downloadPrivateKey')"
      @ok="confirmDownload"
    >
      <a-form :model="downloadForm">
        <a-form-item :label="$t('wallet.prompt.downloadReason')">
          <a-textarea
            v-model:value="downloadForm.reason"
            :placeholder="$t('wallet.prompt.pleaseInputDownloadReason')"
            :rows="4"
            :maxLength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 私鑰歷史記錄彈窗 -->
    <a-modal
      v-model:visible="historyModalVisible"
      :title="$t('wallet.privateKeyHistory')"
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

    <!-- 變更類型彈窗 -->
    <a-modal
      v-model:visible="changeTypeModalVisible"
      :title="$t('wallet.prompt.changeType')"
      @ok="confirmChangeType"
      @cancel="() => changeTypeModalVisible = false"
    >
      <a-form :model="changeTypeForm">
        <a-form-item :label="$t('wallet.newType')" required>
          <wallet-type-select
            v-model="changeTypeForm.type"
          />
        </a-form-item>
        <a-form-item :label="$t('wallet.changeReason')" required>
          <a-textarea
            v-model:value="changeTypeForm.reason"
            :placeholder="$t('wallet.prompt.pleaseInputChangeReason')"
            :rows="4"
            :maxLength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 類型變更歷史彈窗 -->
    <a-modal
      v-model:visible="typeHistoryModalVisible"
      :title="$t('wallet.typeHistory')"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="typeHistoryColumns"
        :data-source="typeHistoryData"
        :pagination="false"
        :bordered="true"
      />
    </a-modal>

    <!-- 轉帳記錄彈窗 -->
    <a-modal
      v-model:visible="transferHistoryModalVisible"
      :title="$t('wallet.transferHistory')"
      :footer="null"
      width="1200px"
    >
      <a-table
        :columns="transferHistoryColumns"
        :data-source="transferHistoryData"
        :pagination="false"
        :bordered="true"
        :scroll="{ x: 2000 }"
      />
    </a-modal>

    <!-- 變更狀態彈窗 -->
    <a-modal
      v-model:visible="changeStatusModalVisible"
      :title="$t('wallet.prompt.changeStatus')"
      @ok="confirmChangeStatus"
    >
      <a-form :model="changeStatusForm">
        <a-form-item :label="$t('wallet.newStatus')" required>
          <a-select
            v-model:value="changeStatusForm.status"
            style="width: 100%"
            :placeholder="$t('wallet.prompt.pleaseSelectStatus')"
          >
            <a-select-option value="enabled">{{ $t('wallet.status.enabled') }}</a-select-option>
            <a-select-option value="disabled">{{ $t('wallet.status.disabled') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('wallet.changeReason')" required>
          <a-textarea
            v-model:value="changeStatusForm.reason"
            :placeholder="$t('wallet.prompt.pleaseInputChangeReason')"
            :rows="4"
            :maxLength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 狀態變更歷史彈窗 -->
    <a-modal
      v-model:visible="statusHistoryModalVisible"
      :title="$t('wallet.statusHistory')"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="statusHistoryColumns"
        :data-source="statusHistoryData"
        :pagination="false"
        :bordered="true"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount, h } from 'vue'
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
  KeyOutlined,
  EditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import ChainTypeSelect from '../../components/selectors/ChainTypeSelect.vue'
import WalletTypeSelect from '../../components/selectors/WalletTypeSelect.vue'
import MerchantSelect from '../../components/selectors/MerchantSelect.vue'
import CurrencySelect from '../../components/selectors/CurrencySelect.vue'

const { t } = useI18n()
const route = useRoute()

// 查詢參數
const queryParams = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

// 錢包信息
const walletInfo = reactive({
  walletId: 'W123456789',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  merchant: 'Fameex',
  userId: 'U123456',
  walletType: '用戶錢包',
  isDisabled: false
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
  downloadForm.reason = ''
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
    title: t('wallet.downloadTime'),
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: t('wallet.downloadReason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 300
  },
  {
    title: t('wallet.operator'),
    dataIndex: 'operator',
    key: 'operator',
    width: 120
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
  console.log('查看私鑰下載記錄')
  historyModalVisible.value = true
}

// 添加數字格式化函數
const formatNumber = (value) => {
  if (!value) return '0.00000000'
  const [intPart, decimalPart] = value.split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt
}

// 添加搜索和排序相關的狀態
const searchText = ref('')
const sortState = reactive({
  sortField: '',
  sortOrder: null
})

// 修改 tokenColumns 配置
const tokenColumns = computed(() => [
  {
    title: t('wallet.coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
    sorter: true,
  },
  {
    title: `${t('wallet.currentBalance')} / ${t('wallet.availableBalance')}`,
    key: 'balance',
    width: 200,
    align: 'right',
    sorter: true,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: t('wallet.holdingCost'),
    dataIndex: 'holdingCost',
    key: 'holdingCost',
    width: 150,
    align: 'right',
    sorter: true,
  },
  {
    title: t('wallet.assetValue'),
    dataIndex: 'assetValue',
    key: 'assetValue',
    width: 150,
    align: 'right',
    sorter: true,
  },
  {
    title: `${t('wallet.currentInflow')} / ${t('wallet.availableInflow')}`,
    key: 'inflow',
    width: 200,
    align: 'right',
    sorter: true,
  },
  {
    title: `${t('wallet.currentOutflow')} / ${t('wallet.availableOutflow')}`,
    key: 'outflow',
    width: 200,
    align: 'right',
    sorter: true,
  },
  {
    title: t('wallet.lastTransactionTime'),
    dataIndex: 'lastTransactionTime',
    key: 'lastTransactionTime',
    width: 180,
    sorter: true,
  },
  {
    title: t('action'),
    key: 'action',
    fixed: 'right',
    width: 160,
  },
])

// 處理表格排序變化
const handleTableChange = (pagination, filters, sorter) => {
  sortState.sortField = sorter.field
  sortState.sortOrder = sorter.order
}

// 搜索功能
const onSearch = () => {
  // 觸發重新渲染
}

// 計算過濾後的數據
const filteredData = computed(() => {
  let result = [...tokenData]
  
  // 應用搜索過濾
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter(item => 
      item.coin.toLowerCase().includes(searchLower)
    )
  }
  
  // 應用排序
  if (sortState.sortField && sortState.sortOrder) {
    result.sort((a, b) => {
      let compareA = a[sortState.sortField]
      let compareB = b[sortState.sortField]
      
      // 處理複合欄位的排序（如 balance、inflow、outflow）
      if (sortState.sortField === 'balance') {
        compareA = parseFloat(a.currentBalance)
        compareB = parseFloat(b.currentBalance)
      } else if (sortState.sortField === 'inflow') {
        compareA = parseFloat(a.currentInflow)
        compareB = parseFloat(b.currentInflow)
      } else if (sortState.sortField === 'outflow') {
        compareA = parseFloat(a.currentOutflow)
        compareB = parseFloat(b.currentOutflow)
      } else if (['holdingCost', 'assetValue'].includes(sortState.sortField)) {
        compareA = parseFloat(compareA)
        compareB = parseFloat(compareB)
      }
      
      if (sortState.sortOrder === 'ascend') {
        return compareA > compareB ? 1 : -1
      }
      return compareA < compareB ? 1 : -1
    })
  }
  
  return result
})

// 模擬數據
const tokenData = [
  {
    key: '1',
    coin: 'USDT',
    currentBalance: '10000.00000000',
    availableBalance: '9800.00000000',
    holdingCost: '1.00000000',
    assetValue: '10000.00000000',
    currentInflow: '0.00000000',
    availableInflow: '14800.00000000',
    currentOutflow: '0.00000000',
    availableOutflow: '4800.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: true,
    storageLimit: '8000.00000000'
  },
  {
    key: '2',
    coin: 'USDC',
    currentBalance: '8000.00000000',
    availableBalance: '7800.00000000',
    holdingCost: '1.00000000',
    assetValue: '8000.00000000',
    currentInflow: '1500.00000000',
    availableInflow: '9800.00000000',
    currentOutflow: '2000.00000000',
    availableOutflow: '1800.00000000',
    lastTransactionTime: '2024-03-15 13:45:12',
    isExceeded: false,
    storageLimit: '10000.00000000'
  },
  {
    key: '3',
    coin: 'BUSD',
    currentBalance: '15000.00000000',
    availableBalance: '14500.00000000',
    holdingCost: '1.00000000',
    assetValue: '15000.00000000',
    currentInflow: '0.00000000',
    availableInflow: '19500.00000000',
    currentOutflow: '0.00000000',
    availableOutflow: '4500.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: true,
    storageLimit: '12000.00000000'
  },
  {
    key: '4',
    coin: 'BNB',
    currentBalance: '50.00000000',
    availableBalance: '48.50000000',
    holdingCost: '220.00000000',
    assetValue: '11000.00000000',
    currentInflow: '25.00000000',
    availableInflow: '73.50000000',
    currentOutflow: '25.00000000',
    availableOutflow: '23.50000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: false,
    storageLimit: '100.00000000'
  },
  {
    key: '5',
    coin: 'CAKE',
    currentBalance: '1000.00000000',
    availableBalance: '950.00000000',
    holdingCost: '2.50000000',
    assetValue: '2500.00000000',
    currentInflow: '1500.00000000',
    availableInflow: '1450.00000000',
    currentOutflow: '500.00000000',
    availableOutflow: '450.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: true,
    storageLimit: '800.00000000'
  },
  {
    key: '6',
    coin: 'DAI',
    currentBalance: '5000.00000000',
    availableBalance: '4800.00000000',
    holdingCost: '1.00000000',
    assetValue: '5000.00000000',
    currentInflow: '7000.00000000',
    availableInflow: '6800.00000000',
    currentOutflow: '2000.00000000',
    availableOutflow: '1800.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: false,
    storageLimit: '6000.00000000'
  },
  {
    key: '7',
    coin: 'LINK',
    currentBalance: '200.00000000',
    availableBalance: '190.00000000',
    holdingCost: '15.00000000',
    assetValue: '3000.00000000',
    currentInflow: '300.00000000',
    availableInflow: '290.00000000',
    currentOutflow: '100.00000000',
    availableOutflow: '90.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: true,
    storageLimit: '150.00000000'
  },
  {
    key: '8',
    coin: 'UNI',
    currentBalance: '300.00000000',
    availableBalance: '285.00000000',
    holdingCost: '8.00000000',
    assetValue: '2400.00000000',
    currentInflow: '400.00000000',
    availableInflow: '385.00000000',
    currentOutflow: '100.00000000',
    availableOutflow: '85.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: false,
    storageLimit: '500.00000000'
  },
  {
    key: '9',
    coin: 'AAVE',
    currentBalance: '50.00000000',
    availableBalance: '47.50000000',
    holdingCost: '80.00000000',
    assetValue: '4000.00000000',
    currentInflow: '75.00000000',
    availableInflow: '72.50000000',
    currentOutflow: '25.00000000',
    availableOutflow: '22.50000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: true,
    storageLimit: '40.00000000'
  },
  {
    key: '10',
    coin: 'DOGE',
    currentBalance: '50000.00000000',
    availableBalance: '48000.00000000',
    holdingCost: '0.10000000',
    assetValue: '5000.00000000',
    currentInflow: '70000.00000000',
    availableInflow: '68000.00000000',
    currentOutflow: '20000.00000000',
    availableOutflow: '18000.00000000',
    lastTransactionTime: '2024-03-15 14:30:25',
    isExceeded: false,
    storageLimit: '100000.00000000'
  },
]

// 處理轉帳記錄按鈕點擊
function showTransferHistory(record) {
  console.log('查看轉帳記錄:', record)
  // 這裡可以根據 record 的幣種來過濾或獲取對應的轉帳記錄
  transferHistoryModalVisible.value = true
}

// 處理交易明細按鈕點擊
const showTransactionDetail = (record) => {
  console.log('查看交易明細:', record)
  // 這裡添加查看交易明細的具體邏輯
  // 可以跳轉到新頁面或打開新的 Modal
}

// 頁面加載時從路由獲取參數
onMounted(() => {
  const { address, chainType } = route.query
  if (address) queryParams.address = address
  if (chainType) queryParams.chainType = chainType
  
  // 這裡可以添加獲取錢包詳情的API調用
  handleQuery()
})

// 變更類型相關
const changeTypeModalVisible = ref(false)
const changeTypeForm = reactive({
  type: '',
  reason: ''
})

const handleChangeType = () => {
  changeTypeForm.type = walletInfo.walletType
  changeTypeForm.reason = ''
  changeTypeModalVisible.value = true
}

const confirmChangeType = () => {
  if (!changeTypeForm.type || !changeTypeForm.reason.trim()) {
    message.error(t('pleaseInputAllRequired'))
    return
  }
  
  // 這裡添加變更錢包類型的邏輯
  message.success(t('changeSuccess'))
  changeTypeModalVisible.value = false
}

// 變更記錄相關
const typeHistoryModalVisible = ref(false)
const typeHistoryColumns = [
  {
    title: t('wallet.changeTime'),
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: t('wallet.oldType'),
    dataIndex: 'beforeType',
    key: 'beforeType',
    width: 150
  },
  {
    title: t('wallet.newType'),
    dataIndex: 'afterType',
    key: 'afterType',
    width: 150
  },
  {
    title: t('wallet.changeReason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 300
  },
  {
    title: t('wallet.operator'),
    dataIndex: 'operator',
    key: 'operator',
    width: 120
  }
]

const typeHistoryData = [
  {
    key: '1',
    operator: 'Admin',
    reason: '業務需求調整',
    beforeType: t('wallet.type.user'),
    afterType: t('wallet.type.collection'),
    time: '2024-03-15 10:30:25'
  },
  {
    key: '2',
    operator: 'Manager',
    reason: '系統重組',
    beforeType: t('wallet.type.collection'),
    afterType: t('wallet.type.withdrawal'),
    time: '2024-03-14 15:45:30'
  }
]

const showTypeHistory = () => {
  console.log('查看類型變更記錄')
  typeHistoryModalVisible.value = true
}

// 轉帳記錄相關
const transferHistoryModalVisible = ref(false)
const transferHistoryColumns = [
  {
    title: t('transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    width: 150,
  },
  {
    title: t('fromWallet'),
    dataIndex: 'fromWallet',
    key: 'fromWallet',
    width: 150,
  },
  {
    title: t('toWallet'),
    dataIndex: 'toWallet',
    key: 'toWallet',
    width: 150,
  },
  {
    title: t('amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    align: 'right',
  },
  {
    title: t('price'),
    dataIndex: 'price',
    key: 'price',
    width: 120,
    align: 'right',
  },
  {
    title: t('cost'),
    dataIndex: 'cost',
    key: 'cost',
    width: 120,
    align: 'right',
  },
  {
    title: t('status'),
    dataIndex: 'status',
    key: 'status',
    width: 150,
    customRender: ({ text, record }) => {
      const statusMap = {
        submitted: t('statusSubmitted'),
        onChain: t('statusOnChain'),
        confirming: t('statusConfirming'),
        completed: t('statusCompleted'),
        failed: t('statusFailed')
      }

      const statusStyles = {
        submitted: { background: '#303030' },  // 灰底
        onChain: { background: 'rgba(24, 144, 255, 0.2)' },  // 藍底
        confirming: { background: 'rgba(24, 144, 255, 0.2)' },  // 藍底
        completed: { background: 'rgba(82, 196, 26, 0.2)' },  // 綠底
        failed: { background: 'rgba(255, 77, 79, 0.2)' }  // 紅底
      }
      
      let statusText = statusMap[text] || text
      if (text === 'confirming') {
        statusText = `${t('statusConfirming')} (${record.confirmations}/${record.requiredConfirmations})`
      } else if (text === 'completed') {
        statusText = `${t('statusCompleted')} (${record.requiredConfirmations}/${record.requiredConfirmations})`
      }
      
      return h('span', {
        style: {
          padding: '4px 8px',
          borderRadius: '4px',
          ...statusStyles[text]
        }
      }, statusText)
    }
  },
  {
    title: t('createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: t('submitTime'),
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 180,
  },
  {
    title: t('onChainTime'),
    dataIndex: 'onChainTime',
    key: 'onChainTime',
    width: 180,
  },
  {
    title: t('completeTime'),
    dataIndex: 'completeTime',
    key: 'completeTime',
    width: 180,
  },
  {
    title: t('updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180,
  },
  {
    title: t('remark'),
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
  }
]

const transferHistoryData = [
  {
    key: '1',
    transferId: 'T202403150001',
    fromWallet: 'W123456789',
    toWallet: 'W987654321',
    amount: '1000.00000000',
    price: '1.0000',
    cost: '1000.00',
    status: 'completed',
    confirmations: 12,
    requiredConfirmations: 12,
    createTime: '2024-03-15 10:00:00',
    submitTime: '2024-03-15 10:00:05',
    onChainTime: '2024-03-15 10:01:30',
    completeTime: '2024-03-15 10:05:00',
    updateTime: '2024-03-15 10:05:00',
    remark: '正常轉帳'
  },
  {
    key: '2',
    transferId: 'T202403150002',
    fromWallet: 'W234567890',
    toWallet: 'W876543210',
    amount: '500.00000000',
    price: '1.0000',
    cost: '500.00',
    status: 'confirming',
    confirmations: 6,
    requiredConfirmations: 12,
    createTime: '2024-03-15 10:30:00',
    submitTime: '2024-03-15 10:30:15',
    onChainTime: '2024-03-15 10:31:00',
    completeTime: null,
    updateTime: '2024-03-15 10:35:00',
    remark: '等待確認中'
  },
  {
    key: '3',
    transferId: 'T202403150003',
    fromWallet: 'W345678901',
    toWallet: 'W765432109',
    amount: '2000.00000000',
    price: '1.0000',
    cost: '2000.00',
    status: 'failed',
    confirmations: 0,
    requiredConfirmations: 12,
    createTime: '2024-03-15 11:00:00',
    submitTime: '2024-03-15 11:00:15',
    onChainTime: null,
    completeTime: null,
    updateTime: '2024-03-15 11:05:00',
    remark: '餘額不足'
  },
  {
    key: '4',
    transferId: 'T202403150004',
    fromWallet: 'W456789012',
    toWallet: 'W654321098',
    amount: '300.00000000',
    price: '1.0000',
    cost: '300.00',
    status: 'onChain',
    confirmations: 0,
    requiredConfirmations: 12,
    createTime: '2024-03-15 11:30:00',
    submitTime: '2024-03-15 11:30:20',
    onChainTime: '2024-03-15 11:31:00',
    completeTime: null,
    updateTime: '2024-03-15 11:31:00',
    remark: '等待上鏈'
  },
  {
    key: '5',
    transferId: 'T202403150005',
    fromWallet: 'W567890123',
    toWallet: 'W543210987',
    amount: '1500.00000000',
    price: '1.0000',
    cost: '1500.00',
    status: 'submitted',
    confirmations: 0,
    requiredConfirmations: 12,
    createTime: '2024-03-15 12:00:00',
    submitTime: '2024-03-15 12:00:30',
    onChainTime: null,
    completeTime: null,
    updateTime: '2024-03-15 12:00:30',
    remark: '已提交'
  },
  {
    key: '6',
    transferId: 'T202403150006',
    fromWallet: 'W678901234',
    toWallet: 'W432109876',
    amount: '800.00000000',
    price: '1.0000',
    cost: '800.00',
    status: 'confirming',
    confirmations: 3,
    requiredConfirmations: 12,
    createTime: '2024-03-15 12:30:00',
    submitTime: '2024-03-15 12:30:15',
    onChainTime: '2024-03-15 12:31:00',
    completeTime: null,
    updateTime: '2024-03-15 12:35:00',
    remark: '確認中(3/12)'
  },
  {
    key: '7',
    transferId: 'T202403150007',
    fromWallet: 'W789012345',
    toWallet: 'W321098765',
    amount: '1200.00000000',
    price: '1.0000',
    cost: '1200.00',
    status: 'completed',
    confirmations: 12,
    requiredConfirmations: 12,
    createTime: '2024-03-15 13:00:00',
    submitTime: '2024-03-15 13:00:20',
    onChainTime: '2024-03-15 13:01:30',
    completeTime: '2024-03-15 13:05:00',
    updateTime: '2024-03-15 13:05:00',
    remark: '轉帳完成'
  },
  {
    key: '8',
    transferId: 'T202403150008',
    fromWallet: 'W890123456',
    toWallet: 'W210987654',
    amount: '3000.00000000',
    price: '1.0000',
    cost: '3000.00',
    status: 'failed',
    confirmations: 0,
    requiredConfirmations: 12,
    createTime: '2024-03-15 13:30:00',
    submitTime: '2024-03-15 13:30:25',
    onChainTime: null,
    completeTime: null,
    updateTime: '2024-03-15 13:35:00',
    remark: '手續費不足'
  },
  {
    key: '9',
    transferId: 'T202403150009',
    fromWallet: 'W901234567',
    toWallet: 'W109876543',
    amount: '600.00000000',
    price: '1.0000',
    cost: '600.00',
    status: 'onChain',
    confirmations: 0,
    requiredConfirmations: 12,
    createTime: '2024-03-15 14:00:00',
    submitTime: '2024-03-15 14:00:30',
    onChainTime: '2024-03-15 14:01:00',
    completeTime: null,
    updateTime: '2024-03-15 14:01:00',
    remark: '已上鏈'
  },
  {
    key: '10',
    transferId: 'T202403150010',
    fromWallet: 'W012345678',
    toWallet: 'W098765432',
    amount: '2500.00000000',
    price: '1.0000',
    cost: '2500.00',
    status: 'confirming',
    confirmations: 9,
    requiredConfirmations: 12,
    createTime: '2024-03-15 14:30:00',
    submitTime: '2024-03-15 14:30:15',
    onChainTime: '2024-03-15 14:31:00',
    completeTime: null,
    updateTime: '2024-03-15 14:35:00',
    remark: '確認中(9/12)'
  }
]

// 添加清理函數
onBeforeUnmount(() => {
  // 清理所有的 ref 和 reactive 狀態
  downloadModalVisible.value = false
  historyModalVisible.value = false
  changeTypeModalVisible.value = false
  typeHistoryModalVisible.value = false
  transferHistoryModalVisible.value = false
  searchText.value = ''
  
  // 重置表單數據
  downloadForm.reason = ''
  changeTypeForm.type = ''
  changeTypeForm.reason = ''
  
  // 重置查詢參數
  queryParams.address = ''
  queryParams.chainType = undefined
  
  // 重置排序狀態
  sortState.sortField = ''
  sortState.sortOrder = null
})

// 添加變更狀態相關方法
const changeStatusModalVisible = ref(false)
const changeStatusForm = reactive({
  status: 'enabled',
  reason: ''
})

const handleChangeStatus = () => {
  changeStatusForm.status = walletInfo.isDisabled ? 'enabled' : 'disabled'
  changeStatusForm.reason = ''
  changeStatusModalVisible.value = true
}

const showStatusHistory = () => {
  statusHistoryModalVisible.value = true
}

const confirmChangeStatus = () => {
  if (!changeStatusForm.reason.trim()) {
    message.error(t('pleaseInputReason'))
    return
  }
  
  // 這裡添加變更狀態的邏輯
  walletInfo.isDisabled = changeStatusForm.status === 'disabled'
  message.success(t('changeSuccess'))
  changeStatusModalVisible.value = false
}

// 添加狀態變更記錄的 Modal
const statusHistoryModalVisible = ref(false)
const statusHistoryColumns = [
  {
    title: t('wallet.changeTime'),
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: t('wallet.oldStatus'),
    dataIndex: 'beforeStatus',
    key: 'beforeStatus',
    width: 150
  },
  {
    title: t('wallet.newStatus'),
    dataIndex: 'afterStatus',
    key: 'afterStatus',
    width: 150
  },
  {
    title: t('wallet.changeReason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 300
  },
  {
    title: t('wallet.operator'),
    dataIndex: 'operator',
    key: 'operator',
    width: 120
  }
]

const statusHistoryData = [
  {
    key: '1',
    operator: 'Admin',
    reason: '風控要求',
    beforeStatus: t('wallet.status.enabled'),
    afterStatus: t('wallet.status.disabled'),
    time: '2024-03-15 10:30:25'
  },
  {
    key: '2',
    operator: 'Manager',
    reason: '解除風控',
    beforeStatus: t('wallet.status.disabled'),
    afterStatus: t('wallet.status.enabled'),
    time: '2024-03-14 15:45:30'
  }
]
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
  text-align: right;  /* 添加右對齊 */
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

/* 添加超出限制的樣式 */
.exceeded-balance {
  background-color: rgba(255, 77, 79, 0.2);  /* 紅色背景，帶透明度 */
  border-radius: 4px;
  padding: 8px;
  text-align: right;  /* 添加右對齊 */
}

/* 調整 tooltip 樣式 */
:deep(.ant-tooltip-inner) {
  background-color: #1f1f1f;
  border: 1px solid #303030;
}

:deep(.ant-tooltip-arrow-content::before) {
  background-color: #1f1f1f;
}

/* 添加當前轉入量的高亮樣式 */
.active-inflow {
  background-color: rgba(82, 196, 26, 0.2);  /* 綠色背景，帶透明度 */
  border-radius: 4px;
  padding: 8px;
}

/* 添加當前轉出量的高亮樣式 */
.active-outflow {
  background-color: rgba(250, 173, 20, 0.2);  /* 橘色背景，帶透明度 */
  border-radius: 4px;
  padding: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 搜索框深色模式樣式 */
:deep(.ant-input-search .ant-input) {
  background-color: #1f1f1f;
  border-color: #434343;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-input-search .ant-input:hover),
:deep(.ant-input-search .ant-input:focus) {
  border-color: #177ddc;
}

:deep(.ant-input-search .ant-input-search-button) {
  background-color: #177ddc;
  border-color: #177ddc;
}

/* 排序圖標樣式 */
:deep(.ant-table-column-sorter) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-table-column-sorter-up.active),
:deep(.ant-table-column-sorter-down.active) {
  color: #177ddc;
}

.wallet-type-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 修改表格標題的多語系顯示 */
:deep(.ant-table-column-title) {
  display: inline-block;
  text-align: right;
  width: 100%;
}

/* 操作列標題保持左對齊 */
:deep(.ant-table-column-action .ant-table-column-title) {
  text-align: left;
}

/* 幣種列標題保持左對齊 */
:deep(.ant-table-column-coin .ant-table-column-title) {
  text-align: left;
}

/* 添加轉帳記錄表格的樣式 */
:deep(.ant-table-thead > tr > th) {
  white-space: nowrap;
}

.wallet-status-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-enabled {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}
</style>