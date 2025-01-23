<template>
  <div class="login-container" :class="{ 'dark': isDark }">
    <a-card :title="t('auth.login.title')" :class="{ 'dark-card': isDark }" style="width: 400px">
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
            {{ t('auth.login.title') }}
          </a-button>
        </a-form-item>
      </a-form>
      
      <div class="divider">
        <a-divider>{{ t('auth.login.or') }}</a-divider>
      </div>
      
      <a-button 
        block 
        @click="handleGoogleLogin" 
        :loading="googleLoading"
        class="google-button"
      >
        <template #icon>
          <GoogleOutlined />
        </template>
        {{ t('auth.login.googleLogin') }}
      </a-button>
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
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  transition: all 0.3s;
}

.login-container.dark {
  background: #141414;
}

:deep(.ant-card-head-title) {
  text-align: center;
  font-size: 24px;
}

.dark-card {
  background: #1f1f1f;
}

.dark-card :deep(.ant-card-head) {
  background: #1f1f1f;
  border-bottom: 1px solid #303030;
}

.dark-card :deep(.ant-card-head-title) {
  color: #fff;
}

.dark-card :deep(.ant-card-body) {
  background: #1f1f1f;
}

.dark-card :deep(.ant-form-item-label > label) {
  color: #fff;
}

.divider {
  margin: 16px 0;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-card .google-button {
  background: #1f1f1f;
  border-color: #434343;
  color: #fff;
}

.dark-card .google-button:hover {
  background: #303030;
  border-color: #434343;
}
</style> 