<template>
  <div class="users-page">
    <!-- 查詢表單 -->
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('title.queryCondition') }}</span>
      </template>
      <a-form layout="inline" :model="queryParams" class="query-form">
        <a-form-item :label="t('field.email')" class="form-item">
          <a-input
            v-model:value="queryParams.email"
            :placeholder="t('prompt.pleaseInputEmail')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('field.name')" class="form-item">
          <a-input
            v-model:value="queryParams.name"
            :placeholder="t('prompt.pleaseInputName')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('field.role')" class="form-item">
          <role-select v-model:value="queryParams.role" :placeholder="t('prompt.pleaseSelectRole')" />
        </a-form-item>
        <a-form-item :label="t('field.status')" class="form-item">
          <a-select v-model:value="queryParams.status" allowClear>
            <a-select-option value="enabled">{{ t('status.enabled') }}</a-select-option>
            <a-select-option value="disabled">{{ t('status.disabled') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="form-item">
          <a-space>
            <a-button type="primary" @click="handleQuery">
              <template #icon><SearchOutlined /></template>
              {{ t('action.search') }}
            </a-button>
            <a-button @click="resetQuery">
              <template #icon><ReloadOutlined /></template>
              {{ t('action.reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 用戶列表 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div class="table-title">
          <span>{{ t('title.userList') }}</span>
        </div>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <!-- 狀態列自定義渲染 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'enabled' ? 'success' : 'error'">
              {{ t(`status.${record.status}`) }}
            </a-tag>
          </template>
          <!-- 操作列自定義渲染 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">
                {{ t('action.edit') }}
              </a-button>
              <a-button type="link" @click="handleViewHistory(record)">
                {{ t('action.viewHistory') }}
              </a-button>
              <a-popconfirm
                :title="t('prompt.confirmDelete')"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger>
                  {{ t('action.delete') }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/編輯用戶彈窗 -->
    <a-modal
      v-model:open="userModalVisible"
      :title="isEdit ? t('title.editUser') : t('title.addUser')"
      @ok="handleUserModalOk"
      @cancel="handleUserModalCancel"
      :confirmLoading="modalLoading"
    >
      <a-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item :label="t('field.username')" name="username">
          <a-input
            v-model:value="userForm.username"
            :placeholder="t('prompt.pleaseInputUsername')"
            :disabled="isEdit"
          />
        </a-form-item>
        <a-form-item
          :label="t('field.password')"
          name="password"
          :required="!isEdit"
        >
          <a-input-password
            v-model:value="userForm.password"
            :placeholder="t('prompt.pleaseInputPassword')"
          />
        </a-form-item>
        <a-form-item
          :label="t('field.confirmPassword')"
          name="confirmPassword"
          :required="!isEdit"
        >
          <a-input-password
            v-model:value="userForm.confirmPassword"
            :placeholder="t('prompt.pleaseConfirmPassword')"
          />
        </a-form-item>
        <a-form-item :label="t('field.name')" name="name">
          <a-input
            v-model:value="userForm.name"
            :placeholder="t('prompt.pleaseInputName')"
          />
        </a-form-item>
        <a-form-item :label="t('field.email')" name="email">
          <a-input
            v-model:value="userForm.email"
            :placeholder="t('prompt.pleaseInputEmail')"
          />
        </a-form-item>
        <a-form-item :label="t('field.role')" name="role">
          <role-select
            v-model:value="userForm.role"
            :placeholder="t('prompt.pleaseSelectRole')"
          />
        </a-form-item>
        <a-form-item :label="t('field.status')" name="status">
          <a-select v-model:value="userForm.status">
            <a-select-option value="enabled">{{ t('status.enabled') }}</a-select-option>
            <a-select-option value="disabled">{{ t('status.disabled') }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, TablePaginationConfig } from 'ant-design-vue'
import type { FilterValue, SorterResult } from 'ant-design-vue/es/table/interface'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import RoleSelect from '@/components/selectors/RoleSelect.vue'
import zhLocale from '@/locales/system/Users/zh.json'
import enLocale from '@/locales/system/Users/en.json'
import mockData from '@/mock/system/users/list.mock.json'

// 定義用戶介面
interface User {
  id: number
  username: string
  name: string
  email: string
  role: string
  status: string
  lastLoginTime: string
  createTime: string
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 查詢參數
const queryParams = ref({
  email: '',
  name: '',
  role: undefined as string | undefined,
  status: undefined as string | undefined
})

// 表格列配置
const columns = [
  {
    title: t('field.username'),
    dataIndex: 'username',
    key: 'username',
    width: 150
  },
  {
    title: t('field.name'),
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: t('field.email'),
    dataIndex: 'email',
    key: 'email',
    width: 200
  },
  {
    title: t('field.role'),
    dataIndex: 'role',
    key: 'role',
    width: 150
  },
  {
    title: t('field.status'),
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: t('field.lastLoginTime'),
    dataIndex: 'lastLoginTime',
    key: 'lastLoginTime',
    width: 180
  },
  {
    title: t('field.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: t('field.action'),
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 表格數據
const tableData = ref<User[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: mockData.total,
  showSizeChanger: true,
  showQuickJumper: true
})

// 初始化數據
const initData = () => {
  loading.value = true
  // 模擬 API 請求
  setTimeout(() => {
    tableData.value = mockData.data as User[]
    loading.value = false
  }, 300)
}

// 查詢處理
const handleQuery = () => {
  loading.value = true
  // 模擬 API 請求
  setTimeout(() => {
    const { email, name, role, status } = queryParams.value
    
    // 過濾數據
    let filteredData = mockData.data.filter(item => {
      if (email && !item.email.toLowerCase().includes(email.toLowerCase())) return false
      if (name && !item.name.includes(name)) return false
      if (role && item.role !== role) return false
      if (status && item.status !== status) return false
      return true
    })
    
    // 更新分頁信息
    pagination.total = filteredData.length
    
    // 計算當前頁數據
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
    
    loading.value = false
  }, 300)
}

// 重置查詢
const resetQuery = () => {
  queryParams.value = {
    email: '',
    name: '',
    role: undefined,
    status: undefined
  }
  pagination.current = 1
  handleQuery()
}

// 表格變更處理
const handleTableChange = (
  pag: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  sorter: SorterResult<User> | SorterResult<User>[]
) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  handleQuery()
}

// 用戶表單相關
const userModalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  role: undefined as string | undefined,
  status: 'enabled' as string
})

// 表單驗證規則
const userFormRules = {
  username: [{ required: true, message: t('prompt.pleaseInputUsername') }],
  password: [{ required: true, message: t('prompt.pleaseInputPassword') }],
  confirmPassword: [
    { required: true, message: t('prompt.pleaseConfirmPassword') },
    {
      validator: async (_rule: any, value: string) => {
        if (value && value !== userForm.password) {
          throw new Error(t('message.passwordNotMatch'))
        }
      }
    }
  ],
  name: [{ required: true, message: t('prompt.pleaseInputName') }],
  email: [
    { required: true, message: t('prompt.pleaseInputEmail') },
    { type: 'email', message: t('prompt.pleaseInputEmail') }
  ],
  role: [{ required: true, message: t('prompt.pleaseSelectRole') }],
  status: [{ required: true }]
}

// 顯示新增用戶彈窗
const showAddUserModal = () => {
  isEdit.value = false
  userModalVisible.value = true
}

// 顯示編輯用戶彈窗
const handleEdit = (record: User) => {
  isEdit.value = true
  Object.assign(userForm, record)
  userModalVisible.value = true
}

// 處理用戶彈窗確認
const handleUserModalOk = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    modalLoading.value = true
    // 模擬 API 請求
    setTimeout(() => {
      modalLoading.value = false
      userModalVisible.value = false
      message.success(isEdit.value ? t('message.editSuccess') : t('message.addSuccess'))
      handleQuery()
    }, 300)
  } catch (error) {
    console.error('表單驗證失敗:', error)
  }
}

// 處理用戶彈窗取消
const handleUserModalCancel = () => {
  userModalVisible.value = false
  userFormRef.value?.resetFields()
}

// 處理刪除用戶
const handleDelete = (record: User) => {
  // 模擬 API 請求
  setTimeout(() => {
    message.success(t('message.deleteSuccess'))
    handleQuery()
  }, 300)
}

// 查看用戶歷程
const handleViewHistory = (record: User) => {
  // TODO: 實現查看歷程功能
}

// 在組件掛載時載入數據
onMounted(() => {
  initData()
})
</script>

<style scoped>
.users-page {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
  background: #141414;
}

.table-card {
  background: #141414;
}

.users-page :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.users-page :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.users-page :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.users-page :deep(.ant-card-body) {
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

.table-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style> 