<template>
  <div class="wallet-transfer">
    <a-row :gutter="24">
      <!-- 左側轉出錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card from-wallet">
          <template #title>
            <span class="card-title">{{ $t('fromWallet') }}</span>
          </template>
          <a-form layout="vertical" :model="fromWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('merchant') }}</div>
                <merchant-select v-model="fromWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('chainType') }}</div>
                <chain-type-select v-model="fromWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('currency') }}</div>
                <currency-select v-model="fromWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('address') }}</div>
                <a-input
                  v-model:value="fromWalletForm.address"
                  :placeholder="$t('pleaseInputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item class="query-button">
                <div class="form-label">&nbsp;</div>
                <a-button type="primary" @click="handleFromWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ $t('query') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右側轉入錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card to-wallet">
          <template #title>
            <span class="card-title">{{ $t('toWallet') }}</span>
          </template>
          <a-form layout="vertical" :model="toWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('merchant') }}</div>
                <merchant-select v-model="toWalletForm.merchant" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('chainType') }}</div>
                <chain-type-select v-model="toWalletForm.chainType" class="full-width" />
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('currency') }}</div>
                <currency-select v-model="toWalletForm.currency" class="full-width" />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ $t('address') }}</div>
                <a-input
                  v-model:value="toWalletForm.address"
                  :placeholder="$t('pleaseInputAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
              <a-form-item label="&nbsp;" class="query-button">
                <a-button type="primary" @click="handleToWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ $t('query') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 轉出錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card from-detail">
          <template #title>
            <span class="card-title">{{ $t('fromWalletDetail') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ $t('currency') }}</span>
              <span class="detail-value">{{ fromWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('balance') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('availableOutflow') }}</span>
              <span class="detail-value">{{ formatNumber(fromWalletDetail.availableOutflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 轉入錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card to-detail">
          <template #title>
            <span class="card-title">{{ $t('toWalletDetail') }}</span>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">{{ $t('currency') }}</span>
              <span class="detail-value">{{ toWalletDetail.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('balance') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('availableInflow') }}</span>
              <span class="detail-value">{{ formatNumber(toWalletDetail.availableInflow) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 轉帳資訊 -->
    <a-card :bordered="false" class="transfer-info">
      <template #title>
        <span class="card-title">{{ $t('transferInfo') }}</span>
      </template>
      <div class="transfer-amount-container">
        <a-form layout="inline">
          <a-form-item :label="$t('transferAmount')">
            <a-input-number
              v-model:value="transferAmount"
              :min="0"
              :max="maxAmount"
              :precision="8"
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="useMaxAmount" @change="handleMaxAmountChange">
              {{ $t('maxAmount') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleTransfer">
              {{ $t('transfer') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <!-- 轉帳確認彈窗 -->
    <a-modal
      v-model:visible="confirmModalVisible"
      :title="$t('confirmTransfer')"
      @ok="handleConfirmTransfer"
      @cancel="handleCancelTransfer"
      :confirmLoading="confirmLoading"
      width="600px"
    >
      <div class="confirm-content">
        <!-- 轉出資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ $t('fromWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('walletType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('chainType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('currency') }}</span>
              <span class="confirm-value">{{ fromWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('address') }}</span>
              <span class="confirm-value">{{ fromWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 轉帳數量卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <div class="amount-title">
              <span>{{ $t('transferAmount') }}：</span>
              <span class="amount-value">{{ formatNumber(transferAmount) }}</span>
            </div>
          </template>
        </a-card>

        <!-- 轉入資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ $t('toWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('walletType') }}</span>
              <span class="confirm-value">{{ toWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('chainType') }}</span>
              <span class="confirm-value">{{ toWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('currency') }}</span>
              <span class="confirm-value">{{ toWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ $t('address') }}</span>
              <span class="confirm-value">{{ toWalletForm.address }}</span>
            </div>
          </div>
        </a-card>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import MerchantSelect from '../../components/selectors/MerchantSelect.vue'
import ChainTypeSelect from '../../components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '../../components/selectors/CurrencySelect.vue'

const { t } = useI18n()

// 轉出錢包表單
const fromWalletForm = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

// 轉入錢包表單
const toWalletForm = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  address: ''
})

// 錢包詳情
const fromWalletDetail = reactive({
  currency: 'USDT',
  balance: '10000.00000000',
  availableOutflow: '8000.00000000'
})

const toWalletDetail = reactive({
  currency: 'USDT',
  balance: '5000.00000000',
  availableInflow: '15000.00000000'
})

// 轉帳相關
const transferAmount = ref(0)
const useMaxAmount = ref(false)
const maxAmount = computed(() => Number(fromWalletDetail.availableOutflow))

// 處理最大數量變更
const handleMaxAmountChange = (checked) => {
  if (checked) {
    transferAmount.value = maxAmount.value
  }
}

// 格式化數字
const formatNumber = (value) => {
  if (!value) return '0.00000000'
  return Number(value).toFixed(8)
}

// 處理轉出錢包查詢
const handleFromWalletQuery = () => {
  if (!fromWalletForm.address) {
    message.error(t('pleaseInputAddress'))
    return
  }
  // TODO: 實現查詢邏輯
  console.log('查詢轉出錢包:', fromWalletForm)
}

// 處理轉入錢包查詢
const handleToWalletQuery = () => {
  if (!toWalletForm.address) {
    message.error(t('pleaseInputAddress'))
    return
  }
  // TODO: 實現查詢邏輯
  console.log('查詢轉入錢包:', toWalletForm)
}

// 轉帳確認相關
const confirmModalVisible = ref(false)
const confirmLoading = ref(false)

// 處理轉帳按鈕點擊
const handleTransfer = () => {
  if (!fromWalletForm.address || !toWalletForm.address) {
    message.error(t('pleaseSelectFromAndToWallet'))
    return
  }

  if (!transferAmount.value) {
    message.error(t('pleaseInputTransferAmount'))
    return
  }

  // 顯示確認彈窗
  confirmModalVisible.value = true
}

// 處理確認轉帳
const handleConfirmTransfer = async () => {
  confirmLoading.value = true
  try {
    // TODO: 實現轉帳邏輯
    console.log('轉帳資訊:', {
      from: fromWalletForm,
      to: toWalletForm,
      amount: transferAmount.value
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 調用
    message.success(t('transferRequestSubmitted'))
    confirmModalVisible.value = false
  } catch (error) {
    message.error(t('transferFailed'))
  } finally {
    confirmLoading.value = false
  }
}

// 處理取消轉帳
const handleCancelTransfer = () => {
  confirmModalVisible.value = false
}
</script>

<style scoped>
@import '../../styles/common.css';

.wallet-transfer {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.transfer-card,
.detail-card {
  height: 252px;
}

.transfer-card :deep(.ant-card-head),
.detail-card :deep(.ant-card-head) {
  height: 56px;
  min-height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid #303030;
}

.transfer-card :deep(.ant-card-body),
.detail-card :deep(.ant-card-body) {
  height: 196px;
  padding: 20px 24px !important;
  overflow: auto;
}

.transfer-card :deep(.ant-form) {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
}

.transfer-card :deep(.ant-form-item) {
  margin: 0;
}

.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0;
}

.form-row .ant-form-item {
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.form-row .address-input {
  flex: 4;
  min-width: 300px;
}

.form-row .query-button {
  flex: 0 0 auto;
  min-width: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transfer-info {
  width: 100%;
}

.transfer-amount-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

:deep(.ant-form-item-label) {
  padding: 0;
}

.form-label {
  margin-bottom: 4px;
}

.full-width {
  width: 100% !important;
}

.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0;
}

.form-row .form-item {
  flex: 1;
  margin: 0;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-card {
  background: #1f1f1f;
  border: 1px solid #303030;
}

.confirm-card :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
  padding: 0 20px;
}

.confirm-card :deep(.ant-card-head-title) {
  padding: 12px 0;
}

.confirm-card :deep(.ant-card-body) {
  padding: 16px 20px;
  background-color: #141414;
}

.confirm-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.confirm-label {
  color: rgba(255, 255, 255, 0.45);
}

.confirm-value {
  color: rgba(255, 255, 255, 0.85);
  font-family: monospace;
}

.confirm-value.highlight {
  color: var(--ant-primary-color);
  font-size: 16px;
  font-weight: 500;
}

.amount-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-value {
  color: var(--ant-primary-color);
  font-size: 16px;
  font-weight: 500;
  font-family: monospace;
}
</style> 