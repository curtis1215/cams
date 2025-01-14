<template>
  <div class="dashboard">
    <div class="platform-select">
      <a-select
        v-model:value="selectedPlatform"
        style="width: 200px"
        @change="handlePlatformChange"
      >
        <a-select-option value="all">{{ $t('allPlatforms') }}</a-select-option>
        <a-select-option value="fameex">Fameex</a-select-option>
        <a-select-option value="cnx">CNX</a-select-option>
      </a-select>
    </div>
    <a-row :gutter="16" style="margin-top: 24px">
      <a-col :span="6">
        <a-card>
          <template #title>
            <MoneyCollectOutlined /> {{ $t('todayDeposit') }}
          </template>
          <h2>{{ formatNumber(12345678.12345678) }} USDT</h2>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <template #title>
            <ClockCircleOutlined /> {{ $t('avgDepositDuration') }}
          </template>
          <h2>02:45:30</h2>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <template #title>
            <TransactionOutlined /> {{ $t('todayWithdraw') }}
          </template>
          <h2>{{ formatNumber(87654321.87654321) }} USDT</h2>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <template #title>
            <FieldTimeOutlined /> {{ $t('avgWithdrawDuration') }}
          </template>
          <h2>01:30:15</h2>
        </a-card>
      </a-col>
    </a-row>

    <!-- 圓餅圖區域 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card :title="$t('depositCoinRatio')">
          <v-chart class="chart" :option="depositPieOption" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :title="$t('withdrawCoinRatio')">
          <v-chart class="chart" :option="withdrawPieOption" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 長條圖區域 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card :title="$t('chainDepositDuration')">
          <v-chart class="chart" :option="depositBarOption" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :title="$t('chainWithdrawDuration')">
          <v-chart class="chart" :option="withdrawBarOption" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 折線圖區域 -->
    <a-row class="chart-row">
      <a-col :span="24">
        <a-card :title="$t('hourlyAnalysis')">
          <v-chart class="chart large" :option="lineOption" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { MoneyCollectOutlined, ClockCircleOutlined, TransactionOutlined, FieldTimeOutlined } from '@ant-design/icons-vue'

// 註冊 ECharts 必要組件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const selectedPlatform = ref('all')

const handlePlatformChange = (value) => {
  console.log('選擇的平台:', value)
  // 這裡可以添加切換平台時的數據更新邏輯
}

const formatNumber = (num) => {
  return num.toFixed(4)
}

// 圓餅圖配置
const depositPieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '16',
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: false
    },
    data: [
      { value: 45000, name: 'USDT' },
      { value: 25000, name: 'BNB' },
      { value: 15000, name: 'ETH' },
      { value: 10000, name: 'BTC' },
      { value: 5000, name: 'SOL' }
    ]
  }]
}))

const withdrawPieOption = computed(() => ({
  ...depositPieOption.value,
  series: [{
    ...depositPieOption.value.series[0],
    data: [
      { value: 38000, name: 'USDT' },
      { value: 28000, name: 'BNB' },
      { value: 18000, name: 'ETH' },
      { value: 12000, name: 'BTC' },
      { value: 4000, name: 'SOL' }
    ]
  }]
}))

// 長條圖配置
const depositBarOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['USDT', 'BNB', 'ETH', 'BTC', 'SOL']
  },
  yAxis: {
    type: 'value',
    name: '分鐘'
  },
  series: [{
    data: [30, 45, 60, 75, 25],
    type: 'bar',
    barWidth: '40%'
  }]
}))

const withdrawBarOption = computed(() => ({
  ...depositBarOption.value,
  series: [{
    ...depositBarOption.value.series[0],
    data: [40, 55, 70, 85, 35]
  }]
}))

// 折線圖配置
const lineOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['充值', '提幣']
  },
  xAxis: {
    type: 'category',
    data: Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  },
  yAxis: {
    type: 'value',
    name: 'USDT'
  },
  series: [
    {
      name: '充值',
      type: 'line',
      smooth: true,
      data: Array.from({ length: 25 }, () => Math.floor(Math.random() * 50000 + 10000))
    },
    {
      name: '提幣',
      type: 'line',
      smooth: true,
      data: Array.from({ length: 25 }, () => Math.floor(Math.random() * 40000 + 8000))
    }
  ]
}))
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

.platform-select {
  margin-bottom: 24px;
}

:deep(.ant-card) {
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  color: #1890ff;
  font-family: monospace;
}

.chart-row {
  margin-top: 24px;
}

.chart {
  height: 300px;
}

.chart.large {
  height: 400px;
}
</style> 