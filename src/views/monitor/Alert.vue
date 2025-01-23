<template>
  <div class="alert-monitor">
    <!-- 告警统计卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.alertStatistics') }}</span>
        </div>
      </template>
      <div class="statistics-container">
        <div v-for="(stat, index) in alertStatistics" :key="index" class="stat-item">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-numbers">
            <div class="number-value success">{{ stat.under30 }}</div>
            <div class="number-value warning">{{ stat.between30And60 }}</div>
            <div class="number-value error">{{ stat.over60 }}</div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 節點高度告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.nodeHeight') }}</span>
          <a-button type="primary" size="small" @click="showHeightSettingModal">
            <template #icon><SettingOutlined /></template>
            {{ t('settings') }}
          </a-button>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="alertData"
          :pagination="pagination"
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
          <span class="card-title">{{ t('card.withdrawDuration') }}</span>
          <a-button type="primary" size="small" @click="showDurationSettingModal">
            <template #icon><SettingOutlined /></template>
            {{ t('settings') }}
          </a-button>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="withdrawColumns"
          :data-source="withdrawAlertData"
          :pagination="pagination"
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
          <span class="card-title">{{ t('card.largeAmount') }}</span>
          <a-button type="primary" size="small" @click="showSettingModal">
            <template #icon><SettingOutlined /></template>
            {{ t('settings') }}
          </a-button>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="largeAmountColumns"
          :data-source="largeAmountData"
          :pagination="pagination"
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
            <template v-else-if="column.key === 'action'">
              <a-button type="primary" size="small" @click="handleConfirm(record)">
                {{ t('action.confirm') }}
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 未確認轉帳告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.unconfirmedTransfer') }}</span>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="unconfirmedColumns"
          :data-source="unconfirmedTransferData"
          :pagination="pagination"
          :scroll="{ x: 1000 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'transferId'">
              <a @click="handleTransferClick(record.transferId)">{{ record.transferId }}</a>
            </template>
            <template v-if="column.key === 'transferAmount'">
              <span>{{ record.transferAmount }} {{ record.coin }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 錢包水位告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.walletBalance') }}</span>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="walletBalanceColumns"
          :data-source="walletBalanceData"
          :pagination="pagination"
          :scroll="{ x: 1000 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'remainingLevel'">
              <span :style="{ color: getRemainingLevelColor(record.remainingLevel) }">
                {{ record.remainingLevel }}%
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 錢包異常告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.walletAbnormal') }}</span>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="walletAbnormalColumns"
          :data-source="walletAbnormalData"
          :pagination="pagination"
          :scroll="{ x: 1000 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'reason'">
              <a-tag :color="record.reason === 'monitor.transferFailure' ? 'red' : 'orange'">
                {{ t(`reason.${record.reason.split('.')[1]}`) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="primary" size="small" @click="handleWalletAction(record)">
                {{ t('column.action') }}
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 設置彈窗 -->
    <a-modal
      v-model:open="settingModalVisible"
      :title="t('modal.largeAmount')"
      @ok="handleSettingSave"
    >
      <a-form :model="alertSettings" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="t('threshold.deposit')">
          <a-input-number
            v-model:value="alertSettings.depositThreshold"
            :min="0"
            :step="100"
            style="width: 200px"
          >
            <template #addonAfter>USDT</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('threshold.withdraw')">
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
      :title="t('modal.withdrawDuration')"
      @ok="handleDurationSettingSave"
    >
      <a-form :model="durationSettings" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
        <a-form-item :label="t('threshold.processingTimeout')">
          <a-input-number
            v-model:value="durationSettings.processingDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('unit.minutes') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('threshold.waitingTimeout')">
          <a-input-number
            v-model:value="durationSettings.waitingDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('unit.minutes') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('threshold.notifyTimeout')">
          <a-input-number
            v-model:value="durationSettings.notifyDuration"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('unit.minutes') }}</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 節點高度告警設置彈窗 -->
    <a-modal
      v-model:open="heightSettingModalVisible"
      :title="t('modal.nodeHeight')"
      @ok="handleHeightSettingSave"
      width="800px"
    >
      <div class="height-alert-settings">
        <div v-for="(rule, index) in heightAlertRules" :key="index" class="height-alert-rule">
          <div class="rule-content">
            <span>{{ t('text.when') }}</span>
            <a-select
              v-model:value="rule.type"
              style="width: 120px"
              :options="[
                { value: 'service', label: t('text.serviceHeight') },
                { value: 'node', label: t('text.nodeHeight') }
              ]"
            />
            <span>{{ t('text.lagsBehind') }}</span>
            <a-input-number
              v-model:value="rule.threshold"
              :min="1"
              style="width: 100px"
              :step="100"
            />
            <span>{{ t('text.reaches') }}</span>
            <a-input-number
              v-model:value="rule.duration"
              :min="1"
              style="width: 80px"
            />
            <span>{{ t('unit.minutes') }}</span>
          </div>
          <a-button type="text" danger @click="removeHeightRule(index)">
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </div>
        <div class="add-rule">
          <a-button type="dashed" block @click="addHeightRule">
            <template #icon><PlusOutlined /></template>
            {{ t('button.addRule') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 確認彈窗 -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="t('modal.confirm')"
      @ok="handleConfirmSubmit"
    >
      <a-form :model="confirmForm" layout="vertical">
        <a-form-item :label="t('field.reason')" required>
          <a-textarea
            v-model:value="confirmForm.reason"
            :placeholder="t('prompt.pleaseInputConfirmReason')"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 錢包操作彈窗 -->
    <a-modal
      v-model:open="walletActionModalVisible"
      :title="t('modal.walletAction')"
      @ok="handleWalletActionSubmit"
    >
      <a-form :model="walletActionForm" layout="vertical">
        <a-form-item :label="t('column.action')" required>
          <a-radio-group v-model:value="walletActionForm.action">
            <a-radio value="unlock">{{ t('action.unlockWallet') }}</a-radio>
            <a-radio value="lock">{{ t('action.lockWallet') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('modal.actionReason')" required>
          <a-textarea
            v-model:value="walletActionForm.reason"
            :placeholder="t('modal.pleaseInputActionReason')"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SettingOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import mockData from '@/mock/monitor/Alert/alert.mock.json'
import zhLocale from '@/locales/monitor/Alert/zh.json'
import enLocale from '@/locales/monitor/Alert/en.json'
import { useRouter } from 'vue-router'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const router = useRouter()

const columns = computed(() => [
  {
    title: t('column.chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 120,
  },
  {
    title: t('column.serviceHeight'),
    dataIndex: 'serviceHeight',
    key: 'serviceHeight',
    width: 150,
  },
  {
    title: t('column.nodeHeight'),
    dataIndex: 'nodeHeight',
    key: 'nodeHeight',
    width: 150,
  },
  {
    title: t('column.chainHeight'),
    dataIndex: 'chainHeight',
    key: 'chainHeight',
    width: 150,
  },
  {
    title: t('column.alertReason'),
    dataIndex: 'alertReason',
    key: 'alertReason',
    width: 300,
  },
])

const alertData = computed(() => mockData.heightAlertData.map(item => ({
  ...item,
  alertReason: t(`reason.${item.alertReason.split('.')[1]}`)
})))

const withdrawColumns = computed(() => [
  {
    title: t('column.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('column.orderId'),
    dataIndex: 'orderId',
    key: 'orderId',
    width: 200,
  },
  {
    title: t('column.chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('column.coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
  },
  {
    title: t('column.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: t('column.alertReason'),
    dataIndex: 'alertReason',
    key: 'alertReason',
    width: 200,
  },
])

const withdrawAlertData = computed(() => mockData.withdrawAlertData.map(item => ({
  ...item,
  alertReason: t(`reason.${item.alertReason.split('.')[1]}`)
})))

const confirmModalVisible = ref(false)
const confirmForm = reactive({
  orderId: '',
  reason: ''
})

const handleConfirm = (record) => {
  confirmForm.orderId = record.orderId
  confirmForm.reason = ''
  confirmModalVisible.value = true
}

const handleConfirmSubmit = () => {
  if (!confirmForm.reason.trim()) {
    message.error(t('message.pleaseInputReason'))
    return
  }
  
  // TODO: 調用API處理確認邏輯
  console.log('Confirm order:', confirmForm)
  
  message.success(t('message.confirmSuccess'))
  confirmModalVisible.value = false
}

const largeAmountColumns = computed(() => [
  {
    title: t('column.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('column.orderId'),
    dataIndex: 'orderId',
    key: 'orderId',
    width: 200,
  },
  {
    title: t('column.chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('column.coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
  },
  {
    title: t('column.amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
  },
  {
    title: t('column.usdtValue'),
    dataIndex: 'usdtValue',
    key: 'usdtValue',
    width: 150,
  },
  {
    title: t('column.userId'),
    dataIndex: 'userId',
    key: 'userId',
    width: 150,
  },
  {
    title: t('column.action'),
    key: 'action',
    width: 120,
    fixed: 'right'
  }
])

const largeAmountData = computed(() => mockData.largeAmountData)

const unconfirmedTransferData = computed(() => mockData.unconfirmedTransferData)

const unconfirmedColumns = computed(() => [
  {
    title: t('column.transferId'),
    dataIndex: 'transferId',
    key: 'transferId',
    width: 200,
  },
  {
    title: t('column.walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 150,
  },
  {
    title: t('column.chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('column.coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
  },
  {
    title: t('column.transferAmount'),
    dataIndex: 'transferAmount',
    key: 'transferAmount',
    width: 150,
  },
  {
    title: t('column.time'),
    dataIndex: 'time',
    key: 'time',
    width: 180,
  },
])

const walletBalanceColumns = computed(() => [
  {
    title: t('column.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('column.walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 200,
  },
  {
    title: t('column.walletType'),
    dataIndex: 'walletType',
    key: 'walletType',
    width: 120,
  },
  {
    title: t('column.currentBalance'),
    dataIndex: 'currentBalance',
    key: 'currentBalance',
    width: 150,
  },
  {
    title: t('column.storageLimit'),
    dataIndex: 'storageLimit',
    key: 'storageLimit',
    width: 150,
  },
  {
    title: t('column.remainingLevel'),
    dataIndex: 'remainingLevel',
    key: 'remainingLevel',
    width: 150,
  },
])

const walletBalanceData = computed(() => mockData.walletBalanceData || [])

const isHeightColumn = (key) => {
  return ['serviceHeight', 'nodeHeight', 'chainHeight'].includes(key)
}

const handleOrderClick = (orderId) => {
  console.log('訂單點擊:', orderId)
  // 這裡可以添加訂單詳情的處理邏輯
}

const handleTransferClick = (transferId) => {
  router.push({
    path: '/order/transfer',
    query: { transferId }
  })
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
  message.success(t('message.settingsSaved'))
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
  message.success(t('message.settingsSaved'))
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
  message.success(t('message.settingsSaved'))
  heightSettingModalVisible.value = false
}

const getRemainingLevelColor = (level) => {
  if (level <= 20) return '#ff4d4f'
  if (level <= 50) return '#faad14'
  return '#52c41a'
}

const walletAbnormalColumns = computed(() => [
  {
    title: t('column.walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 200,
  },
  {
    title: t('column.walletType'),
    dataIndex: 'walletType',
    key: 'walletType',
    width: 120,
  },
  {
    title: t('column.chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
  },
  {
    title: t('column.coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100,
  },
  {
    title: t('column.reason'),
    dataIndex: 'reason',
    key: 'reason',
    width: 200,
  },
  {
    title: t('column.time'),
    dataIndex: 'time',
    key: 'time',
    width: 180,
  },
  {
    title: t('column.action'),
    key: 'action',
    width: 120,
    fixed: 'right'
  }
])

const walletAbnormalData = computed(() => mockData.walletAbnormalData)

const walletActionModalVisible = ref(false)
const walletActionForm = reactive({
  walletId: '',
  action: 'unlock',
  reason: ''
})

const handleWalletAction = (record) => {
  walletActionForm.walletId = record.walletId
  walletActionForm.action = 'unlock'
  walletActionForm.reason = ''
  walletActionModalVisible.value = true
}

const handleWalletActionSubmit = () => {
  if (!walletActionForm.reason.trim()) {
    message.error(t('modal.pleaseInputActionReason'))
    return
  }
  
  // TODO: 調用API處理錢包操作邏輯
  console.log('Wallet action:', walletActionForm)
  
  message.success(t('message.actionSuccess'))
  walletActionModalVisible.value = false
}

const alertStatistics = computed(() => [
  {
    title: t('statistics.nodeHeight'),
    under30: alertData.value.filter(item => item.duration < 30).length,
    between30And60: alertData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: alertData.value.filter(item => item.duration >= 60).length
  },
  {
    title: t('statistics.withdrawDuration'),
    under30: withdrawAlertData.value.filter(item => item.duration < 30).length,
    between30And60: withdrawAlertData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: withdrawAlertData.value.filter(item => item.duration >= 60).length
  },
  {
    title: t('statistics.largeAmount'),
    under30: largeAmountData.value.filter(item => item.duration < 30).length,
    between30And60: largeAmountData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: largeAmountData.value.filter(item => item.duration >= 60).length
  },
  {
    title: t('statistics.unconfirmedTransfer'),
    under30: unconfirmedTransferData.value.filter(item => item.duration < 30).length,
    between30And60: unconfirmedTransferData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: unconfirmedTransferData.value.filter(item => item.duration >= 60).length
  },
  {
    title: t('statistics.walletBalance'),
    under30: walletBalanceData.value.filter(item => item.duration < 30).length,
    between30And60: walletBalanceData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: walletBalanceData.value.filter(item => item.duration >= 60).length
  },
  {
    title: t('statistics.walletAbnormal'),
    under30: walletAbnormalData.value.filter(item => item.duration < 30).length,
    between30And60: walletAbnormalData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: walletAbnormalData.value.filter(item => item.duration >= 60).length
  }
])

const pagination = {
  pageSize: 5,
  showSizeChanger: false,
  showQuickJumper: false,
  showTotal: (total) => t('pagination.total', { total })
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

.statistics-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  flex: 0 0 calc(20% - 13px);  /* 5張卡片，每張佔20%寬度，減去間距 */
  min-width: 200px;
  background: #1f1f1f;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #303030;
}

.stat-title {
  font-size: 14px;  /* 調小字體大小 */
  font-weight: 500;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;  /* 防止標題換行 */
  overflow: hidden;
  text-overflow: ellipsis;  /* 超出部分顯示省略號 */
}

.stat-numbers {
  display: flex;
  gap: 8px;  /* 減小數字之間的間距 */
  justify-content: center;
  padding: 8px 0;
}

.number-value {
  font-size: 20px;  /* 調小數字大小 */
  font-weight: 600;
  min-width: 50px;  /* 減小最小寬度 */
  text-align: center;
  padding: 8px 12px;  /* 減小內邊距 */
  border-radius: 6px;
}

.number-value.success {
  background-color: rgba(82, 196, 26, 0.15);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.number-value.warning {
  background-color: rgba(250, 173, 20, 0.15);
  color: #faad14;
  border: 1px solid rgba(250, 173, 20, 0.3);
}

.number-value.error {
  background-color: rgba(255, 77, 79, 0.15);
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.3);
}

:deep(.ant-pagination) {
  margin-top: 16px;
  margin-bottom: 0;
}

:deep(.ant-pagination-item),
:deep(.ant-pagination-prev),
:deep(.ant-pagination-next) {
  background-color: #1f1f1f;
  border-color: #303030;
}

:deep(.ant-pagination-item-active) {
  border-color: var(--ant-primary-color);
}

:deep(.ant-pagination-item a),
:deep(.ant-pagination-item-active a) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-pagination-total-text) {
  color: rgba(255, 255, 255, 0.45);
}
</style>