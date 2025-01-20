<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="logo">CryptoPool</div>
      <div class="header-right">
        <a-switch
          :checked="isDark"
          @change="toggleDark"
          :checkedChildren="$t('common.darkMode')"
          :unCheckedChildren="$t('common.lightMode')"
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
                <span>{{ $t('logout') }}</span>
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
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu key="monitor">
            <template #title>
              <span>
                <FundOutlined />
                {{ $t('nav.monitoring') }}
              </span>
            </template>
            <a-menu-item key="dashboard" @click="router.push('/monitor/dashboard')">
              <DashboardOutlined />
              {{ $t('nav.dataMonitoring') }}
            </a-menu-item>
            <a-menu-item key="alert" @click="router.push('/monitor/alert')">
              <AlertOutlined />
              {{ $t('nav.alertMonitoring') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="wallet">
            <template #title>
              <span>
                <WalletOutlined />
                {{ $t('nav.walletManagement') }}
              </span>
            </template>
            <a-menu-item key="walletQuery" @click="router.push('/wallet/query')">
              <SearchOutlined />
              {{ $t('nav.walletQuery') }}
            </a-menu-item>
            <a-menu-item key="walletDetail" @click="router.push('/wallet/detail')">
              <FileSearchOutlined />
              {{ $t('nav.walletDetail') }}
            </a-menu-item>
            <a-menu-item key="walletTransfer" @click="router.push('/wallet/transfer')">
              <SwapOutlined />
              {{ $t('nav.walletTransfer') }}
            </a-menu-item>
            <a-menu-item key="tokenExchange" @click="router.push('/wallet/token-exchange')">
              <SyncOutlined />
              {{ $t('nav.tokenExchangeManagement') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="order">
            <template #title>
              <span>
                <OrderedListOutlined />
                {{ $t('nav.orderManagement') }}
              </span>
            </template>
            <a-menu-item key="depositOrder" @click="router.push('/order/deposit')">
              <PayCircleOutlined />
              {{ $t('nav.depositOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="withdrawOrder" @click="router.push('/order/withdraw')">
              <BankOutlined />
              {{ $t('nav.withdrawOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="transferOrder" @click="router.push('/order/transfer')">
              <SwapOutlined />
              {{ $t('nav.transferOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="exchangeOrder" @click="router.push('/order/exchange')">
              <SyncOutlined />
              {{ $t('nav.exchangeOrderQuery') }}
            </a-menu-item>
            <a-menu-item key="transactionDetail" @click="router.push('/order/transaction')">
              <TransactionOutlined />
              {{ $t('nav.transactionDetailQuery') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="params">
            <template #title>
              <span>
                <ToolOutlined />
                {{ $t('nav.paramsManagement') }}
              </span>
            </template>
            <a-menu-item key="blockchain" @click="router.push('/params/blockchain')">
              <BlockOutlined />
              {{ $t('nav.blockchainManagement') }}
            </a-menu-item>
            <a-menu-item key="contractCoin" @click="router.push('/params/contract-coin')">
              <CodeOutlined />
              {{ $t('nav.contractCoinManagement') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system">
            <template #title>
              <span>
                <SettingOutlined />
                {{ $t('nav.system') }}
              </span>
            </template>
            <a-menu-item key="users">{{ $t('nav.userManagement') }}</a-menu-item>
            <a-menu-item key="roles">{{ $t('nav.roleManagement') }}</a-menu-item>
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
  SyncOutlined
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import storage from '../services/storage'

const router = useRouter()
const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const { locale } = useI18n()
const currentLocale = ref(locale.value)
const username = ref('')
const selectedKeys = ref(['dashboard'])
const openKeys = ref(['monitor'])

const setSelectedKeysByRoute = () => {
  const path = route.path
  if (path.includes('/monitor/')) {
    openKeys.value = ['monitor']
  } else if (path.includes('/wallet/')) {
    openKeys.value = ['wallet']
  } else if (path.includes('/system/')) {
    openKeys.value = ['system']
  } else if (path.includes('/order/')) {
    openKeys.value = ['order']
  } else if (path.includes('/params/')) {
    openKeys.value = ['params']
  }

  if (path.includes('/monitor/dashboard')) {
    selectedKeys.value = ['dashboard']
  } else if (path.includes('/monitor/alert')) {
    selectedKeys.value = ['alert']
  } else if (path.includes('/wallet/query')) {
    selectedKeys.value = ['walletQuery']
  } else if (path.includes('/wallet/detail')) {
    selectedKeys.value = ['walletDetail']
  } else if (path.includes('/wallet/transfer')) {
    selectedKeys.value = ['walletTransfer']
  } else if (path.includes('/wallet/token-exchange')) {
    selectedKeys.value = ['tokenExchange']
  } else if (path.includes('/system/users')) {
    selectedKeys.value = ['users']
  } else if (path.includes('/system/roles')) {
    selectedKeys.value = ['roles']
  } else if (path.includes('/order/deposit')) {
    selectedKeys.value = ['depositOrder']
  } else if (path.includes('/order/withdraw')) {
    selectedKeys.value = ['withdrawOrder']
  } else if (path.includes('/order/transfer')) {
    selectedKeys.value = ['transferOrder']
  } else if (path.includes('/order/exchange')) {
    selectedKeys.value = ['exchangeOrder']
  } else if (path.includes('/order/transaction')) {
    selectedKeys.value = ['transactionDetail']
  } else if (path.includes('/params/blockchain')) {
    selectedKeys.value = ['blockchain']
  } else if (path.includes('/params/contract-coin')) {
    selectedKeys.value = ['contractCoin']
  }
}

watch(() => route.path, () => {
  setSelectedKeysByRoute()
}, { immediate: true })

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

onMounted(() => {
  getUserInfo()
})

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
</style>