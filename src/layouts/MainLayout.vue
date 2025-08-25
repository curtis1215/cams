<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="logo-section">
        <div class="logo">CAMS<VersionDisplay /></div>
        <a-switch
          v-model:checked="isDemoMode"
          class="mode-switch"
          @change="handleModeChange"
          :checkedChildren="t('common.demoMode')"
          :unCheckedChildren="t('common.prdMode')"
        />
      </div>
      <div class="header-right">
        <a-switch
          :checked="isDark"
          @change="toggleDark"
          :checkedChildren="t('common.darkMode')"
          :unCheckedChildren="t('common.lightMode')"
        />
        <a-select
          v-model:value="currentLocale"
          style="width: 120px; margin: 0 16px"
          @change="changeLocale"
        >
          <a-select-option value="zh">中文</a-select-option>
          <a-select-option value="en">English</a-select-option>
        </a-select>
        <a-dropdown>
          <a class="user-dropdown" @click.prevent>
            <UserOutlined />
            <span style="margin-left: 8px">{{ username }}</span>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="handleLogout">
                <LogoutOutlined />
                <span>{{ t('user.logout') }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider v-if="showSider" width="200">
        <a-menu
          mode="inline"
          theme="dark"
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu key="monitor">
            <template #title>
              <span>
                <FundOutlined />
                {{ t('nav.monitoring') }}
              </span>
            </template>
            <a-menu-item key="dashboard" @click="router.push('/monitor/dashboard')">
              <DashboardOutlined />
              {{ t('nav.dataMonitoring') }}
            </a-menu-item>
            <a-menu-item key="alert" @click="router.push('/monitor/alert')">
              <AlertOutlined />
              {{ t('nav.alertMonitoring') }}
            </a-menu-item>
            <a-menu-item key="nodeHeight" @click="router.push('/monitor/node-height')">
              <NodeIndexOutlined />
              {{ t('nav.nodeHeightMonitoring') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="wallet">
            <template #title>
              <span>
                <WalletOutlined />
                {{ t('nav.walletManagement') }}
              </span>
            </template>
            <a-menu-item key="walletQuery" @click="router.push('/wallet/query')">
              <SearchOutlined />
              {{ t('nav.walletQuery') }}
            </a-menu-item>
            <a-menu-item key="walletTransfer" @click="router.push('/wallet/transfer')">
              <SwapOutlined />
              {{ t('nav.walletTransfer') }}
            </a-menu-item>
            <a-menu-item key="tokenExchange" @click="router.push('/wallet/token-exchange')">
              <SyncOutlined />
              {{ t('nav.tokenExchangeManagement') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="order">
            <template #title>
              <span>
                <OrderedListOutlined />
                {{ t('nav.orderManagement') }}
              </span>
            </template>
            <a-menu-item key="depositOrder" @click="router.push('/order/deposit')">
              <PayCircleOutlined />
              {{ t('nav.depositOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="withdrawOrder" @click="router.push('/order/withdraw')">
              <BankOutlined />
              {{ t('nav.withdrawOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="transferOrder" @click="router.push('/order/transfer')">
              <SwapOutlined />
              {{ t('nav.transferOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="exchangeOrder" @click="router.push('/order/exchange')">
              <SyncOutlined />
              {{ t('nav.exchangeOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="transactionDetail" @click="router.push('/order/transaction')">
              <TransactionOutlined />
              {{ t('nav.transactionDetailQuery') }}
            </a-menu-item>
            <a-menu-item key="swapOrder" @click="router.push('/order/swap')">
              <SwapOutlined />
              {{ t('nav.swapOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="lpOrder" @click="router.push('/order/lp')">
              <SwapOutlined />
              {{ t('nav.lpOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="manualOrder" @click="router.push('/order/manual')">
              <SearchOutlined />
              {{ t('nav.manualOrderQuery') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="reconciliation">
            <template #title>
              <span>
                <AccountBookOutlined />
                {{ t('nav.reconciliation') }}
              </span>
            </template>
            <a-menu-item key="walletBalance" @click="router.push('/reconciliation/wallet-balance')">
              <WalletFilled />
              {{ t('nav.walletBalanceQuery') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="report">
            <template #title>
              <span>
                <BarChartOutlined />
                {{ t('nav.dataReport') }}
              </span>
            </template>
            <a-menu-item key="depositWithdrawDuration" @click="router.push('/report/deposit-withdraw-duration')">
              <ClockCircleOutlined />
              {{ t('nav.depositWithdrawDurationReport') }}
            </a-menu-item>
            <a-menu-item key="walletProfitLoss" @click="router.push('/report/wallet-profit-loss')">
              <LineChartOutlined />
              {{ t('nav.walletProfitLossQuery') }}
            </a-menu-item>
            <a-menu-item key="nodeHeightAnalysis" @click="router.push('/report/node-height-analysis')">
              <BarChartOutlined />
              {{ t('nav.nodeHeightAnalysis') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="params">
            <template #title>
              <span>
                <ToolOutlined />
                {{ t('nav.paramsManagement') }}
              </span>
            </template>
            <a-menu-item key="blockchain" @click="router.push('/params/blockchain')">
              <BlockOutlined />
              {{ t('nav.blockchainManagement') }}
            </a-menu-item>
            <a-menu-item key="contractCoin" @click="router.push('/params/contract-coin')">
              <CodeOutlined />
              {{ t('nav.contractCoinManagement') }}
            </a-menu-item>
            <a-menu-item key="exchangePair" @click="router.push('/params/exchange-pair')">
              <SwapOutlined />
              {{ t('nav.exchangePairManagement') }}
            </a-menu-item>
            <a-menu-item key="riskAddress" @click="router.push('/params/risk-address')">
              <WarningOutlined />
              {{ t('nav.riskAddressManagement') }}
            </a-menu-item>
            <a-menu-item key="bankcode" @click="router.push('/params/bankcode')">
              <CodeOutlined />
              {{ t('nav.bankcodeManagement') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system">
            <template #title>
              <span>
                <SettingOutlined />
                {{ t('nav.system') }}
              </span>
            </template>
            <a-menu-item key="users" @click="router.push('/system/users')">
              <UserOutlined />
              {{ t('nav.userManagement') }}
            </a-menu-item>
            <a-menu-item key="roles" @click="router.push('/system/roles')">
              <TeamOutlined />
              {{ t('nav.roleManagement') }}
            </a-menu-item>
            <a-menu-item key="merchants" @click="router.push('/system/merchants')">
              <ShopOutlined />
              {{ t('nav.merchantManagement') }}
            </a-menu-item>
            <a-menu-item key="systemParams" @click="router.push('/system/params')">
              <SettingOutlined />
              {{ t('nav.systemParams') }}
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout-content :style="contentStyle">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark, useToggle } from '@vueuse/core'
import VersionDisplay from '../components/VersionDisplay.vue'
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AlertOutlined,
  FundOutlined,
  WalletOutlined,
  SearchOutlined,
  SwapOutlined,
  OrderedListOutlined,
  TransactionOutlined,
  BankOutlined,
  PayCircleOutlined,
  ToolOutlined,
  BlockOutlined,
  CodeOutlined,
  SyncOutlined,
  AccountBookOutlined,
  WalletFilled,
  ShopOutlined,
  TeamOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  WarningOutlined
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import storage from '../services/storage'

type PathMap = {
  [key: string]: string;
}

const pathMap: PathMap = {
  '/monitor/dashboard': 'dashboard',
  '/monitor/alert': 'alert',
  '/monitor/node-height': 'nodeHeight',
  '/wallet/query': 'walletQuery',
  '/wallet/transfer': 'walletTransfer',
  '/wallet/token-exchange': 'tokenExchange',
  '/system/users': 'users',
  '/system/roles': 'roles',
  '/system/merchants': 'merchants',
  '/system/params': 'systemParams',
  '/order/deposit': 'depositOrder',
  '/order/withdraw': 'withdrawOrder',
  '/order/transfer': 'transferOrder',
  '/order/exchange': 'exchangeOrder',
  '/order/transaction': 'transactionDetail',
  '/order/swap': 'swapOrder',
  '/order/lp': 'lpOrder',
  '/order/manual': 'manualOrder',
  '/params/blockchain': 'blockchain',
  '/params/contract-coin': 'contractCoin',
  '/params/exchange-pair': 'exchangePair',
  '/params/risk-address': 'riskAddress',
  '/params/bankcode': 'bankcode',
  '/reconciliation/wallet-balance': 'walletBalance',
  '/report/deposit-withdraw-duration': 'depositWithdrawDuration',
  '/report/wallet-profit-loss': 'walletProfitLoss',
  '/report/node-height-analysis': 'nodeHeightAnalysis'
}

const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const currentLocale = ref(locale.value)
const username = ref('')
const selectedKeys = ref(['dashboard'])
const openKeys = ref(['monitor'])
const isDemoMode = ref(route.path !== '/prd-doc')

const showSider = computed(() => route.path !== '/prd-doc')

const contentStyle = computed(() => ({
  padding: '24px',
  marginLeft: showSider.value ? '200px' : '0',
  marginTop: '64px',
  overflowY: 'auto'
}))

const setSelectedKeysByRoute = () => {
  const path = route.path

  // 根據路徑設置 openKeys
  if (path.startsWith('/monitor')) {
    openKeys.value = ['monitor']
  } else if (path.startsWith('/wallet')) {
    openKeys.value = ['wallet']
  } else if (path.startsWith('/system')) {
    openKeys.value = ['system']
  } else if (path.startsWith('/order')) {
    openKeys.value = ['order']
  } else if (path.startsWith('/params')) {
    openKeys.value = ['params']
  } else if (path.startsWith('/reconciliation')) {
    openKeys.value = ['reconciliation']
  } else if (path.startsWith('/report')) {
    openKeys.value = ['report']
  }

  selectedKeys.value = [pathMap[path] || 'dashboard']
}

onMounted(() => {
  getUserInfo()
  setSelectedKeysByRoute()
})

watch(() => route.path, () => {
  setSelectedKeysByRoute()
  isDemoMode.value = route.path !== '/prd-doc'
})

const getUserInfo = () => {
  const user = storage.get('user')
  if (!user || !user.token) {
    router.push('/login')
    return
  }
  username.value = user.username
}

const handleLogout = () => {
  storage.remove('user')
  router.push('/login')
}

const changeLocale = (value: string) => {
  locale.value = value
}

const localeOptions = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en-US', label: 'English' }
]

// 定義映射的類型
type MenuAnchorMap = {
  [key: string]: string;
}

// 使用計算屬性動態生成錨點映射
const menuToAnchorMap = computed<MenuAnchorMap>(() => ({
  dashboard: t('nav.dataMonitoring'),
  alert: t('nav.alertMonitoring'),
  nodeHeight: t('nav.nodeHeightMonitoring'),
  walletQuery: t('nav.walletQuery'),
  walletTransfer: t('nav.walletTransfer'),
  tokenExchange: t('nav.tokenExchangeManagement'),
  depositOrder: t('nav.depositOrderQuery'),
  withdrawOrder: t('nav.withdrawOrderQuery'),
  transferOrder: t('nav.transferOrderQuery'),
  exchangeOrder: t('nav.exchangeOrderQuery'),
  transactionDetail: t('nav.transactionDetailQuery'),
  swapOrder: t('nav.swapOrderQuery'),
  lpOrder: t('nav.lpOrderQuery'),
  manualOrder: t('nav.manualOrderQuery'),
  walletBalance: t('nav.walletBalanceQuery'),
  depositWithdrawDuration: t('nav.depositWithdrawDurationReport'),
  walletProfitLoss: t('nav.walletProfitLossQuery'),
  nodeHeightAnalysis: t('nav.nodeHeightAnalysis'),
  blockchain: t('nav.blockchainManagement'),
  contractCoin: t('nav.contractCoinManagement'),
  exchangePair: t('nav.exchangePairManagement'),
  riskAddress: t('nav.riskAddressManagement'),
  bankcode: t('nav.bankcodeManagement'),
  users: t('nav.userManagement'),
  roles: t('nav.roleManagement'),
  merchants: t('nav.merchantManagement'),
  systemParams: t('nav.systemParams')
}))

// 添加一個變量來記錄上一個路徑
const lastDemoPath = ref('/monitor/dashboard')

const handleModeChange = (checked: boolean) => {
  if (checked) {
    // 從 PRD 文檔切回 Demo 頁面時，使用記錄的路徑
    router.push(lastDemoPath.value)
  } else {
    // 記錄當前路徑，以便切回時使用
    lastDemoPath.value = route.path
    
    // 獲取當前選中的選單項目
    const currentKey = selectedKeys.value[0]
    const anchor = menuToAnchorMap.value[currentKey]
    if (anchor) {
      // 將中文轉換為 URL 安全的格式
      const encodedAnchor = anchor.split('').join('-')
      router.push(`/prd-doc#${encodedAnchor}`).then(() => {
        // 給予足夠的時間讓 DOM 完全加載
        setTimeout(() => {
          const element = document.getElementById(encodedAnchor)
          if (element) {
            // 使用更可靠的滾動方法
            const yOffset = -100 // 頂部導航欄的高度
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
            window.scrollTo({ top: y, behavior: 'smooth' })
          }
        }, 500) // 等待 500ms 確保內容已加載
      })
    } else {
      router.push('/prd-doc')
    }
  }
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-dropdown:hover {
  color: #1890ff;
}

:deep(.ant-layout-sider) {
  position: fixed;
  left: 0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  z-index: 999;
  top: 64px;
}

:deep(.ant-layout-content) {
  margin-top: 64px;
  overflow-y: auto;
}

.mode-switch {
  margin-left: 16px;
}
</style>