<template>
  <div class="login-container" :class="{ 'dark': isDark }">
    <a-card :title="$t('login')" :class="{ 'dark-card': isDark }" style="width: 400px">
      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        @finish="onFinish"
      >
        <a-form-item
          :label="$t('username')"
          name="username"
          :rules="[{ required: true, message: $t('pleaseInputUsername') }]"
        >
          <a-input v-model:value="formState.username">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          :label="$t('password')"
          name="password"
          :rules="[{ required: true, message: $t('pleaseInputPassword') }]"
        >
          <a-input-password v-model:value="formState.password">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="loading">
            {{ $t('login') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useDark } from '@vueuse/core'

const router = useRouter()
const loading = ref(false)
const isDark = useDark()
const formState = reactive({
  username: '',
  password: '',
})

const onFinish = async () => {
  if (!formState.username || !formState.password) return
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    localStorage.setItem('user', JSON.stringify({
      username: formState.username,
      token: 'dummy-token'
    }))
    
    message.success('登入成功')
    router.push('/')
  } finally {
    loading.value = false
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
</style> 