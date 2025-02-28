<template>
  <div class="exchange-pair-management">
    <h2>{{ t('exchangePairManagement') }}</h2>
    
    <!-- 查詢卡片 -->
    <a-card :title="t('search.title')" class="search-card">
      <div class="search-form">
        <a-form layout="inline">
          <a-form-item :label="t('search.pairName')">
            <a-input v-model:value="searchForm.pairName" />
          </a-form-item>
          <a-form-item :label="t('search.quoteSource')">
            <a-select v-model:value="searchForm.quoteSource" style="width: 180px">
              <a-select-option value="">{{ t('search.sourceOptions.all') }}</a-select-option>
              <a-select-option value="binance">{{ t('search.sourceOptions.binance') }}</a-select-option>
              <a-select-option value="gateio">{{ t('search.sourceOptions.gateio') }}</a-select-option>
              <a-select-option value="mexc">{{ t('search.sourceOptions.mexc') }}</a-select-option>
              <a-select-option value="fameex">{{ t('search.sourceOptions.fameex') }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('search.status')">
            <a-select v-model:value="searchForm.status" style="width: 180px">
              <a-select-option value="">{{ t('search.statusOptions.all') }}</a-select-option>
              <a-select-option value="true">{{ t('search.statusOptions.enabled') }}</a-select-option>
              <a-select-option value="false">{{ t('search.statusOptions.disabled') }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                {{ t('search.searchButton') }}
              </a-button>
              <a-button @click="handleReset">
                {{ t('search.resetButton') }}
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :title="t('list.title')" class="list-card">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          {{ t('list.addButton') }}
        </a-button>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="tableData"
        :row-key="(record: ExchangePair) => record.id"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status ? 'success' : 'error'">
              {{ record.status ? t('search.statusOptions.enabled') : t('search.statusOptions.disabled') }}
            </a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <EditOutlined />
                {{ t('list.columns.edit') }}
              </a-button>
              <a-button type="link" size="small" @click="handleDelete(record)" danger>
                <DeleteOutlined />
                {{ t('list.columns.delete') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/編輯幣對彈窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? t('modal.editTitle') : t('modal.addTitle')"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item :label="t('modal.form.pairName')">
          <a-input 
            v-model:value="formData.pairName" 
            :placeholder="t('modal.placeholder.pairName')" 
          />
        </a-form-item>
        
        <a-form-item :label="t('modal.form.quoteSource')">
          <a-select v-model:value="formData.quoteSource" style="width: 100%">
            <a-select-option value="binance">{{ t('search.sourceOptions.binance') }}</a-select-option>
            <a-select-option value="gateio">{{ t('search.sourceOptions.gateio') }}</a-select-option>
            <a-select-option value="mexc">{{ t('search.sourceOptions.mexc') }}</a-select-option>
            <a-select-option value="fameex">{{ t('search.sourceOptions.fameex') }}</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item :label="t('modal.form.sourceKey')">
          <a-input 
            v-model:value="formData.sourceKey" 
            :placeholder="t('modal.placeholder.sourceKey')" 
          />
        </a-form-item>
        
        <a-form-item :label="t('modal.form.status')">
          <a-checkbox v-model:checked="formData.status"></a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import zhLocale from '@/locales/params/ExchangePair/zh.json'
import enLocale from '@/locales/params/ExchangePair/en.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 定義幣對類型
interface ExchangePair {
  id: number;
  pairName: string;
  price: number;
  quoteSource: string;
  sourceKey: string;
  status: boolean;
}

// 搜尋表單
const searchForm = reactive({
  pairName: '',
  quoteSource: '',
  status: ''
})

// 表格數據
const tableData = ref<ExchangePair[]>([])
const loading = ref(false)

// 表格列定義
const columns = [
  {
    title: () => t('list.columns.pairName'),
    dataIndex: 'pairName',
    key: 'pairName'
  },
  {
    title: () => t('list.columns.price'),
    dataIndex: 'price',
    key: 'price'
  },
  {
    title: () => t('list.columns.quoteSource'),
    dataIndex: 'quoteSource',
    key: 'quoteSource',
    customRender: ({ text }: { text: string }) => {
      const sourceMap: Record<string, string> = {
        'binance': t('search.sourceOptions.binance'),
        'gateio': t('search.sourceOptions.gateio'),
        'mexc': t('search.sourceOptions.mexc'),
        'fameex': t('search.sourceOptions.fameex')
      }
      return sourceMap[text] || text
    }
  },
  {
    title: () => t('list.columns.status'),
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: () => t('list.columns.actions'),
    key: 'actions'
  }
]

// 模態框相關
const modalVisible = ref(false)
const isEdit = ref(false)
const formData = reactive({
  id: 0,
  pairName: '',
  price: 0,
  quoteSource: 'binance',
  sourceKey: '',
  status: true
})

// 生命週期鉤子
onMounted(() => {
  fetchData()
})

// 獲取數據
const fetchData = async () => {
  loading.value = true
  try {
    // 模擬API請求
    setTimeout(() => {
      // 模擬數據
      tableData.value = [
        {
          id: 1,
          pairName: 'BTC/USDT',
          price: 65432.12,
          quoteSource: 'binance',
          sourceKey: 'BTCUSDT',
          status: true
        },
        {
          id: 2,
          pairName: 'ETH/USDT',
          price: 3456.78,
          quoteSource: 'gateio',
          sourceKey: 'ETH_USDT',
          status: true
        },
        {
          id: 3,
          pairName: 'XRP/USDT',
          price: 0.5678,
          quoteSource: 'mexc',
          sourceKey: 'XRP_USDT',
          status: false
        }
      ]
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('獲取數據失敗', error)
    loading.value = false
  }
}

// 搜尋處理
const handleSearch = () => {
  fetchData()
}

// 重置搜尋
const handleReset = () => {
  searchForm.pairName = ''
  searchForm.quoteSource = ''
  searchForm.status = ''
  fetchData()
}

// 新增幣對
const handleAdd = () => {
  isEdit.value = false
  formData.id = 0
  formData.pairName = ''
  formData.price = 0
  formData.quoteSource = 'binance'
  formData.sourceKey = ''
  formData.status = true
  modalVisible.value = true
}

// 編輯幣對
const handleEdit = (record: ExchangePair) => {
  isEdit.value = true
  formData.id = record.id
  formData.pairName = record.pairName
  formData.price = record.price
  formData.quoteSource = record.quoteSource
  formData.sourceKey = record.sourceKey
  formData.status = record.status
  modalVisible.value = true
}

// 刪除幣對
const handleDelete = (record: ExchangePair) => {
  Modal.confirm({
    title: t('modal.message.deleteConfirm'),
    okText: t('common.action.confirm'),
    cancelText: t('common.action.cancel'),
    onOk: () => {
      // 模擬API請求
      setTimeout(() => {
        tableData.value = tableData.value.filter(item => item.id !== record.id)
        message.success(t('modal.message.deleteSuccess'))
      }, 500)
    }
  })
}

// 提交表單
const handleSubmit = () => {
  // 模擬API請求
  setTimeout(() => {
    if (isEdit.value) {
      // 編輯現有記錄
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        tableData.value[index] = { ...formData }
      }
      message.success(t('modal.message.editSuccess'))
    } else {
      // 新增記錄
      const newId = Math.max(...tableData.value.map(item => item.id), 0) + 1
      tableData.value.push({
        ...formData,
        id: newId,
        price: 0 // 新增時價格為0，等待系統更新
      })
      message.success(t('modal.message.addSuccess'))
    }
    modalVisible.value = false
  }, 500)
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped>
.exchange-pair-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.list-card {
  margin-bottom: 20px;
}
</style> 