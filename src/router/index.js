import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/monitor/Dashboard.vue'
import Alert from '../views/monitor/Alert.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: MainLayout,
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
        path: 'wallet/query',
        name: 'WalletQuery',
        component: () => import('../views/wallet/Query.vue')
      },
      {
        path: 'wallet/settings',
        name: 'WalletSettings',
        component: () => import('../views/wallet/Settings.vue')
      },
      {
        path: 'system/users',
        component: () => import('../views/system/Users.vue')
      },
      {
        path: 'system/roles',
        component: () => import('../views/system/Roles.vue')
      },
      {
        path: 'wallet/detail',
        name: 'WalletDetail',
        component: () => import('../views/wallet/Detail.vue')
      },
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
}) 