<template>
  <div class="bankcode-management">
    <!-- 搜尋卡片 -->
    <a-card :bordered="false" class="search-card">
      <template #title>
        <span class="card-title">{{ t('search.title') }}</span>
      </template>
      <a-form layout="inline" :model="searchForm">
        <a-form-item :label="t('field.bankcode')">
          <a-input
            v-model:value="searchForm.bankcode"
            :placeholder="t('placeholder.enterBankcode')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('field.chainType')">
          <chain-type-select
            v-model:value="searchForm.chainType"
            :style="{ width: '180px' }"
          />
        </a-form-item>
        <a-form-item :label="t('field.currency')">
          <currency-select
            v-model="searchForm.currency"
            :style="{ width: '180px' }"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              {{ t('action.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              {{ t('action.reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 列表卡片 -->
    <a-card :bordered="false" class="list-card">
      <template #title>
        <span class="card-title">{{ t('list.title') }}</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          {{ t('action.add') }}
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                {{ t('action.edit') }}
              </a-button>
              <a-button type="link" danger @click="handleDelete(record)">
                <template #icon><DeleteOutlined /></template>
                {{ t('action.delete') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 編輯/新增彈窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item
          name="bankcode"
          :label="t('field.bankcode')"
          :rules="[{ required: true, message: t('validation.required.bankcode') }]"
        >
          <a-input
            v-model:value="formData.bankcode"
            :placeholder="t('placeholder.enterBankcode')"
            :disabled="isEdit"
          />
        </a-form-item>
        <a-form-item
          name="chainType"
          :label="t('field.chainType')"
          :rules="[{ required: true, message: t('validation.required.chainType') }]"
        >
          <chain-type-select
            v-model:value="formData.chainType"
            :style="{ width: '100%' }"
          />
        </a-form-item>
        <a-form-item
          name="currency"
          :label="t('field.currency')"
          :rules="[{ required: true, message: t('validation.required.currency') }]"
        >
          <currency-select
            v-model="formData.currency"
            :style="{ width: '100%' }"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 刪除確認彈窗 -->
    <a-modal
      v-model:open="deleteModalVisible"
      :title="t('modal.deleteTitle')"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
    >
      <p>{{ t('modal.deleteConfirm') }}</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import ChainTypeSelect from '@/components/selectors/ChainTypeSelect.vue'
import CurrencySelect from '@/components/selectors/CurrencySelect.vue'
import zhLocale from '@/locales/params/Bankcode/zh.json'
import enLocale from '@/locales/params/Bankcode/en.json'
import bankcodeData from '@/mock/params/bankcode/data.json'

interface BankcodeItem {
  bankcode: string
  chainType: string
  currency: string
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

// @ts-ignore Type instantiation is too deep error
const { t } = useI18n({
  messages,
  legacy: false
})

const bankcodeList = ref<BankcodeItem[]>(bankcodeData.bankcodeList as BankcodeItem[])

// 表格列定義
const columns = [
  {
    title: t('field.bankcode'),
    dataIndex: 'bankcode',
    key: 'bankcode',
    width: 200
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
    title: t('field.action'),
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 表格數據
const tableData = ref<BankcodeItem[]>([])
const loading = ref(false)

// 分頁設置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 表單相關
const formRef = ref<FormInstance>()
const modalVisible = ref(false)
const deleteModalVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<BankcodeItem | null>(null)

const formData = reactive<BankcodeItem>({
  bankcode: '',
  chainType: '',
  currency: ''
})

// 表單驗證規則
const rules = {
  bankcode: [
    { required: true, message: t('validation.required.bankcode'), trigger: 'blur' }
  ],
  chainType: [
    { required: true, message: t('validation.required.chainType'), trigger: 'change' }
  ],
  currency: [
    { required: true, message: t('validation.required.currency'), trigger: 'change' }
  ]
}

const modalTitle = computed(() => {
  return isEdit.value ? t('modal.editTitle') : t('modal.addTitle')
})

// 搜尋表單
const searchForm = reactive({
  bankcode: '',
  chainType: undefined as string | undefined,
  currency: undefined as string | undefined
})

// 搜尋處理
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.bankcode = ''
  searchForm.chainType = undefined
  searchForm.currency = undefined
  handleSearch()
}

// 表格變更處理
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 新增按鈕處理
const handleAdd = () => {
  isEdit.value = false
  formData.bankcode = ''
  formData.chainType = ''
  formData.currency = ''
  modalVisible.value = true
}

// 編輯按鈕處理
const handleEdit = (record: any) => {
  isEdit.value = true
  currentRecord.value = record
  formData.bankcode = record.bankcode
  formData.chainType = record.chainType
  formData.currency = record.currency
  modalVisible.value = true
}

// 刪除按鈕處理
const handleDelete = (record: any) => {
  currentRecord.value = record
  deleteModalVisible.value = true
}

// 確認刪除
const handleDeleteConfirm = () => {
  if (currentRecord.value) {
    const index = bankcodeList.value.findIndex((item: BankcodeItem) => item.bankcode === currentRecord.value?.bankcode)
    if (index > -1) {
      bankcodeList.value.splice(index, 1)
    }
  }
  deleteModalVisible.value = false
}

// 彈窗確認
const handleModalOk = () => {
  formRef.value?.validate().then(() => {
    if (currentRecord.value) {
      const index = bankcodeList.value.findIndex((item: BankcodeItem) => item.bankcode === currentRecord.value?.bankcode)
      if (index > -1) {
        bankcodeList.value[index] = { ...formData }
      }
    } else {
      bankcodeList.value.push({ ...formData })
    }
    modalVisible.value = false
  })
}

// 彈窗取消
const handleModalCancel = () => {
  formRef.value?.resetFields()
  modalVisible.value = false
}

// 獲取數據
const fetchData = () => {
  loading.value = true
  try {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = bankcodeList.value.slice(start, end)
    pagination.total = bankcodeList.value.length
  } catch (error) {
    console.error('Fetch data failed:', error)
    message.error(t('common.fetchFailed'))
  } finally {
    loading.value = false
  }
}

// 初始化
fetchData()

const filteredData = computed(() => {
  let result = bankcodeList.value
  if (searchForm.bankcode) {
    result = result.filter(item => item.bankcode.toLowerCase().includes(searchForm.bankcode.toLowerCase()))
  }
  if (searchForm.chainType) {
    result = result.filter(item => item.chainType === searchForm.chainType)
  }
  if (searchForm.currency) {
    result = result.filter(item => item.currency === searchForm.currency)
  }
  return result
})

const paginatedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const total = computed(() => filteredData.value.length)
</script>

<style scoped>
.bankcode-management {
  padding: 24px;
}

.search-card {
  margin-bottom: 24px;
}

:deep(.ant-card) {
  background: #141414;
  border: 1px solid #303030;
}

:deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  padding: 0 24px;
}

:deep(.ant-card-head-title) {
  padding: 16px 0;
}

:deep(.ant-card-body) {
  padding: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-table) {
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #303030;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #1f1f1f;
}

:deep(.ant-pagination-item) {
  background-color: #141414;
  border-color: #303030;
}

:deep(.ant-pagination-item-active) {
  border-color: #177ddc;
}

:deep(.ant-pagination-item a) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-pagination-item-active a) {
  color: #177ddc;
}

:deep(.ant-modal-content),
:deep(.ant-modal-header) {
  background-color: #1f1f1f;
}

:deep(.ant-modal-title) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-modal-close-x) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-btn-link) {
  padding: 4px 8px;
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
}
</style> 