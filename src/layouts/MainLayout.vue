<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="logo">CryptoPool</div>
      <div class="header-right">
        <a-switch
          :checked="isDark"
          @change="toggleDark"
          :checkedChildren="$t('darkMode')"
          :unCheckedChildren="$t('lightMode')"
        />
        <a-select
          v-model:value="currentLocale"
          style="width: 100px; margin: 0 16px"
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
                {{ $t('monitoring') }}
              </span>
            </template>
            <a-menu-item key="dashboard" @click="router.push('/monitor/dashboard')">
              <DashboardOutlined />
              {{ $t('dataMonitoring') }}
            </a-menu-item>
            <a-menu-item key="alert" @click="router.push('/monitor/alert')">
              <AlertOutlined />
              {{ $t('alertMonitoring') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="wallet">
            <template #title>
              <span>
                <WalletOutlined />
                {{ $t('walletManagement') }}
              </span>
            </template>
            <a-menu-item key="walletQuery" @click="router.push('/wallet/query')">
              <SearchOutlined />
              {{ $t('walletQuery') }}
            </a-menu-item>
            <a-menu-item key="walletDetail" @click="router.push('/wallet/detail')">
              <FileSearchOutlined />
              {{ $t('walletDetail') }}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system">
            <template #title>
              <span>
                <SettingOutlined />
                {{ $t('system') }}
              </span>
            </template>
            <a-menu-item key="users">{{ $t('userManagement') }}</a-menu-item>
            <a-menu-item key="roles">{{ $t('roleManagement') }}</a-menu-item>
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
  FileSearchOutlined
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'

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
  }

  if (path.includes('/monitor/dashboard')) {
    selectedKeys.value = ['dashboard']
  } else if (path.includes('/monitor/alert')) {
    selectedKeys.value = ['alert']
  } else if (path.includes('/wallet/query')) {
    selectedKeys.value = ['walletQuery']
  } else if (path.includes('/wallet/detail')) {
    selectedKeys.value = ['walletDetail']
  } else if (path.includes('/system/users')) {
    selectedKeys.value = ['users']
  } else if (path.includes('/system/roles')) {
    selectedKeys.value = ['roles']
  }
}

watch(() => route.path, () => {
  setSelectedKeysByRoute()
}, { immediate: true })

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  username.value = user.username || 'Guest'
  setSelectedKeysByRoute()
})

const changeLocale = (value) => {
  locale.value = value
}

const handleLogout = () => {
  localStorage.removeItem('user')
  message.success('登出成功')
  router.push('/login')
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