import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { router } from './router'
import zhCN from './locales/zh.json'
import enUS from './locales/en.json'
import zhMainLayout from './locales/layouts/MainLayout/zh.json'
import enMainLayout from './locales/layouts/MainLayout/en.json'
import 'ant-design-vue/dist/reset.css'

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: {
    'zh': {
      ...zhCN,
      ...zhMainLayout
    },
    'en': {
      ...enUS,
      ...enMainLayout
    }
  }
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(Antd)

app.mount('#app')
