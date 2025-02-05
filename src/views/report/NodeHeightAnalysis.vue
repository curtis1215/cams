<template>
  <div class="node-height-analysis">
    <!-- 查詢條件卡片 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('nodeHeight.title') }}</span>
      </template>
      <a-form :model="searchForm" class="query-form">
        <div class="form-row">
          <div class="form-item-lg">
            <date-range-select v-model="searchForm.dateRange" />
          </div>
          <div class="form-item-md">
            <chain-type-select v-model="searchForm.chainType" />
          </div>
          <div class="form-item-sm button-group">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                {{ t('common.action.search') }}
              </a-button>
              <a-button @click="handleReset">
                {{ t('common.action.reset') }}
              </a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- 圖表卡片 -->
    <a-card :bordered="false" class="chart-card">
      <template #title>
        <span class="card-title">{{ t('nodeHeight.chart.title', { days: 7 }) }}</span>
      </template>
      <div class="chart-container">
        <a-spin :spinning="loading">
          <div ref="chartRef" style="width: 100%; height: 400px"></div>
        </a-spin>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import DateRangeSelect from '@/components/selectors/DateRangeSelect.vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import zhLocale from '@/locales/report/NodeHeightAnalysis/zh.json'
import enLocale from '@/locales/report/NodeHeightAnalysis/en.json'
import commonZhLocale from '@/locales/common/zh.json'
import commonEnLocale from '@/locales/common/en.json'

const messages = {
  zh: {
    nodeHeight: zhLocale.nodeHeight,
    common: {
      action: {
        search: '搜索',
        reset: '重置'
      }
    }
  },
  en: {
    nodeHeight: enLocale.nodeHeight,
    common: {
      action: {
        search: 'Search',
        reset: 'Reset'
      }
    }
  }
}

const { t } = useI18n({
  messages,
  legacy: false,
  useScope: 'local'
})

const searchForm = reactive({
  dateRange: [],
  chainType: undefined
})

const loading = ref(false)
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// Mock 數據生成函數
const generateMockData = () => {
  const now = new Date()
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50
    })
  }
  return data
}

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  const mockData = generateMockData()
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: mockData.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: t('nodeHeight.chart.yAxisName')
    },
    series: [{
      data: mockData.map(item => item.value),
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      }
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  }
  
  chart.setOption(option)
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    initChart()
    loading.value = false
  }, 500)
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.chainType = undefined
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

</script>

<style lang="scss" scoped>
.node-height-analysis {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.chart-card {
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

.chart-container {
  width: 100%;
  min-height: 400px;
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

.form-item-lg { flex: 2; min-width: 0; }
.form-item-md { flex: 1.5; min-width: 0; }
.form-item-sm { flex: 1; min-width: 0; }

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
</style> 