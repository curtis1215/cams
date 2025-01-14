<template>
  <div class="alert-monitor">
    <!-- 節點高度告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('nodeHeightAlert') }}</span>
          <a-button type="primary" size="small" @click="showHeightSettingModal">
            <template #icon><SettingOutlined /></template>
            {{ $t('settings') }}
          </a-button>
        </div>
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
              <span>
                {{ record[column.key] }}
                <template v-if="column.key === 'serviceHeight'">
                  <span class="height-diff">
                    [{{ Number(record.nodeHeight) - Number(record.serviceHeight) }}]
                  </span>
                </template>
                <template v-if="column.key === 'nodeHeight'">
                  <span class="height-diff">
                    [{{ Number(record.chainHeight) - Number(record.nodeHeight) }}]
                  </span>
                </template>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 提幣時長過久告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('withdrawDurationAlert') }}</span>
          <a-button type="primary" size="small" @click="showDurationSettingModal">
            <template #icon><SettingOutlined /></template>
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

    <!-- 大額充提幣告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('largeAmountAlert') }}</span>
          <a-button type="primary" size="small" @click="showSettingModal">
            <template #icon><SettingOutlined /></template>
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

    <!-- 設置彈窗 -->
    <a-modal
      v-model:open="settingModalVisible"
      :title="t('alertSettings')"
      @ok="handleSettingSave"
    >
      <a-form :model="alertSettings" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="t('depositAlertThreshold')">
          <a-input-number
            v-model:value="alertSettings.depositThreshold"
            :min="0"
            :step="100"
            style="width: 200px"
          >
            <template #addonAfter>USDT</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('withdrawAlertThreshold')">
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

    <!-- 提幣時長設置彈窗 -->
    <a-modal
      v-model:open="durationSettingModalVisible"
      :title="t('withdrawDurationSettings')"
      @ok="handleDurationSettingSave"
    >
      <a-form :model="durationSettings" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
        <a-form-item :label="t('processingTimeout')">
          <a-input-number
            v-model:value="durationSettings.processingDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('minutes') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('waitingTimeout')">
          <a-input-number
            v-model:value="durationSettings.waitingDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('minutes') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('notifyTimeout')">
          <a-input-number
            v-model:value="durationSettings.notifyDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('minutes') }}</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 節點高度告警設置彈窗 -->
    <a-modal
      v-model:open="heightSettingModalVisible"
      :title="t('nodeHeightAlertSettings')"
      @ok="handleHeightSettingSave"
      width="800px"
    >
      <div class="height-alert-settings">
        <div v-for="(rule, index) in heightAlertRules" :key="index" class="height-alert-rule">
          <div class="rule-content">
            <span>當</span>
            <a-select
              v-model:value="rule.type"
              style="width: 120px"
              :options="[
                { value: 'service', label: t('serviceHeight') },
                { value: 'node', label: t('nodeHeight') }
              ]"
            />
            <span>落後超過</span>
            <a-input-number
              v-model:value="rule.threshold"
              :min="1"
              style="width: 100px"
              :step="100"
            />
            <span>達</span>
            <a-input-number
              v-model:value="rule.duration"
              :min="1"
              style="width: 80px"
            />
            <span>分鐘</span>
          </div>
          <a-button type="text" danger @click="removeHeightRule(index)">
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </div>
        <div class="add-rule">
          <a-button type="dashed" block @click="addHeightRule">
            <template #icon><PlusOutlined /></template>
            {{ t('addRule') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SettingOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const { t } = useI18n()

const columns = computed(() => [
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
])

const alertData = [
  {
    key: '1',
    chain: 'TRON',
    serviceHeight: '5238456',
    nodeHeight: '5238961',
    chainHeight: '5239561',
    alertReason: t('serviceHeightBehind'),
    severity: 'high',
    isWarning: true,
  },
  {
    key: '2',
    chain: 'ETH',
    serviceHeight: '18645432',
    nodeHeight: '18645732',
    chainHeight: '18646332',
    alertReason: t('nodeHeightBehind'),
    severity: 'medium',
    isWarning: true,
  },
  {
    key: '3',
    chain: 'BTC',
    serviceHeight: '7890934',
    nodeHeight: '7891234',
    chainHeight: '7891834',
    alertReason: t('serviceHeightBehind'),
    severity: 'high',
    isWarning: true,
  },
  {
    key: '4',
    chain: 'EOS',
    serviceHeight: '9876243',
    nodeHeight: '9876543',
    chainHeight: '9877143',
    alertReason: t('nodeHeightBehind'),
    severity: 'medium',
    isWarning: true,
  },
  {
    key: '5',
    chain: 'BSC',
    serviceHeight: '4567590',
    nodeHeight: '4567890',
    chainHeight: '4568490',
    alertReason: t('serviceHeightBehind'),
    severity: 'high',
    isWarning: true,
  }
]

const withdrawColumns = computed(() => [
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
])

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
  {
    key: '4',
    merchant: 'Merchant D',
    orderId: 'WD202403150004',
    chain: 'EOS',
    coin: 'EOS',
    createTime: '2024-03-15 09:45:30',
    alertReason: t('waitingTimeout'),
    status: 'waiting'
  },
  {
    key: '5',
    merchant: 'Merchant E',
    orderId: 'WD202403150005',
    chain: 'BSC',
    coin: 'USDT',
    createTime: '2024-03-15 09:30:15',
    alertReason: t('processingTimeout'),
    status: 'processing'
  }
]

const largeAmountColumns = computed(() => [
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
])

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
  {
    key: '3',
    merchant: 'Merchant C',
    orderId: 'D202403150003',
    chain: 'TRON',
    coin: 'USDT',
    amount: '10000',
    usdtValue: '10000',
    userId: 'U345678',
  },
  {
    key: '4',
    merchant: 'Merchant D',
    orderId: 'W202403150004',
    chain: 'BSC',
    coin: 'BNB',
    amount: '25',
    usdtValue: '7500',
    userId: 'U456789',
  },
  {
    key: '5',
    merchant: 'Merchant E',
    orderId: 'D202403150005',
    chain: 'EOS',
    coin: 'EOS',
    amount: '5000',
    usdtValue: '6000',
    userId: 'U567890',
  }
]

const isHeightColumn = (key) => {
  return ['serviceHeight', 'nodeHeight', 'chainHeight'].includes(key)
}

const handleOrderClick = (orderId) => {
  console.log('訂單點擊:', orderId)
  // 這裡可以添加訂單詳情的處理邏輯
}

const settingModalVisible = ref(false)
const alertSettings = reactive({
  depositThreshold: 3000,
  withdrawThreshold: 3000,
})

const showSettingModal = () => {
  settingModalVisible.value = true
}

const handleSettingSave = () => {
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

const heightSettingModalVisible = ref(false)
const heightAlertRules = ref([
  {
    type: 'service',
    threshold: 300,
    duration: 7
  },
  {
    type: 'node',
    threshold: 300,
    duration: 240
  }
])

const showHeightSettingModal = () => {
  heightSettingModalVisible.value = true
}

const addHeightRule = () => {
  heightAlertRules.value.push({
    type: 'service',
    threshold: 300,
    duration: 7
  })
}

const removeHeightRule = (index) => {
  heightAlertRules.value.splice(index, 1)
}

const handleHeightSettingSave = () => {
  message.success(t('settingsSaved'))
  heightSettingModalVisible.value = false
}
</script>

<style scoped>
.alert-monitor {
  padding: 24px;
}

.alert-card {
  margin-bottom: 24px;
  background: #141414;
}

.alert-card :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.alert-card :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.alert-card :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.alert-card :deep(.ant-card-body) {
  background-color: #141414;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 深色模式表單元素樣式 */
:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-number) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-input:hover),
:deep(.ant-input:focus),
:deep(.ant-select-selector:hover),
:deep(.ant-select-selector:focus),
:deep(.ant-input-number:hover),
:deep(.ant-input-number:focus) {
  border-color: var(--ant-primary-color) !important;
}

:deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-modal-content),
:deep(.ant-modal-header) {
  background-color: #1f1f1f;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
}

.height-diff {
  font-size: 12px;
  color: #ff4d4f;
  margin-left: 4px;
}

/* 節點高度告警設置樣式 */
.height-alert-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.height-alert-rule {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1f1f1f;
  border-radius: 4px;
  border: 1px solid #303030;
}

.rule-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-rule {
  margin-top: 8px;
}

:deep(.ant-select-selector) {
  background-color: #141414 !important;
}

:deep(.ant-input-number) {
  background-color: #141414 !important;
}

:deep(.ant-btn-dashed) {
  border-color: #434343;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-btn-dashed:hover) {
  border-color: var(--ant-primary-color);
  color: var(--ant-primary-color);
}
</style> 