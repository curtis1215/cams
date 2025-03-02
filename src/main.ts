import { createApp } from 'vue'
import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'
import { i18n } from './i18n'
import { router } from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.variable.min.css'

const app = createApp(App)
app.use(VueApexCharts)
app.use(i18n)
app.use(router)
app.use(Antd)

// ... 其他現有的代碼 ...
app.mount('#app') 