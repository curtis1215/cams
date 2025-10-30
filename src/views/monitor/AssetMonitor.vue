<template>
  <div class="asset-monitor">
    <!-- 標題卡片 -->
    <a-card :bordered="false" class="header-card">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('title.assetMonitor') }}</span>
          <div class="header-actions">
            <a-select
              v-model:value="selectedMerchant"
              style="width: 150px; margin-right: 12px"
              :options="merchantOptions"
            />
            <a-input-search
              v-model:value="searchText"
              :placeholder="t('filter.searchPlaceholder')"
              style="width: 200px; margin-right: 12px"
              @search="handleSearch"
              allow-clear
            />
            <a-button type="primary" @click="handleRefresh" :loading="loading">
              <template #icon><ReloadOutlined /></template>
              {{ t('action.refresh') }}
            </a-button>
          </div>
        </div>
      </template>
    </a-card>

    <!-- 資產數據表格 -->
    <a-card :bordered="false" class="table-card" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="{
          total: filteredData.length,
          pageSize: 20,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 筆`
        }"
        :loading="loading"
        :bordered="true"
        :scroll="{ x: 1400 }"
        row-key="id"
      >
        <!-- 自定義欄位渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 幣種 -->
          <template v-if="column.key === 'currency'">
            <span class="currency-cell">{{ record.currency }}</span>
          </template>

          <!-- 鏈路持有量 -->
          <template v-if="column.key === 'chainHoldings'">
            <div class="chain-holdings-cell">
              <div class="chain-total">{{ formatChainTotal(record.chainHoldings) }}</div>
              <div class="chain-tags">
                <a-tag v-for="[chain, amount] in Object.entries(record.chainHoldings)" :key="chain" :color="getChainColor(chain)">
                  {{ chain }}: {{ formatNumber(amount) }}
                </a-tag>
              </div>
            </div>
          </template>

          <!-- 平台用戶持有量 -->
          <template v-if="column.key === 'userHoldings'">
            <span class="number-cell">{{ formatNumber(record.userHoldings) }}</span>
          </template>

          <!-- 平台項目方持有量 -->
          <template v-if="column.key === 'projectHoldings'">
            <span class="number-cell">{{ formatNumber(record.projectHoldings) }}</span>
          </template>

          <!-- 資產差額 (保留額度 + 扣減後差額 + USDT 等值) -->
          <template v-if="column.key === 'assetDifference'">
            <div class="asset-difference-cell">
              <div class="reserve-amount">{{ t('field.reserveAmount') }}: {{ formatNumber(record.reserveAmount) }}</div>
              <div :class="getDifferenceClass(record.assetDifference)">
                <div>{{ t('field.differenceAmount') }}: {{ formatNumber(record.assetDifference) }}</div>
                <div class="usdt-value">({{ formatNumber(record.assetDifferenceUsdt) }} U)</div>
                <ExclamationCircleOutlined v-if="record.assetDifference < 0" style="margin-left: 4px" />
              </div>
            </div>
          </template>

          <!-- 淨資產差額 -->
          <template v-if="column.key === 'netAssetDifference'">
            <div :class="getDifferenceClass(record.netAssetDifference)">
              <div>{{ formatNumber(record.netAssetDifference) }}</div>
              <div class="usdt-value">({{ formatNumber(record.differenceUsdt) }} U)</div>
              <ExclamationCircleOutlined v-if="record.netAssetDifference < 0" style="margin-left: 4px" />
            </div>
          </template>

          <!-- 24小時交易均價 -->
          <template v-if="column.key === 'avgPrice24h'">
            <span class="number-cell price-cell">{{ formatPrice(record.avgPrice24h) }}</span>
          </template>

          <!-- 走勢 -->
          <template v-if="column.key === 'trend'">
            <div class="trend-sparkline" @click="showTrendModal(record)">
              <svg width="120" height="40" viewBox="0 0 120 40">
                <polyline
                  :points="generateSparklinePoints(record.trendData)"
                  fill="none"
                  stroke="#1890ff"
                  stroke-width="2"
                />
              </svg>
            </div>
          </template>

          <!-- 更新時間 -->
          <template v-if="column.key === 'updateTime'">
            <span class="time-cell">{{ formatDateTime(record.updateTime) }}</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 走勢彈窗 -->
    <a-modal
      v-model:open="trendModalVisible"
      :title="`${selectedRecord?.currency} ${t('field.trend')}`"
      width="800px"
      :footer="null"
    >
      <div v-if="trendModalVisible" class="trend-chart-container">
        <div ref="chartRef" style="width: 100%; height: 400px"></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import {
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import type { AssetMonitorData } from '@/types/assetMonitor'
import mockData from '@/mock/monitor/AssetMonitor/assetMonitor.mock.json'
import zhMessages from '@/locales/monitor/AssetMonitor/zh.json'
import enMessages from '@/locales/monitor/AssetMonitor/en.json'

// 多語言設定
const { t, locale } = useI18n({
  messages: {
    zh: zhMessages,
    en: enMessages
  }
})

// 資料狀態
const tableData = ref<AssetMonitorData[]>([])
const loading = ref(false)
const lastUpdateTime = ref<string>('')
const searchText = ref<string>('')
const selectedMerchant = ref<string>('Fameex')

// 商戶選項
const merchantOptions = computed(() => [
  {
    label: 'Fameex',
    value: 'Fameex'
  },
  {
    label: 'Topone',
    value: 'Topone'
  }
])

// 表格欄位定義
const columns = computed(() => [
  {
    title: t('field.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 100,
    fixed: 'left'
  },
  {
    title: t('field.chainHoldings'),
    dataIndex: 'chainHoldings',
    key: 'chainHoldings',
    width: 300,
    align: 'left'
  },
  {
    title: t('field.userHoldings'),
    dataIndex: 'userHoldings',
    key: 'userHoldings',
    width: 180,
    align: 'right'
  },
  {
    title: t('field.projectHoldings'),
    dataIndex: 'projectHoldings',
    key: 'projectHoldings',
    width: 180,
    align: 'right'
  },
  {
    title: t('field.assetDifference'),
    dataIndex: 'assetDifference',
    key: 'assetDifference',
    width: 180,
    align: 'right',
    sorter: (a: AssetMonitorData, b: AssetMonitorData) => a.assetDifference - b.assetDifference
  },
  {
    title: t('field.netAssetDifference'),
    dataIndex: 'netAssetDifference',
    key: 'netAssetDifference',
    width: 150,
    align: 'right',
    sorter: (a: AssetMonitorData, b: AssetMonitorData) => a.netAssetDifference - b.netAssetDifference
  },
  {
    title: t('field.avgPrice24h'),
    dataIndex: 'avgPrice24h',
    key: 'avgPrice24h',
    width: 150,
    align: 'right'
  },
  {
    title: t('field.trend'),
    dataIndex: 'trendData',
    key: 'trend',
    width: 150,
    align: 'center'
  },
  {
    title: t('field.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  }
])

// 篩選後的資料
const filteredData = computed(() => {
  let data = [...tableData.value]

  // 按幣種搜尋
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    data = data.filter(item => item.currency.toLowerCase().includes(search))
  }

  return data
})

// 初始化資料
const initData = () => {
  tableData.value = mockData as AssetMonitorData[]
  lastUpdateTime.value = new Date().toISOString()
}

// 刷新資料（模擬網路延遲）
const handleRefresh = async () => {
  loading.value = true
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 800))
  // 重新載入 mock 資料
  tableData.value = [...mockData] as AssetMonitorData[]
  lastUpdateTime.value = new Date().toISOString()
  loading.value = false
}

// 搜尋
const handleSearch = () => {
  // 搜尋邏輯已在 computed 中處理
}

// 格式化鏈路持有量總計
const formatChainTotal = (chainHoldings: Record<string, number>): string => {
  const total = Object.values(chainHoldings).reduce((sum, amount) => sum + amount, 0)
  return `總計: ${formatNumber(total)}`
}

// 取得鏈路顏色
const getChainColor = (chain: string): string => {
  const colorMap: Record<string, string> = {
    'ETH': 'geekblue',
    'BSC': 'gold',
    'TRON': 'red',
    'POLYGON': 'purple',
    'SOLANA': 'cyan',
    'AVALANCHE': 'orange',
    'ARBITRUM': 'blue',
    'OPTIMISM': 'magenta'
  }
  return colorMap[chain] || 'cyan'
}

// 數字格式化（千分位 + 8位小數）
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(value)
}

// 價格格式化（24小時交易均價，依價格大小決定小數位數）
const formatPrice = (value: number): string => {
  if (value >= 1000) {
    // 價格 >= 1000，顯示 2 位小數
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  } else if (value >= 1) {
    // 價格 >= 1 且 < 1000，顯示 4 位小數
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  } else if (value >= 0.01) {
    // 價格 >= 0.01 且 < 1，顯示 6 位小數
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value)
  } else {
    // 價格 < 0.01，顯示 8 位小數
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value)
  }
}

// 日期時間格式化
const formatDateTime = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 資產差額樣式
const getDifferenceClass = (value: number): string => {
  if (value > 0) return 'difference-positive'
  if (value < 0) return 'difference-negative'
  return 'difference-zero'
}

// 走勢縮圖點位生成
const generateSparklinePoints = (data: number[]): string => {
  if (!data || data.length === 0) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 120
  const height = 40
  const padding = 5

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

// 走勢彈窗狀態
const trendModalVisible = ref(false)
const selectedRecord = ref<AssetMonitorData | null>(null)
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 顯示走勢彈窗
const showTrendModal = (record: AssetMonitorData) => {
  selectedRecord.value = record
  trendModalVisible.value = true
}

// 初始化圖表
const initChart = () => {
  if (!chartRef.value || !selectedRecord.value) return

  // 銷毀舊實例
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 創建新實例
  chartInstance = echarts.init(chartRef.value)

  const data = selectedRecord.value.trendData
  const xAxisData = data.map((_, index) => `${index + 1}`)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const value = params[0].value
        return `${t('field.trend')}: ${formatNumber(value)}`
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
      data: xAxisData,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatNumber(value)
      }
    },
    series: [
      {
        name: selectedRecord.value.currency,
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          opacity: 0.1
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 監聽彈窗狀態變化
watch(trendModalVisible, async (newVal) => {
  if (newVal && selectedRecord.value) {
    await nextTick()
    initChart()
  }
})

// 組件掛載時初始化資料
onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
.asset-monitor {
  padding: 24px;

  .header-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 18px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        align-items: center;
      }
    }

    .update-time {
      margin-top: 12px;
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .table-card {
    .currency-cell {
      font-weight: 600;
      font-size: 14px;
    }

    .number-cell {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
    }

    .price-cell {
      color: #1890ff;
      font-weight: 500;
    }

    .chain-holdings-cell {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;

      .chain-total {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 8px;
        color: #1890ff;
      }

      .chain-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        :deep(.ant-tag) {
          margin: 0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 11px;
        }
      }
    }

    .time-cell {
      font-size: 13px;
      color: #595959;
    }

    // 資產差額欄位樣式
    .asset-difference-cell {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;

      .reserve-amount {
        color: #8c8c8c;
        margin-bottom: 4px;
      }

      .difference-positive,
      .difference-negative,
      .difference-zero {
        margin-top: 4px;
      }
    }

    // 資產差額樣式
    .difference-positive {
      color: #52c41a;
      font-weight: 500;

      .usdt-value {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 2px;
      }
    }

    .difference-negative {
      color: #ff4d4f;
      font-weight: 500;

      .usdt-value {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 2px;
      }
    }

    .difference-zero {
      color: #8c8c8c;

      .usdt-value {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 2px;
      }
    }

    // 走勢縮圖樣式
    .trend-sparkline {
      cursor: pointer;
      display: inline-block;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }

      svg {
        display: block;
      }
    }
  }

  // 走勢圖表容器
  .trend-chart-container {
    padding: 20px 0;
  }
}

// 響應式設計
@media (max-width: 1200px) {
  .asset-monitor {
    padding: 16px;

    .header-card {
      .card-header {
        flex-direction: column;
        align-items: flex-start;

        .header-actions {
          margin-top: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }
  }
}
</style>
