import { createI18n } from 'vue-i18n'
import zhMainLayout from '../locales/layouts/MainLayout/zh.json'
import enMainLayout from '../locales/layouts/MainLayout/en.json'
import zhWalletBalance from '../locales/reconciliation/WalletBalance/zh.json'
import enWalletBalance from '../locales/reconciliation/WalletBalance/en.json'

const messages = {
  zh: {
    ...zhMainLayout,
    reconciliation: {
      WalletBalance: zhWalletBalance
    }
  },
  en: {
    ...enMainLayout,
    reconciliation: {
      WalletBalance: enWalletBalance
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
}) 