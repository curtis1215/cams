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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import MerchantSelect from '../../components/selectors/MerchantSelect.vue'
import ChainTypeSelect from '../../components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '../../components/selectors/CurrencySelect.vue'

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

// 處理轉帳
const handleTransfer = () => {
  if (!fromWalletForm.address || !toWalletForm.address) {
    message.error(t('pleaseSelectFromAndToWallet'))
    return
  }

  if (!transferAmount.value) {
    message.error(t('pleaseInputTransferAmount'))
    return
  }

  // TODO: 實現轉帳邏輯
  console.log('轉帳資訊:', {
    from: fromWalletForm,
    to: toWalletForm,
    amount: transferAmount.value
  })
  
  message.success(t('transferRequestSubmitted'))
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
</style> 