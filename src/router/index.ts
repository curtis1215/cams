import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/monitor/Dashboard.vue'
import Alert from '../views/monitor/Alert.vue'
import PRDDoc from '../views/PRDDoc.vue'
import SystemParams from '@/views/system/SystemParams.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/monitor/dashboard'
      },
      {
        path: 'monitor/dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'monitor/alert',
        name: 'Alert',
        component: Alert
      },
      {
        path: '/monitor/node-height',
        component: () => import('../views/monitor/NodeHeight.vue')
      },
      {
        path: 'wallet/query',
        name: 'WalletQuery',
        component: () => import('../views/wallet/Query.vue')
      },
      {
        path: 'wallet/detail',
        name: 'WalletDetail',
        component: () => import('../views/wallet/Detail.vue')
      },
      {
        path: 'wallet/transfer',
        name: 'WalletTransfer',
        component: () => import('../views/wallet/Transfer.vue')
      },
      {
        path: 'wallet/token-exchange',
        name: 'TokenExchangeManagement',
        component: () => import('../views/wallet/TokenExchange.vue')
      },
      {
        path: 'params/blockchain',
        name: 'BlockchainManagement',
        component: () => import('../views/params/Blockchain.vue')
      },
      {
        path: 'params/contract-coin',
        name: 'ContractCoinManagement',
        component: () => import('../views/params/ContractCoin.vue')
      },
      {
        path: 'params/exchange-pair',
        name: 'ExchangePairManagement',
        component: () => import('../views/params/ExchangePair.vue')
      },
      {
        path: '/params/risk-address',
        component: () => import('@/views/params/RiskAddress.vue')
      },
      {
        path: 'params/bankcode',
        name: 'BankcodeManagement',
        component: () => import('@/views/params/Bankcode.vue'),
        meta: {
          title: 'nav.bankcodeManagement',
          requiresAuth: true
        }
      },
      {
        path: 'system/users',
        name: 'UserManagement',
        component: () => import('../views/system/Users.vue'),
        meta: {
          title: 'nav.userManagement',
          requiresAuth: true
        }
      },
      {
        path: 'system/roles',
        name: 'RoleManagement',
        component: () => import('../views/system/Roles.vue'),
        meta: {
          title: 'title.roleManagement',
          requiresAuth: true
        }
      },
      {
        path: 'system/merchants',
        name: 'MerchantManagement',
        component: () => import('../views/system/Merchants.vue')
      },
      {
        path: 'order/deposit',
        name: 'DepositOrder',
        component: () => import('../views/order/Deposit.vue')
      },
      {
        path: 'order/withdraw',
        name: 'WithdrawOrder',
        component: () => import('../views/order/Withdraw.vue')
      },
      {
        path: 'order/transfer',
        name: 'TransferRecord',
        component: () => import('../views/order/TransferRecord.vue')
      },
      {
        path: 'order/transaction',
        name: 'TransactionDetail',
        component: () => import('../views/order/Transaction.vue')
      },
      {
        path: 'order/exchange',
        name: 'ExchangeOrder',
        component: () => import('../views/order/Exchange.vue')
      },
      {
        path: 'order/manual',
        name: 'ManualOrder',
        component: () => import('../views/order/ManualOrder.vue'),
        meta: {
          title: 'nav.manualOrderQuery',
          requiresAuth: true
        }
      },
      {
        path: 'report/deposit-withdraw-duration',
        name: 'DepositWithdrawDuration',
        component: () => import('../views/report/DepositWithdrawDuration.vue'),
        meta: {
          title: 'nav.depositWithdrawDurationReport',
          requiresAuth: true
        }
      },
      {
        path: 'report/wallet-profit-loss',
        name: 'WalletProfitLoss',
        component: () => import('@/views/report/WalletProfitLoss.vue'),
        meta: {
          title: 'nav.walletProfitLossQuery',
          requiresAuth: true
        }
      },
      {
        path: 'report/node-height-analysis',
        name: 'NodeHeightAnalysis',
        component: () => import('@/views/report/NodeHeightAnalysis.vue'),
        meta: {
          title: 'nav.nodeHeightAnalysis',
          requiresAuth: true
        }
      },
      {
        path: 'prd-doc',
        name: 'PRDDoc',
        component: PRDDoc,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/system/params',
        name: 'SystemParams',
        component: SystemParams,
        meta: {
          requiresAuth: true,
          title: '系統參數'
        }
      }
    ]
  },
  {
    path: '/reconciliation',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'wallet-balance',
        name: 'WalletBalance',
        component: () => import('@/views/reconciliation/WalletBalance.vue'),
        meta: {
          title: 'nav.walletBalanceQuery',
          requiresAuth: true
        }
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
}) 