<template>
  <div class="transfer-record">
    <a-card :title="t('transferOrderQuery')" class="filter-card">
      <a-form layout="vertical" :model="queryParams" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('orderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.orderId"
              :placeholder="t('pleaseInputOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('walletId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.walletId"
              :placeholder="t('pleaseInputWalletId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('address')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.address"
              :placeholder="t('pleaseInputAddress')"
              allow-clear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="TxHash" class="form-item-lg">
            <a-input
              v-model:value="queryParams.txHash"
              :placeholder="t('pleaseInputTxHash')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('relatedOrderId')" class="form-item-lg">
            <a-input
              v-model:value="queryParams.relatedOrderId"
              :placeholder="t('pleaseInputRelatedOrderId')"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="t('status')" class="form-item-md">
            <transfer-status-select
              v-model="queryParams.status"
              style="width: 100%"
            />
          </a-form-item>
          <div class="form-item-sm button-group">
            <a-space>
              <a-button @click="handleReset">{{ t('reset') }}</a-button>
              <a-button type="primary" @click="handleQuery">{{ t('query') }}</a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TransferStatusSelect from '@/components/selectors/TransferStatusSelect.vue'
import '@/styles/common.css'

const { t } = useI18n()

const queryParams = ref({
  orderId: '',
  walletId: '',
  address: '',
  txHash: '',
  relatedOrderId: '',
  status: undefined
})

const handleReset = () => {
  queryParams.value = {
    orderId: '',
    walletId: '',
    address: '',
    txHash: '',
    relatedOrderId: '',
    status: undefined
  }
}

const handleQuery = () => {
  // 實現查詢邏輯
  console.log('Query with params:', queryParams.value)
}
</script>

<style scoped>
.transfer-record {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
}

:deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

:deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

:deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

:deep(.ant-card-body) {
  background-color: #141414;
}

.query-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
}

.form-row:last-child {
  margin-bottom: 0;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.form-item-lg {
  flex: 2;
  min-width: 0;
}

.form-item-md {
  flex: 1.5;
  min-width: 0;
}

.form-item-sm {
  flex: 1;
  min-width: 0;
}

.button-group {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
</style> 