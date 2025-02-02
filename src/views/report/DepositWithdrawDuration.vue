<template>
  <div class="deposit-withdraw-duration">
    <!-- 查詢條件卡片 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('report.depositWithdrawDuration.queryTitle') }}</span>
      </template>
      <a-form :model="searchForm" class="query-form">
        <div class="form-row">
          <div class="form-item-lg">
            <a-form-item :label="t('field.dateRange')">
              <date-range-select v-model="searchForm.dateRange" />
            </a-form-item>
          </div>
          <div class="form-item-md">
            <a-form-item :label="t('field.merchant')">
              <merchant-select v-model="searchForm.merchant" />
            </a-form-item>
          </div>
          <div class="form-item-sm">
            <a-form-item class="button-group">
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  <template #icon><SearchOutlined /></template>
                  {{ t('action.search') }}
                </a-button>
                <a-button @click="handleReset">
                  <template #icon><ReloadOutlined /></template>
                  {{ t('action.reset') }}
                </a-button>
              </a-space>
            </a-form-item>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- 數據分析卡片 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <span class="card-title">{{ t('report.depositWithdrawDuration.analysisTitle') }}</span>
      </template>
      <a-tabs v-model:activeKey="activeTabKey">
        <a-tab-pane key="deposit" :tab="t('tab.deposit')">
          <div class="table-container">
            <a-table
              :columns="columns"
              :data-source="depositData"
              :pagination="pagination"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" @click="showDetailModal(record)">
                      {{ t('action.details') }}
                    </a-button>
                    <a-button type="link" @click="showChartModal(record)">
                      {{ t('action.chart') }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="withdraw" :tab="t('tab.withdraw')">
          <div class="table-container">
            <a-table
              :columns="columns"
              :data-source="withdrawData"
              :pagination="pagination"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" @click="showDetailModal(record)">
                      {{ t('action.details') }}
                    </a-button>
                    <a-button type="link" @click="showChartModal(record)">
                      {{ t('action.chart') }}
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 詳情彈窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="t('modal.currencyAnalysis')"
      :width="800"
      @cancel="handleDetailModalCancel"
    >
      <a-table
        :columns="detailColumns"
        :data-source="detailData"
        :pagination="false"
      />
    </a-modal>

    <!-- 圖表彈窗 -->
    <a-modal
      v-model:open="chartModalVisible"
      :title="t('modal.currencyAnalysis')"
      :width="800"
      @cancel="handleChartModalCancel"
    >
      <div ref="chartContainer" style="width: 100%; height: 400px"></div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { TablePaginationConfig } from 'ant-design-vue'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import mockData from '@/mock/report/depositWithdrawDuration/data.mock.json'
import zhLocale from '@/locales/report/DepositWithdrawDuration/zh.json'
import enLocale from '@/locales/report/DepositWithdrawDuration/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 定義類型
interface ChainData {
  key: string
  chainType: string
  transactionCount: number
  averageProcessTime: string
}

interface CurrencyData {
  key: string
  currency: string
  transactionCount: number
  transactionAmount: string
  averageProcessTime: string
}

// 查詢表單數據
const searchForm = ref({
  dateRange: [],
  merchant: undefined
})

// 時間格式化函數
const formatProcessTime = (time: string): string => {
  const [hours, minutes, seconds] = time.split(':')
  return `${Number(hours)}時${Number(minutes)}分${Number(seconds)}秒`
}

// 表格相關
const activeTabKey = ref('deposit')
const columns = [
  {
    title: t('table.chainType'),
    dataIndex: 'chainType',
    key: 'chainType'
  },
  {
    title: t('table.transactionCount'),
    dataIndex: 'transactionCount',
    key: 'transactionCount'
  },
  {
    title: t('table.averageProcessTime'),
    dataIndex: 'averageProcessTime',
    key: 'averageProcessTime',
    customRender: ({ text }: { text: string }) => formatProcessTime(text)
  },
  {
    title: t('table.action'),
    key: 'action',
    width: 200
  }
]

const detailColumns = [
  {
    title: t('table.currency'),
    dataIndex: 'currency',
    key: 'currency'
  },
  {
    title: t('table.transactionCount'),
    dataIndex: 'transactionCount',
    key: 'transactionCount'
  },
  {
    title: t('table.transactionAmount'),
    dataIndex: 'transactionAmount',
    key: 'transactionAmount'
  },
  {
    title: t('table.averageProcessTime'),
    dataIndex: 'averageProcessTime',
    key: 'averageProcessTime',
    customRender: ({ text }: { text: string }) => formatProcessTime(text)
  }
]

// 使用 mock 數據
const depositData = ref(mockData.depositData)
const withdrawData = ref(mockData.withdrawData)
const detailData = ref(mockData.currencyDetailData)

// 分頁配置
const pagination = {
  total: 100,
  pageSize: 10,
  showSizeChanger: false,
  showQuickJumper: true
}

// 彈窗控制
const detailModalVisible = ref(false)
const chartModalVisible = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
let chart: ECharts | null = null

// 處理函數
const handleSearch = () => {
  console.log('Search with form:', searchForm.value)
}

const handleReset = () => {
  searchForm.value = {
    dateRange: [],
    merchant: undefined
  }
}

const handleTableChange = (
  pagination: TablePaginationConfig,
  filters: Record<string, string[]>,
  sorter: any
) => {
  console.log('Table change:', { pagination, filters, sorter })
}

const showDetailModal = (record: ChainData) => {
  detailModalVisible.value = true
  // TODO: 加載詳細數據
}

const showChartModal = (record: ChainData) => {
  chartModalVisible.value = true
  // 在下一個 tick 初始化圖表
  setTimeout(() => {
    initChart()
  }, 0)
}

const handleDetailModalCancel = () => {
  detailModalVisible.value = false
}

const handleChartModalCancel = () => {
  chartModalVisible.value = false
}

// 修改圖表初始化
const initChart = () => {
  if (chart) {
    chart.dispose()
  }
  
  chart = echarts.init(chartContainer.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: echarts.DefaultLabelFormatterCallbackParams[]) {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}: ${data.value} 分鐘`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: mockData.chartData.dates,
      axisLabel: {
        color: '#909399'
      }
    },
    yAxis: {
      type: 'value',
      name: t('chart.processTime'),
      axisLabel: {
        formatter: '{value} min',
        color: '#909399'
      },
      splitLine: {
        lineStyle: {
          color: '#303030'
        }
      }
    },
    series: [
      {
        name: t('chart.averageProcessTime'),
        type: 'line',
        data: mockData.chartData.processTimeData,
        smooth: true,
        symbolSize: 8,
        itemStyle: {
          color: '#177ddc'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(23, 125, 220, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(23, 125, 220, 0.1)'
            }
          ])
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 監聽窗口大小變化
window.addEventListener('resize', () => {
  if (chart) {
    chart.resize()
  }
})

// 組件卸載時清理
onMounted(() => {
  if (chartModalVisible.value) {
    initChart()
  }
})
</script>

<style scoped>
.deposit-withdraw-duration {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
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
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.form-item-lg { flex: 2; min-width: 0; }
.form-item-md { flex: 1.5; min-width: 0; }
.form-item-sm { flex: 1; min-width: 0; }

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

:deep(.ant-table) {
  background: transparent;
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

:deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

:deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-tabs-tab-active) {
  color: var(--ant-primary-color);
}

:deep(.ant-tabs-ink-bar) {
  background: var(--ant-primary-color);
}

:deep(.ant-modal-content),
:deep(.ant-modal-header) {
  background-color: #1f1f1f;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-modal-close:hover) {
  color: rgba(255, 255, 255, 0.75);
}
</style> 