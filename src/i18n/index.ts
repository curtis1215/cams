import { createI18n } from 'vue-i18n'
import mainLayoutZh from '@/locales/layouts/MainLayout/zh.json'
import mainLayoutEn from '@/locales/layouts/MainLayout/en.json'

const messages = {
  zh: {
    ...mainLayoutZh
  },
  en: {
    ...mainLayoutEn
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
})

export default i18n 