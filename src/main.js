import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { router } from './router'
import zhCN from './locales/zh.json'
import enUS from './locales/en.json'
import 'ant-design-vue/dist/reset.css'
import tronService from './services/tron'

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: {
    'zh': zhCN,
    'en': enUS
  }
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(Antd)

// 初始化 TronService
tronService.init().catch(error => {
  console.error('Failed to initialize TronService:', error)
})

app.mount('#app')
