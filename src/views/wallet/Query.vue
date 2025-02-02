<template>
  <div class="wallet-query">
    <!-- 查詢表單 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('title.queryCondition') }}</span>
      </template>
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item :label="t('field.merchant')" class="form-item">
          <merchant-select 
            v-model="queryParams.merchant" 
            :placeholder="t('prompt.selectMerchant')"
            :style="{ width: '180px' }" 
          />
        </a-form-item>
        <a-form-item :label="t('field.chainType')" class="form-item">
          <chain-type-select 
            v-model="queryParams.chainType" 
            :placeholder="t('prompt.selectChainType')"
            :style="{ width: '180px' }" 
          />
        </a-form-item>
        <a-form-item :label="t('field.currency')" class="form-item">
          <currency-select 
            v-model="queryParams.currency" 
            :placeholder="t('prompt.selectCurrency')"
            :style="{ width: '180px' }" 
          />
        </a-form-item>
        <a-form-item :label="t('field.walletType')" class="form-item">
          <wallet-type-select 
            v-model="queryParams.walletType" 
            :placeholder="t('prompt.selectWalletType')"
            :style="{ width: '180px' }" 
          />
        </a-form-item>
        <a-form-item :label="t('field.address')" class="form-item">
          <a-input
            v-model:value="queryParams.address"
            :placeholder="t('prompt.pleaseInputAddress')"
            :style="{ width: '300px' }"
            allow-clear
          />
        </a-form-item>
        <a-form-item class="form-item">
          <a-button type="primary" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            {{ t('action.search') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 錢包列表卡片 -->
    <a-card :bordered="false" :bodyStyle="{ padding: '20px 24px' }" class="table-card">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span class="card-title">{{ t('title.walletList') }}</span>
          <a-button type="primary" @click="showAddWalletModal">
            <template #icon><PlusOutlined /></template>
            {{ t('action.addWallet') }}
          </a-button>
        </div>
      </template>
      
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="{
            total: 100,
            pageSize: 20,
            showSizeChanger: false,
            showQuickJumper: true
          }"
          :bordered="true"
          :scroll="{ x: 1400 }"
          @change="handleTableChange"
        >
          <!-- 資產價值列自定義渲染 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'assetValue'">
              <span class="asset-value" v-html="formatNumberWithColor(record.assetValue)"></span>
            </template>
            <!-- 操作列自定義渲染 -->
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleDetail(record)">
                  {{ t('action.details') }}
                </a-button>
                <a-button type="link" size="small" @click="handleTransfer(record)">
                  {{ t('action.transfer') }}
                </a-button>
              </a-space>
            </template>
            <template v-else-if="column.key === 'address'">
              <span>
                {{ formatAddress(record.address) }}
                <CopyOutlined
                  class="copy-icon"
                  @click.stop="copyAddress(record.address)"
                />
              </span>
            </template>
            <template v-else-if="column.key === 'status'">
              <span :class="['status-tag', record.isDisabled ? 'status-disabled' : 'status-enabled']">
                {{ record.isDisabled ? t('status.disabled') : t('status.enabled') }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 新增錢包彈窗 -->
    <a-modal
      v-model:open="addWalletModalVisible"
      :title="t('prompt.addWallet')"
      @ok="handleAddWallet"
      @cancel="handleCancelAdd"
      :confirmLoading="confirmLoading"
    >
      <a-form
        :model="addWalletForm"
        :rules="addWalletRules"
        ref="addWalletFormRef"
        layout="vertical"
      >
        <!-- 鏈類型 -->
        <a-form-item :label="t('field.chainType')" name="chainType">
          <chain-type-select v-model="addWalletForm.chainType" />
        </a-form-item>

        <!-- 幣種 -->
        <a-form-item :label="t('field.currency')" name="currency">
          <currency-select v-model="addWalletForm.currency" />
        </a-form-item>

        <!-- 錢包類型 -->
        <a-form-item :label="t('field.walletType')" name="walletType">
          <wallet-type-select v-model="addWalletForm.walletType" @change="handleWalletTypeChange" />
        </a-form-item>

        <!-- 錢包地址（僅當選擇外轉錢包時顯示） -->
        <a-form-item
          v-if="addWalletForm.walletType === 'transfer'"
          :label="t('field.address')"
          name="address"
        >
          <a-input
            v-model:value="addWalletForm.address"
            :placeholder="t('prompt.pleaseInputAddress')"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined, ReloadOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import type { WalletRecord, TablePagination, TableSorter, QueryParams, AddWalletForm } from '@/types/wallet'
import type { TableColumnType } from 'ant-design-vue'
import MerchantSelect from '../../components/selectors/MerchantSelect.vue'
import WalletTypeSelect from '../../components/selectors/WalletTypeSelect.vue'
import ChainTypeSelect from '../../components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '../../components/selectors/CurrencySelect.vue'
import mockData from '@/mock/wallet/Query/query.mock.json'
import zhLocale from '@/locales/wallet/Query/zh.json'
import enLocale from '@/locales/wallet/Query/en.json'
import zhCommon from '@/locales/order/common/zh.json'
import enCommon from '@/locales/order/common/en.json'

// 合併翻譯，優先使用頁面特定的翻譯
const messages = {
  zh: {
    ...zhCommon,  // 先放公共翻譯
    ...zhLocale   // 後放頁面翻譯，這樣頁面翻譯會覆蓋公共翻譯中的同名鍵值
  },
  en: {
    ...enCommon,
    ...enLocale
  }
}

const { t } = useI18n({
  messages,
  legacy: false
})

const router = useRouter()

// 查詢參數
const queryParams = ref<QueryParams>({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  walletType: undefined,
  address: ''
})

// 狀態選項
const statusOptions = [
  { value: 'enabled', label: t('status.enabled') },
  { value: 'disabled', label: t('status.disabled') }
]

// 表格列配置
const columns: TableColumnType<WalletRecord>[] = [
  {
    title: t('field.walletId'),
    dataIndex: 'walletId',
    key: 'walletId',
    width: 150
  },
  {
    title: t('field.merchant'),
    dataIndex: 'merchant',
    key: 'merchant',
    width: 150
  },
  {
    title: t('field.userId'),
    dataIndex: 'userId',
    key: 'userId',
    width: 150
  },
  {
    title: t('field.walletType'),
    dataIndex: 'walletType',
    key: 'walletType',
    width: 150,
    customRender: ({ text }: { text: string }) => t(text)
  },
  {
    title: t('field.chainType'),
    dataIndex: 'chainType',
    key: 'chainType',
    width: 150
  },
  {
    title: t('field.currency'),
    dataIndex: 'currency',
    key: 'currency',
    width: 150
  },
  {
    title: t('field.address'),
    dataIndex: 'address',
    key: 'address',
    width: 300
  },
  {
    title: t('field.assetValue'),
    dataIndex: 'assetValue',
    key: 'assetValue',
    width: 280,
    align: 'right',
    customRender: ({ text }: { text: string }) => formatNumberWithColor(text)
  },
  {
    title: t('status.label'),
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: t('action.action'),
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 表格數據
const tableData = ref<WalletRecord[]>(mockData.walletList)

// 處理查詢
const handleQuery = () => {
  console.log('Query with params:', queryParams.value)
  const filteredData = mockData.walletList.filter((item: WalletRecord) => {
    if (queryParams.value.merchant && item.merchant !== queryParams.value.merchant) return false
    if (queryParams.value.chainType && item.chainType !== queryParams.value.chainType) return false
    if (queryParams.value.currency && item.currency !== queryParams.value.currency) return false
    if (queryParams.value.walletType && item.walletType !== queryParams.value.walletType) return false
    if (queryParams.value.address && !item.address.toLowerCase().includes(queryParams.value.address.toLowerCase())) return false
    return true
  })
  tableData.value = filteredData
}

// 處理表格變更
const handleTableChange = (
  pagination: TablePagination,
  filters: Record<string, (string | number)[] | null>,
  sorter: TableSorter
) => {
  console.log('Table change:', { pagination, filters, sorter })
}

// 格式化地址顯示
const formatAddress = (address: string) => {
  if (!address) return ''
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-6)}` : address
}

// 複製地址
const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

// 格式化數字顯示（帶顏色）
const formatNumberWithColor = (value: string | undefined) => {
  if (!value) return '0.00000000'
  
  const [intPart, decimalPart] = value.split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  let digitClass = 'digit-4'
  if (intPart.length >= 12) {
    digitClass = 'digit-12'
  } else if (intPart.length >= 8) {
    digitClass = 'digit-8'
  }
  
  return `<span class="${digitClass}">${formattedInt}</span><span class="decimal">.${decimalPart || '00000000'}</span>`
}

// 處理詳情按鈕點擊
const handleDetail = (record: WalletRecord) => {
  router.push('/wallet/detail')
}

// 處理轉賬按鈕點擊
const handleTransfer = (record: WalletRecord) => {
  router.push('/wallet/transfer')
}

// 顯示添加錢包彈窗
const showAddWalletModal = () => {
  addWalletModalVisible.value = true
}

// 新增錢包相關
const addWalletModalVisible = ref(false)
const confirmLoading = ref(false)
const addWalletFormRef = ref<FormInstance>()

// 新增錢包表單數據
const addWalletForm = reactive<AddWalletForm>({
  chainType: undefined,
  currency: undefined,
  walletType: undefined,
  address: '',
})

// 表單驗證規則
const addWalletRules = {
  chainType: [{ required: true, message: t('prompt.selectChainType') }],
  currency: [{ required: true, message: t('prompt.selectCurrency') }],
  walletType: [{ required: true, message: t('prompt.selectWalletType') }],
  address: [{ required: true, message: t('prompt.inputAddress'), trigger: 'blur' }],
}

// 處理錢包類型變更
const handleWalletTypeChange = (value: string | undefined): void => {
  if (value !== 'transfer') {
    addWalletForm.address = ''
  }
}

// 處理新增錢包
const handleAddWallet = async () => {
  try {
    if (addWalletFormRef.value) {
      await addWalletFormRef.value.validate()
      confirmLoading.value = true
      
      // TODO: 實現新增錢包的 API 調用
      console.log('新增錢包表單數據:', addWalletForm)
      
      // 模擬 API 調用
      setTimeout(() => {
        message.success(t('message.addSuccess'))
        addWalletModalVisible.value = false
        confirmLoading.value = false
        // 重置表單
        addWalletFormRef.value?.resetFields()
      }, 1000)
    }
  } catch (error) {
    console.error('表單驗證失敗:', error)
  }
}

// 取消新增
const handleCancelAdd = () => {
  addWalletModalVisible.value = false
  addWalletFormRef.value?.resetFields()
}
</script>

<style scoped>
.wallet-query {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
  background: #141414;
}

.wallet-query :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.wallet-query :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.wallet-query :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.wallet-query :deep(.ant-card-body) {
  background-color: #141414;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-item {
  margin: 0;
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

/* 地址欄位的省略樣式 */
:deep(.ant-table-cell-ellipsis) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.copy-icon {
  margin-left: 8px;
  color: var(--ant-primary-color);
  cursor: pointer;
  transition: all 0.3s;
}

.copy-icon:hover {
  opacity: 0.8;
}

/* 資產價值的顏色樣式 */
.asset-value {
  font-family: monospace;
  white-space: nowrap;
  font-size: 14px;
}

:deep(.digit-12) {
  color: #f5222d; /* 紅色：十億以上 */
}

:deep(.digit-8) {
  color: #faad14; /* 橙色：百萬到億 */
}

:deep(.digit-4) {
  color: #52c41a; /* 綠色：個位到十萬 */
}

:deep(.decimal) {
  color: #8c8c8c; /* 灰色：小數部分 */
}

:deep(.separator) {
  color: #8c8c8c; /* 灰色：分隔符 */
  margin: 0 1px;  /* 添加些微間距 */
}

.wallet-id {
  font-family: monospace;
  font-size: 14px;
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
:deep(.ant-select-selector) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-input:hover),
:deep(.ant-input:focus),
:deep(.ant-select-selector:hover),
:deep(.ant-select-selector:focus) {
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

.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

:deep(.status-enabled) {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

:deep(.status-disabled) {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

/* 新增錢包按鈕樣式 */
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
</style>