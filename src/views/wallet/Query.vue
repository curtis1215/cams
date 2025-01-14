<template>
  <div class="wallet-query">
    <a-card :bordered="false" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <span class="card-title">{{ $t('walletQuery') }}</span>
      </template>
      <div class="table-container">
        <!-- 篩選器表單 -->
        <a-form
          layout="inline"
          :model="queryParams"
          class="query-form"
        >
          <a-form-item :label="$t('merchant')">
            <a-select
              v-model:value="queryParams.merchant"
              style="width: 200px"
              :placeholder="$t('pleaseSelectMerchant')"
              allow-clear
            >
              <a-select-option v-for="merchant in merchants" :key="merchant.value" :value="merchant.value">
                {{ merchant.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('userId')">
            <a-input
              v-model:value="queryParams.userId"
              :placeholder="$t('pleaseInputUserId')"
              style="width: 200px"
              allow-clear
            />
          </a-form-item>

          <a-form-item :label="$t('walletType')">
            <a-select
              v-model:value="queryParams.walletType"
              style="width: 200px"
              :placeholder="$t('pleaseSelectWalletType')"
              allow-clear
            >
              <a-select-option v-for="type in walletTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </a-select-option>
            </a-select>
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

          <a-form-item :label="$t('address')">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="$t('pleaseInputAddress')"
              style="width: 400px"
              allow-clear
            />
          </a-form-item>

          <a-form-item style="margin-right: auto;">
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

        <!-- 添加表格 -->
        <div class="table-container">
          <a-table
            :columns="columns"
            :data-source="tableData"
            :pagination="{
              total: 100,
              pageSize: 20,
              showSizeChanger: false,
              showQuickJumper: true
            }"
            :bordered="true"
          >
            <!-- 資產價值列自定義渲染 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'assetValue'">
                <span class="asset-value" v-html="formatNumberWithColor(record.assetValue)"></span>
              </template>
              <!-- 操作列自定義渲染 -->
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="handleDetail(record)">
                    {{ $t('details') }}
                  </a-button>
                  <a-button type="link" size="small" @click="handleTransfer(record)">
                    {{ $t('transfer') }}
                  </a-button>
                  <a-button
                    type="link"
                    size="small"
                    :danger="!record.isDisabled"
                    @click="handleToggleStatus(record)"
                  >
                    {{ record.isDisabled ? $t('enable') : $t('disable') }}
                  </a-button>
                </a-space>
              </template>
              <template v-else-if="column.key === 'address'">
                <span>
                  {{ formatAddress(record.address) }}
                  <CopyOutlined
                    class="copy-icon"
                    @click.stop="copyAddress(record.address)"
                  />
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()

// 查詢參數
const queryParams = reactive({
  merchant: 'all',
  userId: '',
  walletType: undefined,
  chainType: undefined,
  address: ''
})

// 商戶選項
const merchants = [
  { value: 'all', label: t('allMerchants') },
  { value: 'fameex', label: 'Fameex' },
  { value: 'cnx', label: 'CNX' }
]

// 錢包類型選項
const walletTypes = [
  { value: 'user', label: t('userWallet') },
  { value: 'collection', label: t('collectionWallet') },
  { value: 'withdrawal', label: t('withdrawalWallet') },
  { value: 'transfer', label: t('transferWallet') }
]

// 鏈類型選項
const chainTypes = [
  { value: 'evm', label: 'EVM' },
  { value: 'btc', label: 'BTC' },
  { value: 'tron', label: 'TRON' },
  { value: 'eos', label: 'EOS' }
]

// 查詢方法
const handleQuery = () => {
  console.log('查詢參數:', queryParams)
  // 這裡添加查詢邏輯
}

// 重置方法
const handleReset = () => {
  queryParams.merchant = 'all'
  queryParams.userId = ''
  queryParams.walletType = undefined
  queryParams.chainType = undefined
  queryParams.address = ''
}

// 表格列配置
const columns = [
  {
    title: t('walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 150
  },
  {
    title: t('merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 150
  },
  {
    title: t('userId'),
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
  },
  {
    title: t('walletType'),
    dataIndex: 'walletType',
    key: 'walletType',
    width: 120,
  },
  {
    title: t('chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('address'),
    dataIndex: 'address',
    key: 'address',
    width: 300,
    ellipsis: true,
  },
  {
    title: t('assetValue'),
    dataIndex: 'assetValue',
    key: 'assetValue',
    width: 240,
    align: 'right',
  },
  {
    title: t('lastTransactionTime'),
    dataIndex: 'lastTransactionTime',
    key: 'lastTransactionTime',
    width: 180,
  },
  {
    title: t('action'),
    key: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 模擬表格數據
const tableData = [
  {
    key: '1',
    walletId: 'U12345678',
    merchant: 'Fameex',
    userId: 'U123456',
    walletType: t('userWallet'),
    chain: 'ETH',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    assetValue: '1234567890123.45678900',
    lastTransactionTime: '2024-03-15 10:30:25',
    isDisabled: false,
  },
  {
    key: '2',
    walletId: 'M87654321',
    merchant: 'Fameex',
    userId: 'U234567',
    walletType: t('collectionWallet'),
    chain: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    assetValue: '123456789.12345678',
    lastTransactionTime: '2024-03-15 09:45:12',
    isDisabled: true,
  },
  {
    key: '3',
    walletId: 'P98765432',
    merchant: 'Fameex',
    userId: 'U345678',
    walletType: t('withdrawalWallet'),
    chain: 'TRON',
    address: 'TRX1234567890abcdef1234567890abcdef12345678',
    assetValue: '12345678.12345678',
    lastTransactionTime: '2024-03-15 11:20:33',
    isDisabled: false,
  },
  {
    key: '4',
    walletId: 'W45678901',
    merchant: 'Fameex',
    userId: 'U456789',
    walletType: t('transferWallet'),
    chain: 'EOS',
    address: 'eosio.token',
    assetValue: '1234567.12345678',
    lastTransactionTime: '2024-03-15 08:15:45',
    isDisabled: false,
  },
  {
    key: '5',
    walletId: 'U567890',
    merchant: 'Fameex',
    userId: 'U567890',
    walletType: t('userWallet'),
    chain: 'ETH',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    assetValue: '7531.24680000',
    lastTransactionTime: '2024-03-15 13:40:18',
    isDisabled: false,
  },
  {
    key: '6',
    walletId: 'M678901',
    merchant: 'CNX',
    userId: 'U678901',
    walletType: t('collectionWallet'),
    chain: 'BTC',
    address: 'bc1qabcdefghijklmnopqrstuvwxyz0123456789',
    assetValue: '8642.97531000',
    lastTransactionTime: '2024-03-15 14:55:27',
    isDisabled: false,
  },
  {
    key: '7',
    walletId: 'P789012',
    merchant: 'Fameex',
    userId: 'U789012',
    walletType: t('withdrawalWallet'),
    chain: 'TRON',
    address: 'TRXabcdef1234567890abcdef1234567890abcdef',
    assetValue: '1357.24680000',
    lastTransactionTime: '2024-03-15 15:10:42',
    isDisabled: true,
  },
  {
    key: '8',
    walletId: 'W890123',
    merchant: 'CNX',
    userId: 'U890123',
    walletType: t('transferWallet'),
    chain: 'EOS',
    address: 'cryptopool.x',
    assetValue: '9876.54321000',
    lastTransactionTime: '2024-03-15 16:25:33',
    isDisabled: false,
  },
  {
    key: '9',
    walletId: 'U901234',
    merchant: 'Fameex',
    userId: 'U901234',
    walletType: t('userWallet'),
    chain: 'ETH',
    address: '0x9876543210abcdef9876543210abcdef98765432',
    assetValue: '4567.89012000',
    lastTransactionTime: '2024-03-15 17:30:15',
    isDisabled: false,
  },
  {
    key: '10',
    walletId: 'M012345',
    merchant: 'CNX',
    userId: 'U012345',
    walletType: t('collectionWallet'),
    chain: 'BTC',
    address: 'bc1q9876543210abcdef9876543210abcdef987654',
    assetValue: '6789.01234000',
    lastTransactionTime: '2024-03-15 18:45:55',
    isDisabled: false,
  },
  {
    key: '11',
    walletId: 'P112233',
    merchant: 'Fameex',
    userId: 'U112233',
    walletType: t('withdrawalWallet'),
    chain: 'TRON',
    address: 'TRX9876543210abcdef9876543210abcdef987654',
    assetValue: '3456.78901000',
    lastTransactionTime: '2024-03-15 19:20:40',
    isDisabled: false,
  },
  {
    key: '12',
    walletId: 'W445566',
    merchant: 'CNX',
    userId: 'U445566',
    walletType: t('transferWallet'),
    chain: 'EOS',
    address: 'wallet.pool',
    assetValue: '8901.23456000',
    lastTransactionTime: '2024-03-15 20:35:22',
    isDisabled: true,
  },
  {
    key: '13',
    walletId: 'U778899',
    merchant: 'Fameex',
    userId: 'U778899',
    walletType: t('userWallet'),
    chain: 'ETH',
    address: '0x5544332211abcdef5544332211abcdef55443322',
    assetValue: '2345.67890000',
    lastTransactionTime: '2024-03-15 21:50:18',
    isDisabled: false,
  },
  {
    key: '14',
    walletId: 'M998877',
    merchant: 'CNX',
    userId: 'U998877',
    walletType: t('collectionWallet'),
    chain: 'BTC',
    address: 'bc1q5544332211abcdef5544332211abcdef554433',
    assetValue: '7890.12345000',
    lastTransactionTime: '2024-03-15 22:15:30',
    isDisabled: false,
  },
  {
    key: '15',
    walletId: 'P665544',
    merchant: 'Fameex',
    userId: 'U665544',
    walletType: t('withdrawalWallet'),
    chain: 'TRON',
    address: 'TRX5544332211abcdef5544332211abcdef554433',
    assetValue: '4321.09876000',
    lastTransactionTime: '2024-03-15 23:30:45',
    isDisabled: false,
  },
  {
    key: '16',
    walletId: 'W332211',
    merchant: 'CNX',
    userId: 'U332211',
    walletType: t('transferWallet'),
    chain: 'EOS',
    address: 'pool.crypto',
    assetValue: '9012.34567000',
    lastTransactionTime: '2024-03-16 00:45:20',
    isDisabled: true,
  },
  {
    key: '17',
    walletId: 'U114477',
    merchant: 'Fameex',
    userId: 'U114477',
    walletType: t('userWallet'),
    chain: 'ETH',
    address: '0x1122334455abcdef1122334455abcdef11223344',
    assetValue: '5678.90123000',
    lastTransactionTime: '2024-03-16 01:55:15',
    isDisabled: false,
  },
  {
    key: '18',
    walletId: 'M229988',
    merchant: 'CNX',
    userId: 'U229988',
    walletType: t('collectionWallet'),
    chain: 'BTC',
    address: 'bc1q1122334455abcdef1122334455abcdef112233',
    assetValue: '6789.01234000',
    lastTransactionTime: '2024-03-16 02:10:33',
    isDisabled: false,
  },
  {
    key: '19',
    walletId: 'P337755',
    merchant: 'Fameex',
    userId: 'U337755',
    walletType: t('withdrawalWallet'),
    chain: 'TRON',
    address: 'TRX1122334455abcdef1122334455abcdef112233',
    assetValue: '3456.78901000',
    lastTransactionTime: '2024-03-16 03:25:48',
    isDisabled: false,
  },
  {
    key: '20',
    walletId: 'W446688',
    merchant: 'CNX',
    userId: 'U446688',
    walletType: t('transferWallet'),
    chain: 'EOS',
    address: 'crypto.bank',
    assetValue: '8901.23456000',
    lastTransactionTime: '2024-03-16 04:40:55',
    isDisabled: true,
  }
]

// 格式化數字並添加顏色標記
const formatNumberWithColor = (value) => {
  const parts = Number(value).toFixed(8).split('.')
  const integerPart = parts[0]
  
  // 添加千分位並分段上色
  const segments = []
  let remaining = integerPart
  
  // 從後往前每三位分段
  while (remaining.length > 0) {
    const segment = remaining.slice(-3)
    segments.unshift(segment)
    remaining = remaining.slice(0, -3)
  }

  // 根據分段數量決定顏色
  const coloredSegments = segments.map((segment, index) => {
    const segmentCount = segments.length
    let colorClass = 'digit-4'
    
    if (segmentCount >= 4 && index === 0) {
      colorClass = 'digit-12'  // 第一段（最高位）使用紅色
    } else if (segmentCount >= 3 && index <= segmentCount - 3) {
      colorClass = 'digit-8'   // 中間段使用橙色
    }
    
    return `<span class="${colorClass}">${segment}</span>`
  })

  // 組合千分位分隔符
  const formattedInteger = coloredSegments.join('<span class="separator">,</span>')
  
  return formattedInteger + `<span class="decimal">.${parts[1]}</span>`
}

// 修改詳情按鈕處理方法
const handleDetail = (record) => {
  router.push({
    name: 'WalletDetail',
    query: {
      address: record.address,
      chainType: record.chain
    }
  })
}

const handleTransfer = (record) => {
  console.log('轉帳:', record)
  // 實現轉帳邏輯
}

const handleToggleStatus = (record) => {
  const action = record.isDisabled ? '啟用' : '禁用'
  message.success(`${action}成功`)
  // 實現禁用/啟用邏輯
}

// 格式化地址顯示
const formatAddress = (address) => {
  if (!address) return ''
  if (address.length <= 8) return address
  return `${address.slice(0, 4)}******${address.slice(-4)}`
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

// 添加錢包ID生成邏輯
const generateWalletId = (type) => {
  const randomNum = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  switch (type) {
    case 'userWallet':
      return `U${randomNum}`
    case 'collectionWallet':
      return `M${randomNum}`
    case 'withdrawalWallet':
      return `P${randomNum}`
    case 'transferWallet':
      return `W${randomNum}`
    default:
      return `U${randomNum}`
  }
}

// 生成更多模擬數據時使用
const generateMoreData = () => {
  return {
    // ... 其他欄位
    walletId: generateWalletId(walletType),  // 根據錢包類型生成對應ID
    // ... 其他欄位
  }
}
</script>

<style scoped>
.wallet-query {
  background-color: var(--bg-color);
  min-height: calc(100vh - 96px);
  padding: 24px;
}

.wallet-query :deep(.ant-card) {
  background: var(--component-bg);
}

.wallet-query :deep(.ant-card-head) {
  padding: 0;
  min-height: auto;
  border-bottom: none;
}

.wallet-query :deep(.ant-card-head-title) {
  padding: 0 0 16px 0;
}

.wallet-query :deep(.ant-card-body) {
  padding: 0;
}

.wallet-query .card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.wallet-query .search-form {
  margin-bottom: 16px;
  padding: 24px;
  background: var(--component-bg);
  border-radius: 8px;
}

.wallet-query :deep(.ant-table-wrapper) {
  background: var(--component-bg);
  border-radius: 8px;
  padding: 24px;
}

.query-form {
  margin-bottom: 24px;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

/* 表格內的按鈕樣式 */
:deep(.ant-btn-link) {
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}

/* 地址欄位的省略樣式 */
:deep(.ant-table-cell-ellipsis) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.copy-icon {
  margin-left: 8px;
  color: var(--ant-primary-color);
  cursor: pointer;
  transition: all 0.3s;
}

.copy-icon:hover {
  opacity: 0.8;
}

/* 資產價值的顏色樣式 */
.asset-value {
  font-family: monospace;
  white-space: nowrap;
  font-size: 14px;
}

:deep(.digit-12) {
  color: #f5222d; /* 紅色：十億以上 */
}

:deep(.digit-8) {
  color: #faad14; /* 橙色：百萬到億 */
}

:deep(.digit-4) {
  color: #52c41a; /* 綠色：個位到十萬 */
}

:deep(.decimal) {
  color: #8c8c8c; /* 灰色：小數部分 */
}

:deep(.separator) {
  color: #8c8c8c; /* 灰色：分隔符 */
  margin: 0 1px;  /* 添加些微間距 */
}

.wallet-id {
  font-family: monospace;
  font-size: 14px;
}
</style> 