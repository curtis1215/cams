<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="logo">CAMS</div>
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
      <a-layout-sider width="200">
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
            <a-menu-item key="walletDetail" @click="router.push('/wallet/detail')">
              <FileSearchOutlined />
              {{ t('nav.walletDetail') }}
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
            <a-menu-item key="walletProfitLoss" @click="router.push('/reconciliation/wallet-profit-loss')">
              <LineChartOutlined />
              {{ t('nav.walletProfitLossQuery') }}
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
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout-content style="padding: 24px">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark, useToggle } from '@vueuse/core'
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AlertOutlined,
  FundOutlined,
  WalletOutlined,
  SearchOutlined,
  FileSearchOutlined,
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
  LineChartOutlined
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import storage from '../services/storage'

const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const currentLocale = ref(locale.value)
const username = ref('')
const selectedKeys = ref(['dashboard'])
const openKeys = ref(['monitor'])

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
  }

  // 根據具體路徑設置 selectedKeys
  const pathMap = {
    '/monitor/dashboard': 'dashboard',
    '/monitor/alert': 'alert',
    '/wallet/query': 'walletQuery',
    '/wallet/detail': 'walletDetail',
    '/wallet/transfer': 'walletTransfer',
    '/wallet/token-exchange': 'tokenExchange',
    '/system/users': 'users',
    '/system/roles': 'roles',
    '/order/deposit': 'depositOrder',
    '/order/withdraw': 'withdrawOrder',
    '/order/transfer': 'transferOrder',
    '/order/exchange': 'exchangeOrder',
    '/order/transaction': 'transactionDetail',
    '/params/blockchain': 'blockchain',
    '/params/contract-coin': 'contractCoin',
    '/reconciliation/wallet-balance': 'walletBalance',
    '/reconciliation/wallet-profit-loss': 'walletProfitLoss'
  }

  selectedKeys.value = [pathMap[path] || 'dashboard']
}

onMounted(() => {
  getUserInfo()
  setSelectedKeysByRoute()
})

watch(() => route.path, () => {
  setSelectedKeysByRoute()
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

const changeLocale = (value) => {
  locale.value = value
}

const localeOptions = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en-US', label: 'English' }
]
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
  margin-left: 200px;
  margin-top: 64px;
  overflow-y: auto;
}
</style>