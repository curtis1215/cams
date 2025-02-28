import { createI18n } from 'vue-i18n'
import zhMainLayout from '../locales/layouts/MainLayout/zh.json'
import enMainLayout from '../locales/layouts/MainLayout/en.json'
import zhWalletBalance from '../locales/reconciliation/WalletBalance/zh.json'
import enWalletBalance from '../locales/reconciliation/WalletBalance/en.json'
import zhMerchant from '../locales/system/Merchant/zh.json'
import enMerchant from '../locales/system/Merchant/en.json'
import zhManualOrder from '../locales/order/Manual/zh.json'
import enManualOrder from '../locales/order/Manual/en.json'
import zhCommon from '../locales/common/zh.json'
import enCommon from '../locales/common/en.json'

const messages = {
  zh: {
    ...zhMainLayout,
    common: zhCommon,
    reconciliation: {
      WalletBalance: zhWalletBalance
    },
    system: {
      Merchant: zhMerchant
    },
    order: {
      Manual: zhManualOrder
    }
  },
  en: {
    ...enMainLayout,
    common: enCommon,
    reconciliation: {
      WalletBalance: enWalletBalance
    },
    system: {
      Merchant: enMerchant
    },
    order: {
      Manual: enManualOrder
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
}) 