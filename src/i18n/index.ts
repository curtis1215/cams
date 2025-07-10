import { createI18n } from 'vue-i18n'
import commonZh from '../locales/common/zh.json'
import commonEn from '../locales/common/en.json'
import mainLayoutZh from '../locales/layouts/MainLayout/zh.json'
import mainLayoutEn from '../locales/layouts/MainLayout/en.json'
import zh from '../locales/zh.json'
import en from '../locales/en.json'

const messages = {
  zh: {
    ...zh,
    ...commonZh,
    ...mainLayoutZh
  },
  en: {
    ...en,
    ...commonEn,
    ...mainLayoutEn
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
}) 