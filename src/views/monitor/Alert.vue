<template>
  <div class="alert-monitor">
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <span class="card-title">{{ $t('nodeHeightAlert') }}</span>
      </template>
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="alertData"
          :pagination="false"
          :scroll="{ x: 1000 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'alertReason'">
              <a-tag :color="record.severity === 'high' ? 'red' : 'orange'">
                {{ record.alertReason }}
              </a-tag>
            </template>
            <template v-else-if="isHeightColumn(column.key)">
              <span :class="{ 'height-warning': record.isWarning }">
                {{ record[column.key] }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('withdrawDurationAlert') }}</span>
          <a-button type="primary" size="small" @click="showDurationSettingModal">
            <SettingOutlined />
            {{ $t('settings') }}
          </a-button>
        </div>
      </template>
      <div class="table-container">
        <a-table
          :columns="withdrawColumns"
          :data-source="withdrawAlertData"
          :pagination="false"
          :scroll="{ x: 1200 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'alertReason'">
              <a-tag :color="record.status === 'processing' ? 'orange' : 'red'">
                {{ record.alertReason }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'orderId'">
              <a @click="handleOrderClick(record.orderId)">{{ record.orderId }}</a>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('largeAmountAlert') }}</span>
          <a-button type="primary" size="small" @click="showSettingModal">
            <SettingOutlined />
            {{ $t('settings') }}
          </a-button>
        </div>
      </template>
      <div class="table-container">
        <a-table
          :columns="largeAmountColumns"
          :data-source="largeAmountData"
          :pagination="false"
          :scroll="{ x: 1200 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'orderId'">
              <a @click="handleOrderClick(record.orderId)">{{ record.orderId }}</a>
            </template>
            <template v-if="column.key === 'amount'">
              <span>{{ record.amount }} {{ record.coin }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="settingModalVisible"
      :title="$t('alertSettings')"
      @ok="handleSettingSave"
    >
      <a-form :model="alertSettings" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="$t('depositAlertThreshold')">
          <a-input-number
            v-model:value="alertSettings.depositThreshold"
            :min="0"
            :step="100"
            style="width: 200px"
          >
            <template #addonAfter>USDT</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="$t('withdrawAlertThreshold')">
          <a-input-number
            v-model:value="alertSettings.withdrawThreshold"
            :min="0"
            :step="100"
            style="width: 200px"
          >
            <template #addonAfter>USDT</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="durationSettingModalVisible"
      :title="$t('withdrawDurationSettings')"
      @ok="handleDurationSettingSave"
    >
      <a-form :model="durationSettings" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
        <a-form-item :label="$t('processingTimeout')">
          <a-input-number
            v-model:value="durationSettings.processingDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ $t('minutes') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="$t('waitingTimeout')">
          <a-input-number
            v-model:value="durationSettings.waitingDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ $t('minutes') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="$t('notifyTimeout')">
          <a-input-number
            v-model:value="durationSettings.notifyDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ $t('minutes') }}</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { SettingOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()

const columns = [
  {
    title: t('chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 120,
  },
  {
    title: t('serviceHeight'),
    dataIndex: 'serviceHeight',
    key: 'serviceHeight',
    width: 150,
  },
  {
    title: t('nodeHeight'),
    dataIndex: 'nodeHeight',
    key: 'nodeHeight',
    width: 150,
  },
  {
    title: t('chainHeight'),
    dataIndex: 'chainHeight',
    key: 'chainHeight',
    width: 150,
  },
  {
    title: t('alertReason'),
    dataIndex: 'alertReason',
    key: 'alertReason',
    width: 300,
  },
]

const alertData = [
  {
    key: '1',
    chain: 'TRON',
    serviceHeight: '5238961',
    nodeHeight: '5238456',
    chainHeight: '5239261',
    alertReason: t('serviceHeightBehind'),
    severity: 'high',
    isWarning: true,
  },
  {
    key: '2',
    chain: 'ETH',
    serviceHeight: '18645732',
    nodeHeight: '18645432',
    chainHeight: '18646032',
    alertReason: t('nodeHeightBehind'),
    severity: 'medium',
    isWarning: true,
  },
  {
    key: '3',
    chain: 'BTC',
    serviceHeight: '7891234',
    nodeHeight: '7890934',
    chainHeight: '7891534',
    alertReason: t('serviceHeightBehind'),
    severity: 'high',
    isWarning: true,
  },
]

const isHeightColumn = (key) => {
  return ['serviceHeight', 'nodeHeight', 'chainHeight'].includes(key)
}

const withdrawColumns = [
  {
    title: t('merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('orderId'),
    dataIndex: 'orderId',
    key: 'orderId',
    width: 200,
  },
  {
    title: t('chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
  },
  {
    title: t('createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: t('alertReason'),
    dataIndex: 'alertReason',
    key: 'alertReason',
    width: 200,
  },
]

const withdrawAlertData = [
  {
    key: '1',
    merchant: 'Merchant A',
    orderId: 'WD202403150001',
    chain: 'ETH',
    coin: 'USDT',
    createTime: '2024-03-15 10:30:25',
    alertReason: t('processingTimeout'),
    status: 'processing'
  },
  {
    key: '2',
    merchant: 'Merchant B',
    orderId: 'WD202403150002',
    chain: 'TRON',
    coin: 'USDT',
    createTime: '2024-03-15 10:15:10',
    alertReason: t('waitingTimeout'),
    status: 'waiting'
  },
  {
    key: '3',
    merchant: 'Merchant C',
    orderId: 'WD202403150003',
    chain: 'BTC',
    coin: 'BTC',
    createTime: '2024-03-15 10:00:05',
    alertReason: t('processingTimeout'),
    status: 'processing'
  },
]

const handleOrderClick = (orderId) => {
  console.log('訂單點擊:', orderId)
  // 這裡可以添加訂單詳情的處理邏輯
}

const largeAmountColumns = [
  {
    title: t('merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('orderId'),
    dataIndex: 'orderId',
    key: 'orderId',
    width: 200,
  },
  {
    title: t('chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
  },
  {
    title: t('amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
  },
  {
    title: t('usdtValue'),
    dataIndex: 'usdtValue',
    key: 'usdtValue',
    width: 150,
  },
  {
    title: t('userId'),
    dataIndex: 'userId',
    key: 'userId',
    width: 150,
  },
]

const largeAmountData = [
  {
    key: '1',
    merchant: 'Merchant A',
    orderId: 'D202403150001',
    chain: 'ETH',
    coin: 'ETH',
    amount: '2.5',
    usdtValue: '5000',
    userId: 'U123456',
  },
  {
    key: '2',
    merchant: 'Merchant B',
    orderId: 'W202403150002',
    chain: 'BTC',
    coin: 'BTC',
    amount: '0.15',
    usdtValue: '8000',
    userId: 'U234567',
  },
]

const settingModalVisible = ref(false)
const alertSettings = reactive({
  depositThreshold: 3000,
  withdrawThreshold: 3000,
})

const showSettingModal = () => {
  settingModalVisible.value = true
}

const handleSettingSave = () => {
  // 這裡添加保存設置的邏輯
  message.success(t('settingsSaved'))
  settingModalVisible.value = false
}

const durationSettingModalVisible = ref(false)
const durationSettings = reactive({
  processingDuration: 15,
  waitingDuration: 15,
  notifyDuration: 30,
})

const showDurationSettingModal = () => {
  durationSettingModalVisible.value = true
}

const handleDurationSettingSave = () => {
  message.success(t('settingsSaved'))
  durationSettingModalVisible.value = false
}
</script>

<style scoped>
.alert-monitor {
  padding: 24px;
}

.alert-card {
  margin-bottom: 24px;
  background: var(--ant-bg-elevated) !important;
}

.card-title {
  color: var(--ant-color-text);
  font-weight: 600;
  font-size: 16px;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

.height-warning {
  color: #ff4d4f;
  font-weight: bold;
}

:deep(.ant-card) {
  border-radius: 8px;
}

:deep(.ant-card-head) {
  min-height: 40px;
  padding: 0 24px;
  color: var(--ant-color-text);
  background: transparent;
  border-bottom: 1px solid var(--ant-border-color-split);
}

:deep(.ant-card-body) {
  background: transparent;
}

:deep(.ant-table) {
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background: #141414;
  color: var(--ant-color-text);
  border-bottom: 1px solid var(--ant-border-color-split);
}

:deep(.ant-table-tbody > tr > td) {
  background: transparent;
  border-bottom: 1px solid var(--ant-border-color-split);
}

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: var(--ant-table-row-hover-bg);
}

:deep(.ant-table-container) {
  border: 1px solid var(--ant-border-color-split);
  border-radius: 8px;
}

:deep(.ant-table-cell) {
  border-right: 1px solid var(--ant-border-color-split) !important;
}

:deep(.ant-table-cell:last-child) {
  border-right: none !important;
}

:deep(.ant-table-thead > tr:first-child > th:first-child) {
  border-top-left-radius: 8px;
}

:deep(.ant-table-thead > tr:first-child > th:last-child) {
  border-top-right-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 