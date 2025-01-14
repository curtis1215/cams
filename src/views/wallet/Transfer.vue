<template>
  <div class="wallet-transfer">
    <div class="transfer-container">
      <!-- 左側轉出錢包 -->
      <a-card :bordered="false" class="transfer-card from-wallet">
        <template #title>
          <span class="card-title">{{ $t('fromWallet') }}</span>
        </template>
        <a-form layout="vertical" :model="fromWalletForm">
          <div class="form-row">
            <a-form-item :label="$t('merchant')">
              <merchant-select v-model="fromWalletForm.merchant" />
            </a-form-item>
            <a-form-item :label="$t('chainType')">
              <chain-type-select v-model="fromWalletForm.chainType" />
            </a-form-item>
            <a-form-item :label="$t('currency')">
              <currency-select v-model="fromWalletForm.currency" />
            </a-form-item>
          </div>
          <div class="form-row">
            <a-form-item :label="$t('address')" class="address-input">
              <a-input
                v-model:value="fromWalletForm.address"
                :placeholder="$t('pleaseInputAddress')"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="query-button">
              <a-button type="primary" @click="handleFromWalletQuery">
                <template #icon><SearchOutlined /></template>
                {{ $t('query') }}
              </a-button>
            </a-form-item>
          </div>
        </a-form>
      </a-card>

      <!-- 右側轉入錢包 -->
      <a-card :bordered="false" class="transfer-card to-wallet">
        <template #title>
          <span class="card-title">{{ $t('toWallet') }}</span>
        </template>
        <a-form layout="vertical" :model="toWalletForm">
          <div class="form-row">
            <a-form-item :label="$t('merchant')">
              <merchant-select v-model="toWalletForm.merchant" />
            </a-form-item>
            <a-form-item :label="$t('chainType')">
              <chain-type-select v-model="toWalletForm.chainType" />
            </a-form-item>
            <a-form-item :label="$t('currency')">
              <currency-select v-model="toWalletForm.currency" />
            </a-form-item>
          </div>
          <div class="form-row">
            <a-form-item :label="$t('address')" class="address-input">
              <a-input
                v-model:value="toWalletForm.address"
                :placeholder="$t('pleaseInputAddress')"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="query-button">
              <a-button type="primary" @click="handleToWalletQuery">
                <template #icon><SearchOutlined /></template>
                {{ $t('query') }}
              </a-button>
            </a-form-item>
          </div>
        </a-form>
      </a-card>
    </div>

    <div class="wallet-details">
      <!-- 轉出錢包詳情 -->
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

      <!-- 轉入錢包詳情 -->
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
    </div>

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
.wallet-transfer {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.transfer-container {
  display: flex;
  gap: 24px;
}

.transfer-card {
  flex: 1;
  min-width: 0;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row .ant-form-item {
  flex: 1;
  margin-bottom: 0;
}

.address-input {
  flex: 4;
}

.query-button {
  flex: 0 0 auto;
  margin-left: 16px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0;
}

.query-button :deep(.ant-form-item-control-input) {
  min-height: auto;
}

.wallet-details {
  display: flex;
  gap: 24px;
}

.detail-card {
  flex: 1;
  min-width: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: rgba(255, 255, 255, 0.45);
}

.detail-value {
  font-family: monospace;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
}

.transfer-info {
  width: 100%;
}

.transfer-amount-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

:deep(.ant-card) {
  background: #1f1f1f;
}

:deep(.ant-card-head-title) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}
</style> 