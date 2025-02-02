<template>
  <div class="node-height-monitor">
    <!-- 表格卡片 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div class="card-title-wrapper">
          <span class="card-title">{{ t('title.nodeHeightMonitor') }}</span>
          <a-button type="primary" size="small" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            {{ t('action.refresh') }}
          </a-button>
        </div>
      </template>
      
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="{
            total: tableData.length,
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true
          }"
          :bordered="true"
          :scroll="{ x: 1200 }"
        >
          <!-- 自定義渲染列 -->
          <template #bodyCell="{ column, record }">
            <!-- 節點區塊高度 -->
            <template v-if="column.key === 'nodeHeight'">
              <span>
                {{ record.nodeHeight }}
                <span class="diff-value" v-if="record.nodeHeightDiff < 0">
                  [{{ record.nodeHeightDiff }}]
                </span>
              </span>
            </template>
            <!-- 資料庫區塊高度 -->
            <template v-if="column.key === 'dbHeight'">
              <span>
                {{ record.dbHeight }}
                <span class="diff-value" v-if="record.dbHeightDiff < 0">
                  [{{ record.dbHeightDiff }}]
                </span>
              </span>
            </template>
            <!-- 更新時間 -->
            <template v-if="column.key === 'updateTime'">
              {{ formatDateTime(record.updateTime) }}
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { ReloadOutlined } from '@ant-design/icons-vue'
import mockData from '@/mock/monitor/nodeHeight.mock.json'

const { t } = useI18n({
  messages: {
    zh: {
      title: {
        nodeHeightMonitor: '節點高度監控'
      },
      field: {
        chainType: '鏈類型',
        nodeHeight: '節點區塊高度',
        dbHeight: '資料庫區塊高度',
        latestHeight: '鏈上最新高度',
        updateTime: '更新時間'
      },
      action: {
        refresh: '重新整理'
      }
    },
    en: {
      title: {
        nodeHeightMonitor: 'Node Height Monitor'
      },
      field: {
        chainType: 'Chain Type',
        nodeHeight: 'Node Block Height',
        dbHeight: 'DB Block Height',
        latestHeight: 'Latest Chain Height',
        updateTime: 'Update Time'
      },
      action: {
        refresh: 'Refresh'
      }
    }
  },
  legacy: false
})

// 表格列配置
const columns = [
  {
    title: t('field.chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 150
  },
  {
    title: t('field.nodeHeight'),
    dataIndex: 'nodeHeight',
    key: 'nodeHeight',
    width: 200,
    sorter: (a, b) => a.nodeHeightDiff - b.nodeHeightDiff
  },
  {
    title: t('field.dbHeight'),
    dataIndex: 'dbHeight',
    key: 'dbHeight',
    width: 200,
    sorter: (a, b) => a.dbHeightDiff - b.dbHeightDiff
  },
  {
    title: t('field.latestHeight'),
    dataIndex: 'latestHeight',
    key: 'latestHeight',
    width: 200
  },
  {
    title: t('field.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  }
]

// 表格數據
const tableData = ref(mockData.nodeHeightList)

// 格式化日期時間
const formatDateTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 處理重新整理
const handleRefresh = () => {
  // 在實際應用中，這裡會調用API重新獲取數據
  // 目前使用 mock 數據，所以只是重新賦值
  tableData.value = [...mockData.nodeHeightList]
}
</script>

<style scoped>
.node-height-monitor {
  padding: 24px;
}

.table-card {
  background: #141414;
}

.node-height-monitor :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.node-height-monitor :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.node-height-monitor :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.node-height-monitor :deep(.ant-card-body) {
  background-color: #141414;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

/* 深色模式表格樣式 */
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

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.08);
}

/* 分頁器樣式 */
:deep(.ant-pagination-item),
:deep(.ant-pagination-prev),
:deep(.ant-pagination-next),
:deep(.ant-pagination-jump-prev),
:deep(.ant-pagination-jump-next) {
  background: transparent;
  border-color: #303030;
}

:deep(.ant-pagination-item-active) {
  background: var(--ant-primary-color);
  border-color: var(--ant-primary-color);
}

:deep(.ant-pagination-item-active a) {
  color: #fff;
}

/* 差值樣式 */
.diff-value {
  color: #ff4d4f;
  margin-left: 4px;
}

.card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 