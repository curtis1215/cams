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
          <a-button type="primary" size="small" @click="showAlertSettingsModal">
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
          <div class="header-actions">
            <a-button type="primary" size="small" @click="showOperationRecordModal">
              <template #icon><HistoryOutlined /></template>
              {{ t('action.operationRecord') }}
            </a-button>
            <a-button type="primary" size="small" @click="showSettingModal">
              <template #icon><SettingOutlined /></template>
              {{ t('settings') }}
            </a-button>
          </div>
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

    <!-- 資產差額告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.assetDifference') }}</span>
          <a-button type="primary" size="small" @click="showAssetDifferenceSettingModal">
            <template #icon><SettingOutlined /></template>
            {{ t('settings') }}
          </a-button>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="assetDifferenceColumns"
          :data-source="assetDifferenceData"
          :pagination="pagination"
          :scroll="{ x: 1400 }"
          :bordered="true"
        >
        </a-table>
      </div>
    </a-card>

    <!-- 錢包異常告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.walletAbnormal') }}</span>
          <a-button type="primary" size="small" @click="showWalletAbnormalSettingModal">
            <template #icon><SettingOutlined /></template>
            {{ t('settings') }}
          </a-button>
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

    <!-- 風險地址入帳告警卡片 -->
    <a-card :bordered="false" class="alert-card" :bodyStyle="{ padding: '20px 24px' }">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ t('card.riskAddress') }}</span>
        </div>
      </template>

      <div class="table-container">
        <a-table
          :columns="riskAddressColumns"
          :data-source="riskAddressData"
          :pagination="pagination"
          :scroll="{ x: 1200 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fromAddress' || column.key === 'toAddress'">
              <span>{{ formatAddress(record[column.key]) }}</span>
              <a-button
                type="link"
                size="small"
                @click="copyAddress(record[column.key])"
              >
                <template #icon><CopyOutlined /></template>
              </a-button>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="primary" size="small" @click="handleRiskAction(record, 'approve')">
                  {{ t('action.approve') }}
                </a-button>
                <a-button type="default" size="small" @click="handleReturnAction(record)">
                  {{ t('action.return') }}
                </a-button>
              </a-space>
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

    <!-- 告警設置彈窗 -->
    <a-modal
      v-model:open="alertSettingsModalVisible"
      :title="t('modal.alertSettings')"
      :width="1000"
      :footer="null"
    >
      <!-- 篩選區域 -->
      <div class="filter-section">
        <a-form layout="inline" :model="alertSettingsQuery">
          <a-form-item :label="t('field.chain')">
            <a-select
              v-model:value="alertSettingsQuery.chain"
              :placeholder="t('prompt.selectChain')"
              :style="{ width: '200px' }"
              :options="chainOptions"
              allowClear
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleAlertSettingsSearch">
              <template #icon><SearchOutlined /></template>
              {{ t('action.search') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 表格區域 -->
      <div class="table-section">
        <div class="table-header">
          <a-button type="primary" @click="showAddAlertRuleModal">
            <template #icon><PlusOutlined /></template>
            {{ t('button.addAlertRule') }}
          </a-button>
        </div>
        <a-table
          :columns="alertSettingsColumns"
          :data-source="alertSettingsData"
          :pagination="alertSettingsPagination"
          :loading="alertSettingsLoading"
          @change="handleAlertSettingsTableChange"
          :scroll="{ x: 1000 }"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'alertItem'">
              <span>{{ t(`alertItem.${record.alertItem}`) }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="primary" size="small" @click="handleEditAlertRule(record)">
                  {{ t('column.edit') }}
                </a-button>
                <a-button danger size="small" @click="handleDeleteAlertRule(record)">
                  {{ t('column.delete') }}
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <!-- 新增/編輯告警規則彈窗 -->
    <a-modal
      v-model:open="alertRuleModalVisible"
      :title="alertRuleForm.id ? t('column.edit') : t('button.addAlertRule')"
      @ok="handleAlertRuleSubmit"
    >
      <a-form :model="alertRuleForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="t('field.chain')" required>
          <a-select
            v-model:value="alertRuleForm.chainName"
            :placeholder="t('prompt.selectChain')"
            :options="chainOptions"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item :label="t('column.alertItem')" required>
          <a-select
            v-model:value="alertRuleForm.alertItem"
            :placeholder="t('prompt.selectAlertItem')"
            :options="[
              { value: 'serviceHeight', label: t('alertItem.serviceHeight') },
              { value: 'nodeHeight', label: t('alertItem.nodeHeight') }
            ]"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item :label="t('column.alertThreshold')" required>
          <a-input-number
            v-model:value="alertRuleForm.alertThreshold"
            :min="1"
            :step="100"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item :label="t('column.alertDuration')" required>
          <a-input-number
            v-model:value="alertRuleForm.alertDuration"
            :min="1"
            :step="1"
            style="width: 100%"
          >
            <template #addonAfter>{{ t('unit.minutes') }}</template>
          </a-input-number>
        </a-form-item>
      </a-form>
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

    <!-- 錢包異常告警設置彈窗 -->
    <a-modal
      v-model:open="walletAbnormalSettingModalVisible"
      :title="t('modal.walletAbnormal')"
      @ok="handleWalletAbnormalSettingSave"
    >
      <a-form :model="walletAbnormalSettings" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
        <a-form-item :label="t('threshold.transferFailureCount')">
          <a-input-number
            v-model:value="walletAbnormalSettings.failureCount"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('unit.count') }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item :label="t('threshold.confirmationTimeout')">
          <a-input-number
            v-model:value="walletAbnormalSettings.confirmationTimeout"
            :min="1"
            :step="1"
            style="width: 150px"
          >
            <template #addonAfter>{{ t('unit.minutes') }}</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 風險地址操作彈窗 -->
    <a-modal
      v-model:open="riskActionModalVisible"
      :title="t('modal.riskAction')"
      @ok="handleRiskActionSubmit"
    >
      <a-form :model="riskActionForm" layout="vertical">
        <a-form-item :label="t('modal.actionReason')" required>
          <a-textarea
            v-model:value="riskActionForm.reason"
            :placeholder="t('modal.pleaseInputActionReason')"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 退回操作彈窗 -->
    <a-modal
      v-model:open="returnActionModalVisible"
      :title="t('modal.returnConfirm')"
      @ok="handleReturnActionSubmit"
    >
      <a-form :model="returnActionForm" layout="vertical">
        <a-form-item :label="t('modal.returnOptions')" required>
          <a-radio-group v-model:value="returnActionForm.returnType">
            <a-radio value="original">{{ t('modal.originalRoute') }}</a-radio>
            <a-radio value="custom">{{ t('modal.customAddress') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="returnActionForm.returnType === 'custom'"
          :label="t('modal.inputAddress')"
          required
        >
          <a-input
            v-model:value="returnActionForm.customAddress"
            :placeholder="t('modal.inputAddress')"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 資產差額告警配置彈窗 -->
    <a-modal
      v-model:open="assetDifferenceSettingModalVisible"
      :title="t('modal.assetDifference')"
      @ok="handleAssetDifferenceSettingSave"
      :width="800"
    >
      <a-table
        :columns="assetDifferenceConfigColumns"
        :data-source="assetDifferenceConfigData"
        :pagination="false"
        :bordered="true"
        :scroll="{ y: 400 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'configType'">
            <a-radio-group v-model:value="record.configType" size="small">
              <a-radio value="platform">{{ t('modal.followPlatform') }}</a-radio>
              <a-radio value="custom">{{ t('modal.customAmount') }}</a-radio>
            </a-radio-group>
          </template>
          <template v-else-if="column.key === 'customReserveAmount'">
            <a-input-number
              v-model:value="record.customReserveAmount"
              :disabled="record.configType === 'platform'"
              :min="0"
              :precision="2"
              :placeholder="t('modal.pleaseInputReserveAmount')"
              style="width: 100%"
            />
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 操作記錄彈窗 -->
    <a-modal
      v-model:open="operationRecordModalVisible"
      :title="t('modal.operationRecord')"
      :width="1000"
      :footer="null"
    >
      <!-- 查詢表單 -->
      <a-form layout="inline" :model="operationRecordQuery" class="search-form">
        <a-form-item :label="t('field.merchant')">
          <merchant-select
            v-model="operationRecordQuery.merchant"
            :style="{ width: '200px' }"
          />
        </a-form-item>
        <a-form-item :label="t('field.orderId')">
          <a-input
            v-model:value="operationRecordQuery.orderId"
            :placeholder="t('prompt.inputOrderId')"
            :style="{ width: '200px' }"
          />
        </a-form-item>
        <a-form-item :label="t('field.operator')">
          <a-input
            v-model:value="operationRecordQuery.operator"
            :placeholder="t('prompt.inputOperator')"
            :style="{ width: '200px' }"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleOperationRecordSearch">
            <template #icon><SearchOutlined /></template>
            {{ t('action.search') }}
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 表格 -->
      <a-table
        :columns="operationRecordColumns"
        :data-source="operationRecordData"
        :pagination="operationRecordPagination"
        :loading="operationRecordLoading"
        @change="handleOperationRecordTableChange"
        :scroll="{ x: 1200 }"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  SettingOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CopyOutlined,
  HistoryOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import mockData from '@/mock/monitor/Alert/alert.mock.json'
import alertSettingsMockData from '@/mock/monitor/Alert/alertSettings.mock.json'
import assetDifferenceAlertMockData from '@/mock/monitor/Alert/assetDifferenceAlert.mock.json'
import assetDifferenceConfigMockData from '@/mock/monitor/Alert/assetDifferenceConfig.mock.json'
import zhLocale from '@/locales/monitor/Alert/zh.json'
import enLocale from '@/locales/monitor/Alert/en.json'
import { useRouter } from 'vue-router'
import MerchantSelect from '@/components/selectors/MerchantSelect.vue'
import { TablePaginationConfig } from 'ant-design-vue'

interface AlertRecord {
  id: string
  orderId?: string
  transferId?: string
  walletId?: string
  merchant?: string
  chain: string
  coin?: string
  amount?: number
  duration?: number
  remainingLevel?: number
  confirmReason?: string
  operator?: string
  [key: string]: any
}

interface WalletAbnormalSettings {
  failureCount: number
  confirmationTimeout: number
}

// 定義操作記錄數據類型
interface OperationRecord {
  id: number
  merchant: string
  orderId: string
  chain: string
  coin: string
  amount: string
  confirmReason: string
  operator: string
  operateTime: string
}

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

const handleConfirm = (record: AlertRecord) => {
  confirmForm.orderId = record.orderId || ''
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

// 資產差額告警欄位定義
const assetDifferenceColumns = computed(() => [
  {
    title: t('column.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
  },
  {
    title: t('column.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 100,
  },
  {
    title: t('column.walletTotalHoldings'),
    dataIndex: 'walletTotalHoldings',
    key: 'walletTotalHoldings',
    width: 150,
  },
  {
    title: t('column.platformTotalHoldings'),
    dataIndex: 'platformTotalHoldings',
    key: 'platformTotalHoldings',
    width: 150,
  },
  {
    title: t('column.assetDifference'),
    dataIndex: 'assetDifference',
    key: 'assetDifference',
    width: 150,
  },
  {
    title: t('column.netAssetDifference'),
    dataIndex: 'netAssetDifference',
    key: 'netAssetDifference',
    width: 150,
  },
  {
    title: t('column.alertTime'),
    dataIndex: 'alertTime',
    key: 'alertTime',
    width: 180,
  },
])

const assetDifferenceData = computed(() => assetDifferenceAlertMockData.assetDifferenceAlertData || [])

// 資產差額告警配置欄位定義
const assetDifferenceConfigColumns = computed(() => [
  {
    title: t('column.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 120,
  },
  {
    title: t('modal.configType'),
    key: 'configType',
    width: 300,
  },
  {
    title: t('modal.reserveAmount'),
    key: 'customReserveAmount',
    width: 200,
  },
])

const isHeightColumn = (key: string) => {
  return ['serviceHeight', 'nodeHeight', 'chainHeight'].includes(key)
}

const handleOrderClick = (orderId: string) => {
  console.log('訂單點擊:', orderId)
  // 這裡可以添加訂單詳情的處理邏輯
}

const handleTransferClick = (transferId: string) => {
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

const removeHeightRule = (index: number) => {
  heightAlertRules.value.splice(index, 1)
}

const handleHeightSettingSave = () => {
  message.success(t('message.settingsSaved'))
  heightSettingModalVisible.value = false
}

const getRemainingLevelColor = computed(() => {
  return (level: number) => {
    if (level <= 20) return '#ff4d4f'  // 危險水位: ≤20%
    if (level <= 50) return '#faad14'  // 警告水位: ≤50%
    return '#52c41a'                   // 正常水位: >50%
  }
})

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

const handleWalletAction = (record: AlertRecord) => {
  walletActionForm.walletId = record.walletId || ''
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

const riskAddressColumns = computed(() => [
  {
    title: t('column.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
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
    title: t('column.fromAddress'),
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    width: 250,
  },
  {
    title: t('column.toAddress'),
    dataIndex: 'toAddress',
    key: 'toAddress',
    width: 250,
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
    width: 200,
    fixed: 'right'
  }
])

const riskAddressData = computed(() => mockData.riskAddressData || [])

const formatAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const copyAddress = (address: string) => {
  navigator.clipboard.writeText(address)
  message.success(t('message.copySuccess'))
}

const riskActionModalVisible = ref(false)
const riskActionForm = reactive({
  id: '',
  action: '',
  reason: ''
})

const handleRiskAction = (record: AlertRecord, action: 'approve' | 'lock') => {
  riskActionForm.id = record.id
  riskActionForm.action = action
  riskActionForm.reason = ''
  riskActionModalVisible.value = true
}

const handleRiskActionSubmit = () => {
  if (!riskActionForm.reason.trim()) {
    message.error(t('modal.pleaseInputActionReason'))
    return
  }

  // TODO: 調用API處理風險地址操作邏輯
  console.log('Risk address action:', riskActionForm)

  message.success(t('message.actionSuccess'))
  riskActionModalVisible.value = false
}

// 退回操作相關
const returnActionModalVisible = ref(false)
const returnActionForm = reactive({
  id: '',
  returnType: 'original',
  customAddress: ''
})

const handleReturnAction = (record: AlertRecord) => {
  returnActionForm.id = record.id
  returnActionForm.returnType = 'original'
  returnActionForm.customAddress = ''
  returnActionModalVisible.value = true
}

const handleReturnActionSubmit = () => {
  if (returnActionForm.returnType === 'custom' && !returnActionForm.customAddress.trim()) {
    message.error(t('modal.inputAddress'))
    return
  }

  // TODO: 調用API處理退回操作邏輯
  console.log('Return action:', returnActionForm)

  message.success(t('message.actionSuccess'))
  returnActionModalVisible.value = false
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
  },
  {
    title: t('statistics.riskAddress'),
    under30: riskAddressData.value.filter(item => item.duration < 30).length,
    between30And60: riskAddressData.value.filter(item => item.duration >= 30 && item.duration < 60).length,
    over60: riskAddressData.value.filter(item => item.duration >= 60).length
  }
])

const pagination = {
  pageSize: 5,
  showSizeChanger: false,
  showQuickJumper: false,
  showTotal: (total: number) => t('pagination.total', { total })
}

// 錢包異常告警設置
const walletAbnormalSettingModalVisible = ref(false)
const walletAbnormalSettings = reactive({
  failureCount: 3,
  confirmationTimeout: 30
})

const showWalletAbnormalSettingModal = () => {
  walletAbnormalSettingModalVisible.value = true
}

const handleWalletAbnormalSettingSave = () => {
  // TODO: 調用API保存設置
  message.success(t('message.settingsSaved'))
  walletAbnormalSettingModalVisible.value = false
}

// 資產差額告警設置
const assetDifferenceSettingModalVisible = ref(false)
const assetDifferenceConfigData = ref(assetDifferenceConfigMockData.assetDifferenceConfig.map(item => ({ ...item })))

const showAssetDifferenceSettingModal = () => {
  // 重新載入配置資料
  assetDifferenceConfigData.value = assetDifferenceConfigMockData.assetDifferenceConfig.map(item => ({ ...item }))
  assetDifferenceSettingModalVisible.value = true
}

const handleAssetDifferenceSettingSave = () => {
  // 驗證自訂保留額度輸入
  const hasInvalidInput = assetDifferenceConfigData.value.some(item => {
    if (item.configType === 'custom' && (item.customReserveAmount === null || item.customReserveAmount === undefined)) {
      return true
    }
    return false
  })

  if (hasInvalidInput) {
    message.error(t('modal.pleaseInputReserveAmount'))
    return
  }

  // TODO: 調用API保存設置
  console.log('Save asset difference settings:', assetDifferenceConfigData.value)
  message.success(t('message.settingsSaved'))
  assetDifferenceSettingModalVisible.value = false
}

// 操作記錄相關數據
const operationRecordModalVisible = ref(false)
const operationRecordQuery = ref({
  merchant: undefined,
  orderId: '',
  operator: ''
})

const operationRecordData = ref<OperationRecord[]>([])
const operationRecordLoading = ref(false)
const operationRecordPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => t('pagination.total', { total })
})

const operationRecordColumns = [
  {
    title: t('column.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120
  },
  {
    title: t('column.orderId'),
    dataIndex: 'orderId',
    key: 'orderId',
    width: 150
  },
  {
    title: t('column.chain'),
    dataIndex: 'chain',
    key: 'chain',
    width: 100
  },
  {
    title: t('column.coin'),
    dataIndex: 'coin',
    key: 'coin',
    width: 100
  },
  {
    title: t('column.amount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 120
  },
  {
    title: t('column.confirmReason'),
    dataIndex: 'confirmReason',
    key: 'confirmReason',
    width: 200
  },
  {
    title: t('column.operator'),
    dataIndex: 'operator',
    key: 'operator',
    width: 120
  },
  {
    title: t('column.time'),
    dataIndex: 'operateTime',
    key: 'operateTime',
    width: 180
  }
]

// 加載操作記錄數據
const loadOperationRecordData = async () => {
  try {
    operationRecordLoading.value = true
    // 導入 mock 數據
    const mockData = (await import('@/mock/monitor/Alert/operationRecord.mock.json')).default
    operationRecordData.value = mockData.list
    operationRecordPagination.total = mockData.total
  } catch (error) {
    console.error('Load operation record data failed:', error)
  } finally {
    operationRecordLoading.value = false
  }
}

// 處理操作記錄查詢
const handleOperationRecordSearch = () => {
  operationRecordPagination.current = 1
  loadOperationRecordData()
}

// 處理操作記錄表格變更
const handleOperationRecordTableChange = (pag: TablePaginationConfig) => {
  operationRecordPagination.current = pag.current || 1
  operationRecordPagination.pageSize = pag.pageSize || 10
  loadOperationRecordData()
}

// 顯示操作記錄彈窗
const showOperationRecordModal = () => {
  operationRecordModalVisible.value = true
  loadOperationRecordData()
}

// 告警設置相關數據
interface AlertSettingRecord {
  id: string
  chainName: string
  alertItem: string
  alertThreshold: number
  alertDuration: number
  lastEditTime: string
}

const alertSettingsModalVisible = ref(false)
const alertSettingsQuery = ref({
  chain: undefined
})

const alertSettingsData = ref<AlertSettingRecord[]>([])
const alertSettingsLoading = ref(false)
const alertSettingsPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => t('pagination.total', { total })
})

const chainOptions = computed(() => alertSettingsMockData.chainOptions)

const alertSettingsColumns = computed(() => [
  {
    title: t('column.chainName'),
    dataIndex: 'chainName',
    key: 'chainName',
    width: 120
  },
  {
    title: t('column.alertItem'),
    dataIndex: 'alertItem',
    key: 'alertItem',
    width: 120
  },
  {
    title: t('column.alertThreshold'),
    dataIndex: 'alertThreshold',
    key: 'alertThreshold',
    width: 120
  },
  {
    title: t('column.alertDuration'),
    dataIndex: 'alertDuration',
    key: 'alertDuration',
    width: 120
  },
  {
    title: t('column.lastEditTime'),
    dataIndex: 'lastEditTime',
    key: 'lastEditTime',
    width: 180
  },
  {
    title: t('column.action'),
    key: 'action',
    width: 150,
    fixed: 'right'
  }
])

// 告警規則表單
const alertRuleModalVisible = ref(false)
const alertRuleForm = reactive({
  id: '',
  chainName: '',
  alertItem: '',
  alertThreshold: 300,
  alertDuration: 7
})

// 加載告警設置數據
const loadAlertSettingsData = async () => {
  try {
    alertSettingsLoading.value = true
    // 模擬API調用
    const filteredData = alertSettingsMockData.alertSettingsData.filter(item => {
      if (alertSettingsQuery.value.chain && item.chainName !== alertSettingsQuery.value.chain) {
        return false
      }
      return true
    })
    alertSettingsData.value = filteredData
    alertSettingsPagination.total = filteredData.length
  } catch (error) {
    console.error('Load alert settings data failed:', error)
  } finally {
    alertSettingsLoading.value = false
  }
}

// 處理告警設置查詢
const handleAlertSettingsSearch = () => {
  alertSettingsPagination.current = 1
  loadAlertSettingsData()
}

// 處理告警設置表格變更
const handleAlertSettingsTableChange = (pag: TablePaginationConfig) => {
  alertSettingsPagination.current = pag.current || 1
  alertSettingsPagination.pageSize = pag.pageSize || 10
  loadAlertSettingsData()
}

// 顯示告警設置彈窗
const showAlertSettingsModal = () => {
  alertSettingsModalVisible.value = true
  loadAlertSettingsData()
}

// 顯示新增告警規則彈窗
const showAddAlertRuleModal = () => {
  alertRuleForm.id = ''
  alertRuleForm.chainName = ''
  alertRuleForm.alertItem = ''
  alertRuleForm.alertThreshold = 300
  alertRuleForm.alertDuration = 7
  alertRuleModalVisible.value = true
}

// 處理編輯告警規則
const handleEditAlertRule = (record: AlertSettingRecord) => {
  alertRuleForm.id = record.id
  alertRuleForm.chainName = record.chainName
  alertRuleForm.alertItem = record.alertItem
  alertRuleForm.alertThreshold = record.alertThreshold
  alertRuleForm.alertDuration = record.alertDuration
  alertRuleModalVisible.value = true
}

// 處理刪除告警規則
const handleDeleteAlertRule = (record: AlertSettingRecord) => {
  // TODO: 調用API刪除告警規則
  console.log('Delete alert rule:', record)
  message.success(t('message.deleteSuccess'))
  loadAlertSettingsData()
}

// 處理告警規則提交
const handleAlertRuleSubmit = () => {
  if (!alertRuleForm.chainName || !alertRuleForm.alertItem) {
    message.error(t('message.pleaseInputReason'))
    return
  }
  
  // TODO: 調用API保存告警規則
  console.log('Save alert rule:', alertRuleForm)
  message.success(alertRuleForm.id ? t('message.editSuccess') : t('message.settingsSaved'))
  alertRuleModalVisible.value = false
  loadAlertSettingsData()
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

.header-actions {
  display: flex;
  gap: 8px;
}

.operation-record-filter {
  margin-bottom: 16px;
}

.operation-record-table {
  margin-top: 16px;
}

/* 告警設置彈窗樣式 */
.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #1f1f1f;
  border-radius: 6px;
  border: 1px solid #303030;
}

.table-section {
  margin-top: 16px;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

/* 深色模式表格樣式 */
:deep(.ant-table) {
  background-color: #141414;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #1f1f1f;
  border-color: #303030;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-table-tbody > tr > td) {
  background-color: #141414;
  border-color: #303030;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #1f1f1f;
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}
</style>