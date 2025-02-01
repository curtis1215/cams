<template>
  <div class="login-container" :class="{ 'dark': isDark }">
    <a-card :title="t('auth.login.title')" :class="{ 'dark-card': isDark }" style="width: 400px">
      <a-button 
        block 
        @click="handleGoogleLogin" 
        :loading="googleLoading"
        class="login-container__google-button"
        size="large"
      >
        <template #icon>
          <GoogleOutlined />
        </template>
        {{ t('auth.login.googleLogin') }}
      </a-button>

      <div class="login-container__divider">
        <a-divider>{{ t('auth.login.or') }}</a-divider>
      </div>

      <a-button 
        block 
        @click="toggleAdminLogin" 
        class="login-container__admin-button"
        size="large"
      >
        <template #icon>
          <UserOutlined />
        </template>
        {{ t('auth.login.adminLogin') }}
      </a-button>

      <div v-show="showAdminLogin" class="login-container__form">
        <a-form
          :model="formState"
          name="basic"
          autocomplete="off"
          @finish="handleLogin"
        >
          <a-form-item
            :label="t('auth.login.username')"
            name="username"
            :rules="[{ required: true, message: t('auth.login.pleaseInputUsername') }]"
          >
            <a-input v-model:value="formState.username">
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            :label="t('auth.login.password')"
            name="password"
            :rules="[{ required: true, message: t('auth.login.pleaseInputPassword') }]"
          >
            <a-input-password v-model:value="formState.password">
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" block :loading="loading">
              {{ t('auth.login.submit') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useDark } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import storage from '../services/storage'
import zhLocale from '@/locales/auth/Login/zh.json'
import enLocale from '@/locales/auth/Login/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const router = useRouter()
const loading = ref(false)
const isDark = useDark()
const googleLoading = ref(false)
const showAdminLogin = ref(false)

const formState = reactive({
  username: '',
  password: '',
})

const handleLogin = async (values) => {
  if (!values.username || !values.password) {
    message.error(t('auth.login.pleaseInputAllRequired'))
    return
  }

  loading.value = true
  try {
    // TODO: 實現登入邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模擬登入成功，使用 sessionStorage
    const userData = {
      username: values.username,
      token: 'mock-token',
      loginTime: new Date().toISOString()
    }
    
    storage.set('user', userData)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
    message.error(error.message || t('auth.login.loginFailed'))
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData = {
      username: 'google_user@gmail.com',
      token: 'mock-google-token',
      loginTime: new Date().toISOString(),
      provider: 'google'
    }
    
    storage.set('user', userData)
    message.success(t('auth.login.googleLoginSuccess'))
    router.push('/')
  } catch (error) {
    console.error('Google login failed:', error)
    message.error(t('auth.login.googleLoginFailed'))
  } finally {
    googleLoading.value = false
  }
}

const toggleAdminLogin = () => {
  showAdminLogin.value = !showAdminLogin.value
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-color, #f0f2f5);
  transition: all 0.3s;
}

.login-container.dark {
  background: var(--dark-bg-color, #141414);
}

.login-container__google-button {
  margin-bottom: 16px;
}

.login-container__admin-button {
  margin-bottom: 16px;
}

.login-container__form {
  margin-top: 24px;
}

.login-container__divider {
  margin: 16px 0;
}

:deep(.ant-card-head-title) {
  text-align: center;
  font-size: 24px;
}

.dark-card {
  background: var(--dark-component-bg, #1f1f1f);
}

.dark-card :deep(.ant-card-head) {
  background: var(--dark-component-bg, #1f1f1f);
  border-bottom: 1px solid var(--dark-border-color, #303030);
}

.dark-card :deep(.ant-card-head-title) {
  color: var(--dark-text-color, #fff);
}

.dark-card :deep(.ant-card-body) {
  background: var(--dark-component-bg, #1f1f1f);
}

.dark-card :deep(.ant-form-item-label > label) {
  color: var(--dark-text-color, #fff);
}

.dark-card .login-container__google-button,
.dark-card .login-container__admin-button {
  background: var(--dark-component-bg, #1f1f1f);
  border-color: var(--dark-border-color, #434343);
  color: var(--dark-text-color, #fff);
}

.dark-card .login-container__google-button:hover,
.dark-card .login-container__admin-button:hover {
  background: var(--dark-hover-bg, #303030);
  border-color: var(--dark-border-color, #434343);
}
</style> 