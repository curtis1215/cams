import { createApp } from 'vue'
import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'

const app = createApp(App)
app.use(VueApexCharts)

// ... 其他現有的代碼 ...
app.mount('#app') 