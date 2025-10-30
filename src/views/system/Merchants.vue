<template>
  <div class="merchants-container">
    <!-- 查詢卡片 -->
    <a-card :title="t('title.queryCondition')" :bordered="false" class="filter-card">
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item :label="t('field.name')" class="form-item">
          <a-input
            v-model:value="queryParams.name"
            :placeholder="t('prompt.inputName')"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item :label="t('field.status')" class="form-item">
          <a-select
            v-model:value="queryParams.status"
            :placeholder="t('prompt.selectStatus')"
            style="width: 200px"
            allow-clear
          >
            <a-select-option value="active">{{ t('status.active') }}</a-select-option>
            <a-select-option value="inactive">{{ t('status.inactive') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="form-item">
          <a-button type="primary" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            {{ t('action.search') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :title="t('title.merchantManagement')" :bordered="false" class="table-card">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          {{ t('action.add') }}
        </a-button>
      </template>

      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          rowKey="id"
          :pagination="pagination"
          :bordered="true"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="handleEdit(record)">
                  {{ t('action.edit') }}
                </a-button>
                <a-button type="link" @click="handleCurrencyManagement(record)">
                  {{ t('action.currencyManagement') }}
                </a-button>
              </a-space>
            </template>
            <template v-else-if="column.key === 'status'">
              <span :class="['status-tag', record.status === 'active' ? 'status-enabled' : 'status-disabled']">
                {{ t(`status.${record.status}`) }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="800px"
    >
      <a-tabs v-model:activeKey="activeTabKey">
        <!-- 商戶資訊分頁 -->
        <a-tab-pane :key="1" :tab="t('title.merchantInfo')">
          <a-form
            ref="formRef"
            :model="formState"
            :rules="rules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-form-item :label="t('field.name')" name="name">
              <a-input v-model:value="formState.name" :placeholder="t('prompt.inputName')" />
            </a-form-item>
            <a-form-item :label="t('field.code')" name="code">
              <a-input v-model:value="formState.code" :placeholder="t('prompt.inputCode')" />
            </a-form-item>
            <a-form-item :label="t('field.status')" name="status">
              <a-select v-model:value="formState.status" :placeholder="t('prompt.selectStatus')">
                <a-select-option value="active">{{ t('status.active') }}</a-select-option>
                <a-select-option value="inactive">{{ t('status.inactive') }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('field.privateKey')" name="privateKey">
              <a-input-group compact>
                <a-input
                  v-model:value="formState.privateKey"
                  :placeholder="t('field.privateKey')"
                  style="width: calc(100% - 110px)"
                  readonly
                />
                <a-button type="primary" @click="generatePrivateKey">
                  {{ t('action.generateKey') }}
                </a-button>
              </a-input-group>
            </a-form-item>
            <a-form-item :label="t('field.retryCount')" name="retryCount">
              <a-input-number
                v-model:value="formState.retryCount"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 商戶權限分頁 -->
        <a-tab-pane :key="2" :tab="t('title.merchantPermission')">
          <a-form
            :model="formState"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
          >
            <!-- 充幣設置 -->
            <a-form-item :label="t('field.depositStatus')" name="depositStatus">
              <a-select v-model:value="formState.depositStatus" :placeholder="t('prompt.selectStatus')">
                <a-select-option :value="true">{{ t('status.active') }}</a-select-option>
                <a-select-option :value="false">{{ t('status.inactive') }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('field.depositNotifyUrl')" name="depositNotifyUrl">
              <a-input
                v-model:value="formState.depositNotifyUrl"
                :placeholder="t('prompt.inputDepositNotifyUrl')"
              />
            </a-form-item>

            <!-- 提幣設置 -->
            <a-form-item :label="t('field.withdrawStatus')" name="withdrawStatus">
              <a-select v-model:value="formState.withdrawStatus" :placeholder="t('prompt.selectStatus')">
                <a-select-option :value="true">{{ t('status.active') }}</a-select-option>
                <a-select-option :value="false">{{ t('status.inactive') }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('field.withdrawNotifyUrl')" name="withdrawNotifyUrl">
              <a-input
                v-model:value="formState.withdrawNotifyUrl"
                :placeholder="t('prompt.inputWithdrawNotifyUrl')"
              />
            </a-form-item>

            <!-- Swap設置 -->
            <a-form-item :label="t('field.swapStatus')" name="swapStatus">
              <a-select v-model:value="formState.swapStatus" :placeholder="t('prompt.selectStatus')">
                <a-select-option :value="true">{{ t('status.active') }}</a-select-option>
                <a-select-option :value="false">{{ t('status.inactive') }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('field.swapNotifyUrl')" name="swapNotifyUrl">
              <a-input
                v-model:value="formState.swapNotifyUrl"
                :placeholder="t('prompt.inputSwapNotifyUrl')"
              />
            </a-form-item>
            <a-form-item :label="t('field.swapSlippage')" name="swapSlippage">
              <a-input-number
                v-model:value="formState.swapSlippage"
                :min="0"
                :max="100"
                :step="0.1"
                :precision="1"
                style="width: 100%"
                :placeholder="t('prompt.inputSwapSlippage')"
                addon-after="%"
              />
            </a-form-item>

            <!-- LP設置 -->
            <a-form-item :label="t('field.lpStatus')" name="lpStatus">
              <a-select v-model:value="formState.lpStatus" :placeholder="t('prompt.selectStatus')">
                <a-select-option :value="true">{{ t('status.active') }}</a-select-option>
                <a-select-option :value="false">{{ t('status.inactive') }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('field.lpNotifyUrl')" name="lpNotifyUrl">
              <a-input
                v-model:value="formState.lpNotifyUrl"
                :placeholder="t('prompt.inputLpNotifyUrl')"
              />
            </a-form-item>
            <a-form-item :label="t('field.lpSlippage')" name="lpSlippage">
              <a-input-number
                v-model:value="formState.lpSlippage"
                :min="0"
                :max="100"
                :step="0.1"
                :precision="1"
                style="width: 100%"
                :placeholder="t('prompt.inputLpSlippage')"
                addon-after="%"
              />
            </a-form-item>

            <!-- 通知txHash網址 -->
            <a-form-item :label="t('field.txHashNotifyUrl')" name="txHashNotifyUrl">
              <a-input
                v-model:value="formState.txHashNotifyUrl"
                :placeholder="t('prompt.inputTxHashNotifyUrl')"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 幣種管理彈窗 -->
    <a-modal
      v-model:open="currencyModalOpen"
      :title="currencyModalTitle"
      @ok="handleCurrencyModalOk"
      @cancel="handleCurrencyModalCancel"
      width="1000px"
      :bodyStyle="{ maxHeight: '700px', overflow: 'auto' }"
    >
      <div class="currency-management-container">
        <div class="currency-grid">
          <div class="select-all-wrapper">
            <a-checkbox
              :checked="isCurrencyAllSelected"
              :indeterminate="isCurrencyIndeterminate"
              @change="handleCurrencySelectAll"
            >
              {{ t('action.selectAll') }}
            </a-checkbox>
          </div>
          <div class="currency-columns">
            <!-- 左側鏈類型列表 -->
            <div class="chain-type-list">
              <div
                v-for="chainType in chainTypes"
                :key="chainType"
                class="chain-type-item"
                :class="{ active: selectedCurrencyChainType === chainType }"
                @click="handleCurrencyChainTypeClick(chainType)"
              >
                <span class="chain-type-name">{{ chainType }}</span>
                <a-checkbox
                  :checked="isCurrencyChainTypeSelected(chainType)"
                  :indeterminate="isCurrencyChainTypeIndeterminate(chainType)"
                  @click.stop="(e: Event) => handleCurrencyChainTypeSelect(e as unknown as CheckboxEvent, chainType)"
                />
              </div>
            </div>
            <!-- 右側幣種列表 -->
            <div class="currency-list">
              <div class="currency-list-header">
                {{ selectedCurrencyChainType }} {{ t('field.currencies') }}
              </div>
              <div class="currency-list-content">
                <div class="currency-config-list">
                  <div
                    v-for="currency in getCurrenciesByChainType(selectedCurrencyChainType)"
                    :key="currency.value"
                    class="currency-config-item"
                  >
                    <div class="currency-header">
                      <a-checkbox
                        :checked="merchantCurrencyConfig[currency.value]?.enabled || false"
                        @change="(e) => handleCurrencyToggle(currency.value, e.target.checked)"
                      >
                        {{ currency.label }}
                      </a-checkbox>
                    </div>
                    <div class="currency-settings" v-if="merchantCurrencyConfig[currency.value]?.enabled">
                      <div class="storage-limit-config">
                        <a-checkbox
                          :checked="merchantCurrencyConfig[currency.value]?.enableStorageLimit || false"
                          @change="(e) => handleStorageLimitToggle(currency.value, e.target.checked)"
                        >
                          {{ t('field.configStorageLimit') }}
                        </a-checkbox>
                      </div>
                      <div class="setting-row-inline" v-if="merchantCurrencyConfig[currency.value]?.enableStorageLimit">
                        <div class="setting-field">
                          <label class="setting-label">{{ t('field.collectionWalletLimit') }}</label>
                          <a-input-number
                            :value="merchantCurrencyConfig[currency.value]?.collectionWalletLimit || 0"
                            @update:value="(value) => updateCurrencyConfig(currency.value, 'collectionWalletLimit', value)"
                            :min="0"
                            :precision="4"
                            size="small"
                            :placeholder="t('prompt.inputCollectionWalletLimit')"
                            style="width: 100%"
                          />
                        </div>
                        <div class="setting-field">
                          <label class="setting-label">{{ t('field.withdrawWalletLimit') }}</label>
                          <a-input-number
                            :value="merchantCurrencyConfig[currency.value]?.withdrawWalletLimit || 0"
                            @update:value="(value) => updateCurrencyConfig(currency.value, 'withdrawWalletLimit', value)"
                            :min="0"
                            :precision="4"
                            size="small"
                            :placeholder="t('prompt.inputWithdrawWalletLimit')"
                            style="width: 100%"
                          />
                        </div>
                      </div>
                      <div class="wallet-alert-config">
                        <a-checkbox
                          :checked="merchantCurrencyConfig[currency.value]?.enableWalletAlert || false"
                          @change="(e) => handleWalletAlertToggle(currency.value, e.target.checked)"
                        >
                          {{ t('field.configWalletAlert') }}
                        </a-checkbox>
                      </div>
                      <div class="setting-row-inline" v-if="merchantCurrencyConfig[currency.value]?.enableWalletAlert">
                        <div class="setting-field">
                          <label class="setting-label">{{ t('field.collectionWalletAlertThreshold') }}</label>
                          <a-input-number
                            :value="merchantCurrencyConfig[currency.value]?.collectionWalletAlertThreshold || 0"
                            @update:value="(value) => updateCurrencyConfig(currency.value, 'collectionWalletAlertThreshold', value)"
                            :min="0"
                            :max="100"
                            :precision="0"
                            size="small"
                            :placeholder="t('prompt.inputCollectionWalletAlertThreshold')"
                            addon-after="%"
                            style="width: 100%"
                          />
                        </div>
                        <div class="setting-field">
                          <label class="setting-label">{{ t('field.withdrawWalletAlertThreshold') }}</label>
                          <a-input-number
                            :value="merchantCurrencyConfig[currency.value]?.withdrawWalletAlertThreshold || 0"
                            @update:value="(value) => updateCurrencyConfig(currency.value, 'withdrawWalletAlertThreshold', value)"
                            :min="0"
                            :max="100"
                            :precision="0"
                            size="small"
                            :placeholder="t('prompt.inputWithdrawWalletAlertThreshold')"
                            addon-after="%"
                            style="width: 100%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import zhLocale from '@/locales/system/Merchant/zh.json'
import enLocale from '@/locales/system/Merchant/en.json'
import mockData from '@/mock/system/Merchant/query.mock.json'
import currencyData from '@/mock/system/Merchant/currencies.mock.json'

interface MerchantRecord {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive'
  updateTime: string
  privateKey?: string
  retryCount: number
  depositStatus: boolean
  withdrawStatus: boolean
  swapStatus: boolean
  lpStatus: boolean
  depositNotifyUrl: string
  withdrawNotifyUrl: string
  swapNotifyUrl: string
  lpNotifyUrl: string
  swapSlippage: number
  lpSlippage: number
  txHashNotifyUrl: string
  availableCurrencies: string[]
}

interface PaginationEvent {
  current: number
  pageSize: number
}

interface CheckboxEvent {
  target: {
    checked: boolean
  }
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

const columns = [
  {
    title: t('field.name'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: t('field.code'),
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: t('field.status'),
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: t('field.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: t('field.action'),
    key: 'action',
    fixed: 'right',
    width: 200,
  },
]

// 定義幣種和鏈類型的關係（共用）
const chainTypes = ['BSC', 'ETH', 'TRX', 'BTC']
const currencyMap = {
  BSC: ['USDT', 'USDC', 'BUSD', 'DAI'],
  ETH: ['USDT', 'USDC', 'DAI'],
  TRX: ['USDT', 'USDC'],
  BTC: ['BTC']
}

// 幣種管理相關變數
const selectedCurrencyChainType = ref(chainTypes[0])
const merchantCurrencyConfig = ref<Record<string, any>>({})

// 查詢參數
const queryParams = reactive({
  name: '',
  status: undefined,
})

const dataSource = ref(mockData.merchantList)
const loading = ref(false)
const modalOpen = ref(false)
const modalTitle = ref('')
const formRef = ref()
const activeTabKey = ref(1)
const currencies = ref(currencyData.currencies)

// 幣種管理彈窗
const currencyModalOpen = ref(false)
const currencyModalTitle = ref('')
const currentMerchantId = ref('')

const formState = reactive<MerchantRecord>({
  id: '',
  name: '',
  code: '',
  status: 'active',
  updateTime: '',
  retryCount: 3,
  depositStatus: true,
  withdrawStatus: true,
  swapStatus: true,
  lpStatus: true,
  depositNotifyUrl: '',
  withdrawNotifyUrl: '',
  swapNotifyUrl: '',
  lpNotifyUrl: '',
  swapSlippage: 0.5,
  lpSlippage: 0.5,
  txHashNotifyUrl: '',
  availableCurrencies: []
})

const rules = {
  name: [
    { required: true, message: t('validation.nameRequired') },
  ],
  code: [
    { required: true, message: t('validation.codeRequired') },
  ],
  status: [
    { required: true, message: t('validation.statusRequired') },
  ],
  retryCount: [
    { required: true, message: t('validation.retryCountRequired') },
  ],
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

const generatePrivateKey = () => {
  // 生成32位隨機字符串作為私鑰
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let privateKey = ''
  for (let i = 0; i < 32; i++) {
    privateKey += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formState.privateKey = privateKey
  message.success(t('message.generateKeySuccess'))
}

const handleQuery = () => {
  const filteredData = mockData.merchantList.filter(item => {
    if (queryParams.name && !item.name.includes(queryParams.name)) return false
    if (queryParams.status && item.status !== queryParams.status) return false
    return true
  })
  dataSource.value = filteredData
}

const handleAdd = () => {
  modalTitle.value = t('title.addMerchant')
  Object.assign(formState, {
    id: '',
    name: '',
    code: '',
    status: 'active',
    updateTime: '',
    retryCount: 3,
    depositStatus: true,
    withdrawStatus: true,
    swapStatus: true,
    lpStatus: true,
    depositNotifyUrl: '',
    withdrawNotifyUrl: '',
    swapNotifyUrl: '',
    lpNotifyUrl: '',
    swapSlippage: 0.5,
    lpSlippage: 0.5,
    txHashNotifyUrl: '',
    availableCurrencies: [],
  })
  modalOpen.value = true
  activeTabKey.value = 1
}

const handleEdit = (record: MerchantRecord) => {
  modalTitle.value = t('title.editMerchant')
  Object.assign(formState, {
    ...record,
    depositStatus: record.depositStatus ?? true,
    withdrawStatus: record.withdrawStatus ?? true,
    swapStatus: record.swapStatus ?? true,
    lpStatus: record.lpStatus ?? true,
    depositNotifyUrl: record.depositNotifyUrl ?? '',
    withdrawNotifyUrl: record.withdrawNotifyUrl ?? '',
    swapNotifyUrl: record.swapNotifyUrl ?? '',
    lpNotifyUrl: record.lpNotifyUrl ?? '',
    swapSlippage: record.swapSlippage ?? 0.5,
    lpSlippage: record.lpSlippage ?? 0.5,
    txHashNotifyUrl: record.txHashNotifyUrl ?? '',
    availableCurrencies: record.availableCurrencies ?? ['BSC_USDT', 'ETH_USDT', 'TRX_USDT'], // 模擬數據，使用新的格式
  })
  modalOpen.value = true
  activeTabKey.value = 1
}

// 幣種管理功能
const handleCurrencyManagement = (record: MerchantRecord) => {
  currencyModalTitle.value = t('title.currencyManagement') + ` - ${record.name}`
  currentMerchantId.value = record.id

  // 初始化幣種配置數據（模擬數據）
  const config: Record<string, any> = {}
  Object.entries(currencyMap).forEach(([chainType, currencies]) => {
    currencies.forEach(currency => {
      const key = `${chainType}_${currency}`
      const enableStorageLimit = Math.random() > 0.5
      const enableWalletAlert = Math.random() > 0.5
      config[key] = {
        enabled: Math.random() > 0.3, // 模擬啟用狀態
        enableStorageLimit: enableStorageLimit, // 是否配置儲存上限
        collectionWalletLimit: enableStorageLimit ? Math.floor(Math.random() * 10000) + 1000 : 0, // 歸集錢包儲存上限
        withdrawWalletLimit: enableStorageLimit ? Math.floor(Math.random() * 5000) + 500 : 0, // 出款錢包儲存上限
        enableWalletAlert: enableWalletAlert, // 是否配置錢包水位
        collectionWalletAlertThreshold: enableWalletAlert ? Math.floor(Math.random() * 30) + 70 : 0, // 歸集錢包告警水位比例 (70-100%)
        withdrawWalletAlertThreshold: enableWalletAlert ? Math.floor(Math.random() * 30) + 70 : 0 // 出款錢包告警水位比例 (70-100%)
      }
    })
  })
  merchantCurrencyConfig.value = config

  currencyModalOpen.value = true
}

const handleCurrencyModalOk = () => {
  // TODO: 保存幣種管理配置
  message.success(t('message.currencyConfigSaved'))
  currencyModalOpen.value = false
}

const handleCurrencyModalCancel = () => {
  currencyModalOpen.value = false
}

// 幣種管理的樹狀結構處理函數
const handleCurrencyChainTypeClick = (chainType: string) => {
  selectedCurrencyChainType.value = chainType
}

const handleCurrencyToggle = (currencyKey: string, checked: boolean) => {
  if (merchantCurrencyConfig.value[currencyKey]) {
    merchantCurrencyConfig.value[currencyKey].enabled = checked
  }
}

const handleStorageLimitToggle = (currencyKey: string, checked: boolean) => {
  if (merchantCurrencyConfig.value[currencyKey]) {
    merchantCurrencyConfig.value[currencyKey].enableStorageLimit = checked
    // 如果取消勾選，清空儲存上限值
    if (!checked) {
      merchantCurrencyConfig.value[currencyKey].collectionWalletLimit = 0
      merchantCurrencyConfig.value[currencyKey].withdrawWalletLimit = 0
    }
  }
}

const handleWalletAlertToggle = (currencyKey: string, checked: boolean) => {
  if (merchantCurrencyConfig.value[currencyKey]) {
    merchantCurrencyConfig.value[currencyKey].enableWalletAlert = checked
    // 如果取消勾選，清空告警水位比例值
    if (!checked) {
      merchantCurrencyConfig.value[currencyKey].collectionWalletAlertThreshold = 0
      merchantCurrencyConfig.value[currencyKey].withdrawWalletAlertThreshold = 0
    }
  }
}

const updateCurrencyConfig = (currencyKey: string, field: string, value: number) => {
  if (merchantCurrencyConfig.value[currencyKey]) {
    merchantCurrencyConfig.value[currencyKey][field] = value
  }
}

const isCurrencyChainTypeSelected = (chainType: string) => {
  const chainCurrencies = currencyMap[chainType as keyof typeof currencyMap].map(
    currency => `${chainType}_${currency}`
  )
  return chainCurrencies.every(currency =>
    merchantCurrencyConfig.value[currency]?.enabled
  )
}

const isCurrencyChainTypeIndeterminate = (chainType: string) => {
  const chainCurrencies = currencyMap[chainType as keyof typeof currencyMap].map(
    currency => `${chainType}_${currency}`
  )
  const selectedCount = chainCurrencies.filter(currency =>
    merchantCurrencyConfig.value[currency]?.enabled
  ).length
  return selectedCount > 0 && selectedCount < chainCurrencies.length
}

const handleCurrencyChainTypeSelect = (e: CheckboxEvent, chainType: string) => {
  const chainCurrencies = currencyMap[chainType as keyof typeof currencyMap].map(
    currency => `${chainType}_${currency}`
  )

  chainCurrencies.forEach(currency => {
    if (merchantCurrencyConfig.value[currency]) {
      merchantCurrencyConfig.value[currency].enabled = e.target.checked
    }
  })
}

const isCurrencyAllSelected = computed(() => {
  const configs = Object.values(merchantCurrencyConfig.value)
  if (configs.length === 0) return false
  return configs.every(config => config?.enabled)
})

const isCurrencyIndeterminate = computed(() => {
  const configs = Object.values(merchantCurrencyConfig.value)
  if (configs.length === 0) return false
  const enabledCount = configs.filter(config => config?.enabled).length
  return enabledCount > 0 && enabledCount < configs.length
})

const handleCurrencySelectAll = (e: CheckboxEvent) => {
  Object.keys(merchantCurrencyConfig.value).forEach(key => {
    if (merchantCurrencyConfig.value[key]) {
      merchantCurrencyConfig.value[key].enabled = e.target.checked
    }
  })
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    // TODO: Implement save logic
    message.success(t('message.saveSuccess'))
    modalOpen.value = false
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const handleModalCancel = () => {
  formRef.value?.resetFields()
  modalOpen.value = false
}

const handleTableChange = (pag: PaginationEvent) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    // 在實際應用中這裡會調用 API
    dataSource.value = mockData.merchantList
    loading.value = false
  } catch (error) {
    message.error(t('message.fetchError'))
    loading.value = false
  }
}

// 獲取特定鏈類型的幣種（共用）
const getCurrenciesByChainType = (chainType: string) => {
  return currencyMap[chainType as keyof typeof currencyMap].map(currency => ({
    label: currency,
    value: `${chainType}_${currency}`
  }))
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.merchants-container {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
  background: #141414;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-item {
  margin-bottom: 0;
}

.merchants-container :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.merchants-container :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.merchants-container :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.merchants-container :deep(.ant-card-body) {
  background-color: #141414;
}

.table-container {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
}

/* 表格內的按鈕樣式 */
:deep(.ant-btn-link) {
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
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

/* 表單元素深色模式樣式 */
:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-number),
:deep(.ant-input-number-input) {
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

:deep(.ant-select-dropdown) {
  background-color: #1f1f1f;
  border: 1px solid #303030;
}

:deep(.ant-select-item) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-select-item-option-active) {
  background-color: rgba(255, 255, 255, 0.08);
}

:deep(.ant-select-item-option-selected) {
  background-color: var(--ant-primary-1);
}

/* 狀態標籤樣式 */
.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-enabled {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

/* 彈窗樣式 */
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

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}

/* Tabs 樣式 */
:deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.65);
}

:deep(.ant-tabs-tab-active) {
  color: var(--ant-primary-color) !important;
}

:deep(.ant-tabs-ink-bar) {
  background: var(--ant-primary-color);
}

/* Checkbox 樣式 */
:deep(.ant-checkbox-wrapper) {
  color: rgba(255, 255, 255, 0.85);
}

.currency-columns {
  display: flex;
  gap: 24px;
  height: 300px;
}

.chain-type-list {
  flex: 0 0 200px;
  border-right: 1px solid #303030;
  overflow-y: auto;
}

.chain-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chain-type-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.chain-type-item.active {
  background-color: var(--ant-primary-1);
}

.chain-type-name {
  margin-right: 8px;
}

.currency-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.currency-list-header {
  padding: 12px 16px;
  font-weight: 500;
  border-bottom: 1px solid #303030;
}

.currency-list-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.currency-list-content :deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.currency-grid {
  background: #141414;
  border: 1px solid #303030;
  border-radius: 4px;
}

.select-all-wrapper {
  padding: 12px 16px;
  border-bottom: 1px solid #303030;
}

/* Switch 樣式 */
:deep(.ant-switch) {
  background-color: rgba(255, 77, 79, 0.5);
}

:deep(.ant-switch-checked) {
  background-color: var(--ant-primary-color);
}

/* 幣種管理樣式 */
.currency-management-container {
  padding: 16px 0;
}

.currency-config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.currency-config-item {
  border: 1px solid #303030;
  border-radius: 6px;
  padding: 12px;
  background: #1a1a1a;
}

.currency-header {
  margin-bottom: 12px;
}

.currency-settings {
  padding-left: 24px;
  margin-top: 12px;
}

.storage-limit-config {
  margin-bottom: 12px;
}

.wallet-alert-config {
  margin-top: 12px;
  margin-bottom: 12px;
}

.setting-row-inline {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-top: 12px;
}

.setting-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
}
</style> 