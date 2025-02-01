<template>
  <div class="wallet-profit-loss">
    <!-- 查詢卡片 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('reconciliation.walletProfitLoss.title.search') }}</span>
      </template>
      
      <a-form :model="searchForm" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('reconciliation.walletProfitLoss.form.dateRange')" class="form-item-lg">
            <date-range-select
              v-model="searchForm.dateRange"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('reconciliation.walletProfitLoss.form.walletId')" class="form-item-md">
            <a-input 
              v-model:value="searchForm.walletId" 
              style="width: 100%"
              allow-clear 
            />
          </a-form-item>
          <a-form-item :label="t('reconciliation.walletProfitLoss.form.walletAddress')" class="form-item-lg">
            <a-input 
              v-model:value="searchForm.walletAddress" 
              style="width: 100%"
              allow-clear 
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item :label="t('reconciliation.walletProfitLoss.form.walletType')" class="form-item-md">
            <wallet-type-select
              v-model="searchForm.walletType"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('reconciliation.walletProfitLoss.form.chainType')" class="form-item-md">
            <chain-type-select
              v-model="searchForm.chainType"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('reconciliation.walletProfitLoss.form.currency')" class="form-item-md">
            <currency-select
              v-model="searchForm.currency"
              style="width: 100%"
            />
          </a-form-item>
          <div class="form-item-sm button-group">
            <a-space>
              <a-button @click="handleReset">{{ t('common.action.reset') }}</a-button>
              <a-button type="primary" @click="handleSearch">{{ t('common.action.search') }}</a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- 明細表格卡片 -->
    <a-card :bordered="false" :bodyStyle="{ padding: '20px 24px' }" class="table-card">
      <template #title>
        <span class="card-title">{{ t('reconciliation.walletProfitLoss.title.detail') }}</span>
      </template>

      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'holdingCost'">
              <span>{{ formatNumber(record.holdingCost) }}</span>
              <span
                :class="[
                  'percentage',
                  record.holdingCostChange >= 0 ? 'increase' : 'decrease'
                ]"
              >
                {{ record.holdingCostChange >= 0 ? '↑' : '↓' }}
                {{ Math.abs(record.holdingCostChange).toFixed(2) }}%
              </span>
            </template>
            <template v-if="column.key === 'marketValue'">
              <span>{{ formatNumber(record.marketValue) }}</span>
              <span
                :class="[
                  'percentage',
                  record.marketValueChange >= 0 ? 'increase' : 'decrease'
                ]"
              >
                {{ record.marketValueChange >= 0 ? '↑' : '↓' }}
                {{ Math.abs(record.marketValueChange).toFixed(2) }}%
              </span>
            </template>
            <template v-if="column.key === 'averagePrice' || column.key === 'price'">
              {{ formatNumber(record[column.key]) }}
            </template>
            <template v-if="column.key === 'walletBalance'">
              {{ formatNumber(record.walletBalance) }}
            </template>
            <template v-if="column.key === 'detail'">
              <a-button type="link" @click="handleShowChart(record)">
                {{ t('reconciliation.walletProfitLoss.table.detail') }}
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!--詳情彈窗-->
    <a-modal
      v-model:open="chartVisible"
      :title="t('reconciliation.walletProfitLoss.detail.title')"
      :width="800"
      :footer="null"
      :destroyOnClose="true"
    >
      <div class="modal-content">
        <div class="chart-container">
          <ApexChart
            width="100%"
            height="400"
            type="line"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
        <div class="radio-group">
          <a-radio-group v-model:value="timeRange" @change="handleChangeTimeRange">
            <a-radio-button value="7">7天</a-radio-button>
            <a-radio-button value="30">30天</a-radio-button>
            <a-radio-button value="90">90天</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, watch, shallowRef, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import mockData from '@/mock/reconciliation/walletprofitloss/list.mock.json'
import zhLocale from '@/locales/reconciliation/WalletProfitLoss/zh.json'
import enLocale from '@/locales/reconciliation/WalletProfitLoss/en.json'
import commonZhLocale from '@/locales/common/zh.json'
import commonEnLocale from '@/locales/common/en.json'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import WalletTypeSelect from '@/components/selectors/WalletTypeSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import VueApexCharts from 'vue3-apexcharts'

// @ts-ignore
const messages = {
  zh: {
    ...zhLocale,
    ...commonZhLocale
  },
  en: {
    ...enLocale,
    ...commonEnLocale
  }
}

// @ts-ignore
const { t } = useI18n({
  messages,
  legacy: false
})

// 定義組件
const ApexChart = VueApexCharts

// 搜索表單數據
const searchForm = reactive({
  dateRange: [],
  walletId: '',
  walletAddress: '',
  walletType: undefined,
  chainType: undefined,
  currency: undefined
})

// 模擬數據
const walletTypes = ref([
  { value: 'hot', label: t('reconciliation.walletProfitLoss.walletType.hot') },
  { value: 'cold', label: t('reconciliation.walletProfitLoss.walletType.cold') }
])
const chainTypes = ref([
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'TRON', label: 'TRON' }
])
const currencies = ref([
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'USDT', label: 'USDT' }
])

interface TableDataItem {
  id: number;
  date: string;
  merchant: string;
  walletId: string;
  chainType: string;
  currency: string;
  averagePrice: string;
  holdingCost: string;
  holdingCostChange: number;
  price: string;
  marketValue: string;
  marketValueChange: number;
  walletBalance: number;
}

// 添加圖表數據的接口定義
interface ChartDataPoint {
  x: number;
  y: number;
}

interface ChartData {
  holdingCost: ChartDataPoint[];
  marketValue: ChartDataPoint[];
}

const tableData = ref<TableDataItem[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => t('common.table.total', { total })
})

// 表格列定義
const columns = [
  {
    title: t('reconciliation.walletProfitLoss.table.date'),
    dataIndex: 'date',
    key: 'date',
    width: 120
  },
  {
    title: t('reconciliation.walletProfitLoss.table.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120
  },
  {
    title: t('reconciliation.walletProfitLoss.table.walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 150
  },
  {
    title: t('reconciliation.walletProfitLoss.table.walletBalance'),
    dataIndex: 'walletBalance',
    key: 'walletBalance',
    width: 120
  },
  {
    title: t('reconciliation.walletProfitLoss.table.chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 120
  },
  {
    title: t('reconciliation.walletProfitLoss.table.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 120
  },
  {
    title: t('reconciliation.walletProfitLoss.table.averagePrice'),
    dataIndex: 'averagePrice',
    key: 'averagePrice',
    width: 150,
    align: 'right'
  },
  {
    title: t('reconciliation.walletProfitLoss.table.holdingCost'),
    key: 'holdingCost',
    width: 200,
    align: 'right'
  },
  {
    title: t('reconciliation.walletProfitLoss.table.price'),
    dataIndex: 'price',
    key: 'price',
    width: 150,
    align: 'right'
  },
  {
    title: t('reconciliation.walletProfitLoss.table.marketValue'),
    key: 'marketValue',
    width: 200,
    align: 'right'
  },
  {
    title: t('reconciliation.walletProfitLoss.table.detail'),
    key: 'detail',
    width: 120,
    customCell: () => ({
      style: { textAlign: 'center' }
    })
  }
]

// 格式化數字
const formatNumber = (value: string) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(parseFloat(value))
}

//詳情彈窗數據
const chartVisible = ref(false)
const timeRange = ref('7')
const currentRecord = ref<TableDataItem | null>(null)

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 350,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    },
    background: '#1f1f1f',
    foreColor: '#999'
  },
  colors: ['#00E396', '#FF4560'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    borderColor: '#303030',
    strokeDashArray: 3,
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: {
        colors: '#999'
      },
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MM/dd',
        day: 'MM/dd',
        hour: 'HH:mm'
      }
    },
    axisBorder: {
      color: '#303030'
    },
    axisTicks: {
      color: '#303030'
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#999'
      },
      formatter: (value: number) => {
        return value.toFixed(8)
      }
    }
  },
  tooltip: {
    theme: 'dark',
    x: {
      format: 'yyyy/MM/dd HH:mm'
    },
    y: {
      formatter: (value: number) => {
        return value.toFixed(8)
      }
    }
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: '#999'
    }
  }
}))

// 修改數據生成函數
const generateChartData = (record: TableDataItem | null, days: number): ChartData => {
  if (!record) return { holdingCost: [], marketValue: [] }
  
  const data: ChartData = {
    holdingCost: [],
    marketValue: []
  }
  const currentDate = new Date()
  const baseHoldingCost = parseFloat(record.holdingCost)
  const baseMarketValue = parseFloat(record.marketValue)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i)
    
    const randomFactor1 = 0.98 + Math.random() * 0.04
    const randomFactor2 = 0.98 + Math.random() * 0.04
    
    data.holdingCost.unshift({
      x: date.getTime(),
      y: baseHoldingCost * randomFactor1
    })
    
    data.marketValue.unshift({
      x: date.getTime(),
      y: baseMarketValue * randomFactor2
    })
  }
  
  return data
}

const chartSeries = computed(() => {
  const days = parseInt(timeRange.value)
  const data = generateChartData(currentRecord.value, days)
  
  return [
    {
      name: t('reconciliation.walletProfitLoss.chart.holdingCost'),
      data: data.holdingCost
    },
    {
      name: t('reconciliation.walletProfitLoss.chart.marketValue'),
      data: data.marketValue
    }
  ]
})

const handleShowChart = (record: TableDataItem) => {
  console.log('handleShowChart called', record)
  currentRecord.value = record
  chartVisible.value = true
}

const handleChangeTimeRange = (e: any) => {
  console.log('Time range changed:', e.target.value)
  timeRange.value = e.target.value
  // 數據會通過 computed 自動更新
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  // 模擬 API 調用
  setTimeout(() => {
    tableData.value = mockData.walletProfitLossList
    pagination.total = mockData.walletProfitLossList.length
    loading.value = false
  }, 500)
}

// 重置方法
const handleReset = () => {
  searchForm.dateRange = []
  searchForm.walletId = ''
  searchForm.walletAddress = ''
  searchForm.walletType = undefined
  searchForm.chainType = undefined
  searchForm.currency = undefined
  handleSearch()
}

// 處理表格變更
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  handleSearch()
}

onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.wallet-profit-loss {
  padding: 24px;

  .filter-card {
    margin-bottom: 24px;
    background: #141414;
  }

  .table-card {
    margin-bottom: 24px;
    background: #141414;
  }

  :deep(.ant-card) {
    border-radius: 8px;
    border: 1px solid #303030;
  }

  :deep(.ant-card-head) {
    background-color: #1f1f1f;
    border-bottom: 1px solid #303030;
    min-height: 48px;
  }

  :deep(.ant-card-head-title) {
    font-size: 16px;
    font-weight: 500;
    padding: 12px 0;
  }

  :deep(.ant-card-body) {
    background-color: #141414;
    padding: 20px 24px;
  }

  .query-form {
    width: 100%;
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 0;
    width: 100%;
  }

  .form-item-xl {
    flex: 3;
    min-width: 0;
  }

  .form-item-lg {
    flex: 2;
    min-width: 0;
  }

  .form-item-md {
    flex: 1.5;
    min-width: 0;
  }

  .form-item-sm {
    flex: 1;
    min-width: 0;
  }

  .button-group {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  }

  .table-container {
    padding: 12px;
    background: #141414;
    border-radius: 8px;
    overflow-x: auto;
    width: 100%;
  }

  :deep(.ant-table) {
    background: transparent;
    min-width: 100%;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #1f1f1f;
    border-bottom: 1px solid #303030;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-bottom: 1px solid #303030;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: rgba(255, 255, 255, 0.08);
  }

  :deep(.ant-pagination-item-link) {
    background: transparent !important;
    border-color: #303030 !important;
  }

  :deep(.ant-pagination-item) {
    background: transparent !important;
    border-color: #303030 !important;
  }

  :deep(.ant-pagination-item-active) {
    border-color: #177ddc !important;
  }

  .percentage {
    margin-left: 8px;
    
    &.increase {
      color: #52c41a;
    }
    
    &.decrease {
      color: #ff4d4f;
    }
  }

  .modal-content {
    width: 100%;
    padding: 20px;
  }

  .chart-container {
    width: 100%;
    background: #1f1f1f;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .radio-group {
    text-align: center;
  }
}
</style>