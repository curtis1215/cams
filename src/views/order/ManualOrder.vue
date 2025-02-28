<template>
  <div class="manual-order-container">
    <a-card class="card" :title="t('blockchainInfo')" :bordered="false">
      <a-form layout="horizontal" :model="formState" name="blockchain-form">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item :label="t('chainType')" name="chainType">
              <ChainTypeSelect v-model:value="formState.chainType" @change="handleChainTypeChange" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('blockHeight')" name="blockHeight">
              <a-input v-model:value="formState.blockHeight" :placeholder="t('pleaseInputBlockHeight')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <a-button type="primary" @click="handleSearch">
                {{ t('action.query') }}
              </a-button>
              <a-button style="margin-left: 8px" @click="resetForm">
                {{ t('action.reset') }}
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-card class="card" :title="t('queryResult')" :bordered="false">
      <div v-if="loading" class="loading-container">
        <a-spin />
      </div>
      <div v-else-if="!hasSearched" class="empty-result">
        <a-empty :description="t('pleaseSearchFirst')" />
      </div>
      <div v-else-if="resultData.length === 0" class="empty-result">
        <a-empty :description="t('noDataFound')" />
      </div>
      <a-table
        v-else
        :columns="columns"
        :data-source="resultData"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="viewDetail(record)">
              {{ t('action.detail') }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import zhLocale from '@/locales/order/Manual/zh.json'
import enLocale from '@/locales/order/Manual/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 表單狀態
const formState = reactive({
  chainType: undefined,
  blockHeight: ''
})

// 查詢結果相關狀態
const loading = ref(false)
const hasSearched = ref(false)
const resultData = ref<any[]>([])

// 分頁設置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `${t('total')} ${total} ${t('items')}`
})

// 表格列定義
const columns = computed(() => [
  {
    title: t('field.orderId'),
    dataIndex: 'orderId',
    key: 'orderId'
  },
  {
    title: t('chainType'),
    dataIndex: 'chainType',
    key: 'chainType'
  },
  {
    title: t('field.coinType'),
    dataIndex: 'coinType',
    key: 'coinType'
  },
  {
    title: t('field.amount'),
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: t('field.createTime'),
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: t('action.action'),
    key: 'action'
  }
])

// 處理鏈類型變更
const handleChainTypeChange = (value: string) => {
  console.log('Chain type changed:', value)
}

// 處理查詢
const handleSearch = async () => {
  if (!formState.chainType) {
    message.warning(t('selectChainType'))
    return
  }

  if (!formState.blockHeight) {
    message.warning(t('pleaseInputBlockHeight'))
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    // 這裡應該是實際的API調用
    // 模擬API調用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模擬數據
    resultData.value = [
      {
        id: '1',
        orderId: 'ORD' + Math.floor(Math.random() * 1000000),
        chainType: formState.chainType,
        coinType: formState.chainType === 'ETH' ? 'USDT' : formState.chainType,
        amount: (Math.random() * 10).toFixed(4),
        createTime: new Date().toLocaleString()
      },
      {
        id: '2',
        orderId: 'ORD' + Math.floor(Math.random() * 1000000),
        chainType: formState.chainType,
        coinType: formState.chainType === 'ETH' ? 'USDT' : formState.chainType,
        amount: (Math.random() * 10).toFixed(4),
        createTime: new Date().toLocaleString()
      }
    ]
    
    pagination.total = resultData.value.length
    message.success(t('message.querySuccess'))
  } catch (error) {
    console.error('Search error:', error)
    message.error(t('message.queryFailed'))
    resultData.value = []
  } finally {
    loading.value = false
  }
}

// 重置表單
const resetForm = () => {
  formState.chainType = undefined
  formState.blockHeight = ''
  hasSearched.value = false
  resultData.value = []
}

// 查看詳情
const viewDetail = (record: any) => {
  console.log('View detail:', record)
  message.info(`${t('action.detail')}: ${record.orderId}`)
}
</script>

<style scoped>
.manual-order-container {
  padding: 24px;
}

.card {
  margin-bottom: 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style> 