<template>
  <div class="node-height-analysis">
    <!-- 查詢條件卡片 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('nodeHeightAnalysis.dataQuery') }}</span>
      </template>
      <a-form :model="searchForm" class="query-form">
        <div class="form-row">
          <div class="form-item-lg">
            <date-range-select
              v-model="searchForm.dateRange"
              :style="{ width: '100%' }"
            />
          </div>
          <div class="form-item-md">
            <chain-type-select
              v-model="searchForm.chainType"
              @change="handleChainTypeChange"
            />
          </div>
          <div class="form-item-sm">
            <div class="button-group">
              <a-button type="primary" @click="handleSearch">
                {{ t('common.search') }}
              </a-button>
              <a-button style="margin-left: 8px" @click="handleReset">
                {{ t('common.reset') }}
              </a-button>
            </div>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- 圖表卡片 -->
    <a-card :bordered="false" class="chart-card">
      <template #title>
        <span class="card-title">{{ t('nodeHeightAnalysis.heightDifferenceAnalysis') }}</span>
      </template>
      <div class="chart-container" ref="chartContainer"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DefineLocaleMessage } from 'vue-i18n'
import { Line } from '@antv/g2plot'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import dayjs from 'dayjs'
import zhLocale from '@/locales/views/report/NodeHeightAnalysis/zh.json'
import enLocale from '@/locales/views/report/NodeHeightAnalysis/en.json'
import dateRangeZhLocale from '@/locales/components/DateRangeSelect/zh.json'
import dateRangeEnLocale from '@/locales/components/DateRangeSelect/en.json'
import mockData from '@/mock/report/NodeHeightAnalysis/nodeHeightAnalysis.mock.json'
import { message } from 'ant-design-vue'

// 定義必要的介面
interface ChartData {
  time: string
  value: number
  label: string
}

interface SearchForm {
  dateRange: [string, string]
  chainType: string
}

const messages = {
  zh: {
    ...zhLocale,
    ...dateRangeZhLocale
  },
  en: {
    ...enLocale,
    ...dateRangeEnLocale
  }
}

const { t } = useI18n({
  messages,
  legacy: false
})

const searchForm = ref<SearchForm>({
  dateRange: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
  chainType: 'BTC'
})

const chartContainer = ref<HTMLElement | null>(null)
let chart: Line | null = null

// 計算日期區間天數
const daysDifference = computed(() => {
  if (!searchForm.value.dateRange || searchForm.value.dateRange.length !== 2) {
    return 0
  }
  const start = dayjs(searchForm.value.dateRange[0])
  const end = dayjs(searchForm.value.dateRange[1])
  return end.diff(start, 'day')
})

// 生成模擬數據
const generateMockData = (): ChartData[] => {
  const days = daysDifference.value
  const data: ChartData[] = []
  let interval = '1h'
  let labelInterval = 1
  
  if (days <= 2) {
    interval = '1h'
    labelInterval = 24  // 每24小時顯示一個標籤
  } else if (days <= 7) {
    interval = '6h'
    labelInterval = 4  // 每24小時顯示一個標籤
  } else {
    interval = '1d'
    labelInterval = 1  // 每24小時顯示一個標籤
  }

  const start = new Date(searchForm.value.dateRange[0])
  const end = new Date(searchForm.value.dateRange[1])
  let current = start
  let count = 0

  while (current <= end) {
    const time = current.toISOString().slice(0, 16).replace('T', ' ')
    const showLabel = current.getUTCHours() === 0 && current.getUTCMinutes() === 0
    
    data.push({
      time,
      value: Math.floor(Math.random() * 100),
      label: showLabel ? time : ''
    })

    switch (interval) {
      case '1h':
        current.setUTCHours(current.getUTCHours() + 1)
        break
      case '6h':
        current.setUTCHours(current.getUTCHours() + 6)
        break
      case '1d':
        current.setUTCDate(current.getUTCDate() + 1)
        break
    }
    count++
  }

  return data
}

const updateChart = () => {
  const data = generateMockData()
  const chainName = searchForm.value.chainType || 'All'

  const config: any = {
    data,
    autoFit: true,
    height: 400,
    canvas: {
      supportCSSTransform: true,
      eventOptions: {
        passive: true
      }
    },
    interactions: ['tooltip', 'element-active'],
    theme: {
      defaultColor: '#1890ff'
    },
    padding: [20, 30, 80, 50],
    xField: 'time',
    yField: 'value',
    smooth: true,
    appendPadding: [20, 0, 0, 0],
    lineStyle: {
      lineWidth: 2
    },
    xAxis: {
      tickCount: 5,
      type: 'time',
      animate: false,
      label: {
        formatter: (v: string) => dayjs(v).format('MM-DD'),
        style: {
          fill: '#fff',
          fontSize: 12
        },
        autoRotate: true
      }
    },
    yAxis: {
      title: {
        text: '差異值',
        style: {
          fill: '#fff'
        }
      },
      animate: false,
      grid: {
        line: {
          style: {
            stroke: '#303030',
            lineWidth: 1,
            lineDash: [4, 4]
          }
        }
      }
    },
    tooltip: {
      shared: true,
      showNow: false,
      crosshairs: {
        line: {
          style: {
            stroke: '#303030'
          }
        }
      }
    },
    meta: {
      time: {
        type: 'time',
        mask: 'MM-DD',
        tickCount: 5
      }
    },
    animation: false
  }

  if (chart) {
    chart.destroy()
  }

  if (chartContainer.value) {
    chart = new Line(chartContainer.value, config)
    chart.render()
  }
}

// 事件處理
const handleDateRangeChange = () => {
  updateChart()
}

const handleChainTypeChange = () => {
  updateChart()
}

const handleSearch = () => {
  if (!searchForm.value.dateRange || searchForm.value.dateRange.length !== 2) {
    message.warning(t('nodeHeightAnalysis.pleaseSelectDateRange'))
    return
  }
  if (!searchForm.value.chainType) {
    message.warning(t('nodeHeightAnalysis.pleaseSelectChainType'))
    return
  }
  updateChart()
}

const handleReset = () => {
  searchForm.value = {
    dateRange: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    chainType: 'BTC'
  }
  updateChart()
}

onMounted(() => {
  handleSearch()
})

// 監聽表單變化
watch([() => searchForm.value.dateRange, () => searchForm.value.chainType], () => {
  updateChart()
})
</script>

<style scoped>
.node-height-analysis {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
  flex-shrink: 0;
}

.chart-card {
  background: #141414;
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.chart-container {
  flex: 1;
  min-height: 400px;
  touch-action: pan-y pinch-zoom;
  -webkit-overflow-scrolling: touch;
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

:deep(.g2-tooltip) {
  touch-action: pan-y pinch-zoom;
}

:deep(.g2) {
  touch-action: pan-y pinch-zoom;
}

:deep(canvas) {
  touch-action: pan-y pinch-zoom;
}
</style> 