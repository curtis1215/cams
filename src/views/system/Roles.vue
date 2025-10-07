<template>
  <div class="roles-management">
    <!-- 角色列表卡片 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span class="card-title">{{ t('title.roleList') }}</span>
          <a-button type="primary" @click="showAddRoleModal">
            <template #icon><PlusOutlined /></template>
            {{ t('action.addRole') }}
          </a-button>
        </div>
      </template>
      
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="roleList"
          :pagination="{
            total: 100,
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true
          }"
          :bordered="true"
          @change="handleTableChange"
        >
          <!-- 操作列自定義渲染 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEditRole(record)">
                  {{ t('action.editRole') }}
                </a-button>
                <a-button type="link" size="small" @click="handleConfigParams(record)">
                  {{ t('action.configParams') }}
                </a-button>
                <a-button type="link" status="danger" size="small" @click="handleDeleteRole(record)">
                  {{ t('action.deleteRole') }}
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 新增/編輯角色彈窗 -->
    <a-modal
      v-model:open="roleModalVisible"
      :title="isEdit ? t('title.editRole') : t('title.addRole')"
      @ok="handleSaveRole"
      @cancel="handleCancelRole"
      :confirmLoading="confirmLoading"
      width="800px"
    >
      <a-form
        :model="roleForm"
        :rules="roleRules"
        ref="roleFormRef"
        layout="vertical"
      >
        <!-- 角色名稱 -->
        <a-form-item :label="t('field.roleName')" name="roleName">
          <a-input
            v-model:value="roleForm.roleName"
            :placeholder="t('prompt.inputRoleName')"
            allow-clear
          />
        </a-form-item>

        <!-- 角色描述 -->
        <a-form-item :label="t('field.roleDescription')" name="roleDescription">
          <a-textarea
            v-model:value="roleForm.roleDescription"
            :placeholder="t('prompt.inputRoleDescription')"
            :rows="4"
            allow-clear
          />
        </a-form-item>

        <!-- 2FA 啟用選項 -->
        <a-form-item :label="t('field.twoFactorAuth')" name="twoFactorAuthRequired">
          <a-switch
            v-model:checked="roleForm.twoFactorAuthRequired"
            :checkedValue="true"
            :unCheckedValue="false"
          >
            <template #checkedChildren>{{ t('field.twoFactorAuthRequired') }}</template>
            <template #unCheckedChildren>{{ t('field.twoFactorAuthRequired') }}</template>
          </a-switch>
        </a-form-item>

        <!-- 權限設置 -->
        <a-form-item :label="t('field.permissions')">
          <a-card :bordered="false" class="permissions-card">
            <template v-for="module in modules" :key="module.key">
              <div class="permission-module">
                <div class="module-title">{{ t(`module.${module.key}.title`) }}</div>
                <div class="permission-pages">
                  <template v-for="page in module.pages" :key="page.key">
                    <div class="permission-page">
                      <div class="page-title">{{ t(`module.${module.key}.${page.key}`) }}</div>
                      <div class="permission-items">
                        <a-checkbox
                          v-for="perm in page.permissions"
                          :key="perm"
                          v-model:checked="roleForm.permissions[module.key][page.key][perm]"
                        >
                          {{ t(`permission.${perm}`) }}
                        </a-checkbox>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <a-divider v-if="module.key !== modules[modules.length - 1].key" />
            </template>
          </a-card>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 參數配置彈窗 -->
    <a-modal
      v-model:open="paramsModalVisible"
      :title="t('title.walletTransferConfig')"
      @ok="handleSaveParams"
      @cancel="handleCancelParams"
      :confirmLoading="paramsConfirmLoading"
      width="600px"
    >
      <a-form
        :model="paramsForm"
        :rules="paramsRules"
        ref="paramsFormRef"
        layout="vertical"
      >
        <a-form-item :label="t('field.generalTransferLimit')" name="generalTransferLimit">
          <a-input-number
            v-model:value="paramsForm.generalTransferLimit"
            :min="0"
            :max="999999999"
            :precision="2"
            :placeholder="t('prompt.inputTransferLimit')"
            addon-after="USDT"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import zhLocale from '@/locales/system/Roles/zh.json'
import enLocale from '@/locales/system/Roles/en.json'
import mockData from '@/mock/system/Roles/roles.mock.json'

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 表格列配置
const columns = [
  {
    title: t('field.roleName'),
    dataIndex: 'roleName',
    key: 'roleName',
    width: 200
  },
  {
    title: t('field.roleDescription'),
    dataIndex: 'roleDescription',
    key: 'roleDescription',
    width: 300
  },
  {
    title: t('field.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 200
  },
  {
    title: t('field.updateTime'),
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 200
  },
  {
    title: t('action.action'),
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 模擬角色列表數據
const roleList = ref(mockData.roleList)

// 模塊和權限定義
const modules = [
  {
    key: 'monitor',
    pages: [
      { key: 'dashboard', permissions: ['read'] },
      { key: 'alert', permissions: ['read', 'create', 'update', 'delete'] }
    ]
  },
  {
    key: 'wallet',
    pages: [
      { key: 'query', permissions: ['read', 'create', 'update'] },
      { key: 'detail', permissions: ['read', 'create', 'update'] },
      { key: 'privateKey', permissions: ['read'] },
      { key: 'transfer', permissions: ['read', 'create', 'update', 'largeAmountTransfer'] },
      { key: 'tokenExchange', permissions: ['read', 'create', 'update'] }
    ]
  },
  {
    key: 'order',
    pages: [
      { key: 'deposit', permissions: ['read', 'create', 'update'] },
      { key: 'withdraw', permissions: ['read', 'create', 'update'] },
      { key: 'transfer', permissions: ['read', 'create', 'update'] },
      { key: 'exchange', permissions: ['read', 'create', 'update'] },
      { key: 'transaction', permissions: ['read', 'create', 'update'] }
    ]
  },
  {
    key: 'reconciliation',
    pages: [
      { key: 'walletBalance', permissions: ['read', 'update'] }
    ]
  },
  {
    key: 'params',
    pages: [
      { key: 'blockchain', permissions: ['read', 'create', 'update', 'delete'] },
      { key: 'contractCoin', permissions: ['read', 'create', 'update', 'delete'] }
    ]
  },
  {
    key: 'system',
    pages: [
      { key: 'users', permissions: ['read', 'create', 'update', 'delete'] },
      { key: 'roles', permissions: ['read', 'create', 'update', 'delete'] },
      { key: 'merchants', permissions: ['read', 'create', 'update', 'delete'] },
      { key: 'systemParams', permissions: ['read', 'update'] }
    ]
  }
]

// 角色表單相關
const roleModalVisible = ref(false)
const confirmLoading = ref(false)
const roleFormRef = ref(null)
const isEdit = ref(false)

// 參數配置相關
const paramsModalVisible = ref(false)
const paramsConfirmLoading = ref(false)
const paramsFormRef = ref(null)
const currentRole = ref(null)

// 初始化權限對象
const initPermissions = () => {
  const perms = {}
  modules.forEach(module => {
    perms[module.key] = {}
    module.pages.forEach(page => {
      perms[module.key][page.key] = {}
      page.permissions.forEach(perm => {
        perms[module.key][page.key][perm] = false
      })
    })
  })
  return perms
}

// 角色表單數據
const roleForm = reactive({
  roleName: '',
  roleDescription: '',
  twoFactorAuthRequired: false,
  permissions: initPermissions()
})

// 表單驗證規則
const roleRules = {
  roleName: [{ required: true, message: t('message.roleNameRequired'), trigger: 'blur' }],
  roleDescription: [{ required: true, message: t('message.roleDescriptionRequired'), trigger: 'blur' }]
}

// 參數配置表單數據
const paramsForm = reactive({
  generalTransferLimit: 10000
})

// 參數配置驗證規則
const paramsRules = {
  generalTransferLimit: [
    { required: true, message: t('message.transferLimitRequired'), trigger: 'blur' },
    { type: 'number', min: 0, message: t('message.transferLimitMinimum'), trigger: 'blur' }
  ]
}

// 顯示新增角色彈窗
const showAddRoleModal = () => {
  isEdit.value = false
  roleForm.roleName = ''
  roleForm.roleDescription = ''
  roleForm.twoFactorAuthRequired = false
  roleForm.permissions = initPermissions()
  roleModalVisible.value = true
}

// 處理編輯角色
const handleEditRole = (record) => {
  isEdit.value = true
  roleForm.roleName = record.roleName
  roleForm.roleDescription = record.roleDescription
  // 在實際應用中，這裡需要從後端獲取角色的權限設置
  roleModalVisible.value = true
}

// 處理刪除角色
const handleDeleteRole = (record) => {
  // 在實際應用中，這裡需要調用後端 API 刪除角色
  message.success(t('message.deleteSuccess'))
}

// 處理保存角色
const handleSaveRole = async () => {
  try {
    await roleFormRef.value.validate()
    confirmLoading.value = true
    
    // TODO: 實現保存角色的 API 調用
    console.log('保存角色數據:', roleForm)
    
    // 模擬 API 調用
    setTimeout(() => {
      message.success(t('message.saveSuccess'))
      roleModalVisible.value = false
      confirmLoading.value = false
      // 重置表單
      roleFormRef.value.resetFields()
    }, 1000)
  } catch (error) {
    console.error('表單驗證失敗:', error)
  }
}

// 取消編輯
const handleCancelRole = () => {
  roleModalVisible.value = false
  roleFormRef.value.resetFields()
}

// 處理表格變更
const handleTableChange = (pagination, filters, sorter) => {
  console.log('Table change:', { pagination, filters, sorter })
}

// 處理參數配置
const handleConfigParams = (record) => {
  currentRole.value = record
  // 在實際應用中，這裡需要從後端獲取該角色的參數配置
  paramsForm.generalTransferLimit = 10000
  paramsModalVisible.value = true
}

// 保存參數配置
const handleSaveParams = async () => {
  try {
    await paramsFormRef.value.validate()
    paramsConfirmLoading.value = true

    // TODO: 實現保存參數配置的 API 調用
    console.log('保存參數配置:', {
      roleId: currentRole.value.id,
      ...paramsForm
    })

    // 模擬 API 調用
    setTimeout(() => {
      message.success(t('message.saveSuccess'))
      paramsModalVisible.value = false
      paramsConfirmLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('參數配置驗證失敗:', error)
  }
}

// 取消參數配置
const handleCancelParams = () => {
  paramsModalVisible.value = false
  paramsFormRef.value.resetFields()
}
</script>

<style scoped>
.roles-management {
  padding: 24px;
}

.table-card {
  background: #141414;
}

.roles-management :deep(.ant-card) {
  border-radius: 8px;
  border: 1px solid #303030;
}

.roles-management :deep(.ant-card-head) {
  background-color: #1f1f1f;
  border-bottom: 1px solid #303030;
  min-height: 48px;
}

.roles-management :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.roles-management :deep(.ant-card-body) {
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
:deep(.ant-input-textarea) {
  background-color: #1f1f1f !important;
  border-color: #434343 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.ant-input:hover),
:deep(.ant-input:focus),
:deep(.ant-input-textarea:hover),
:deep(.ant-input-textarea:focus) {
  border-color: var(--ant-primary-color) !important;
}

/* 權限設置卡片樣式 */
.permissions-card {
  background: #1f1f1f !important;
  border: 1px solid #303030 !important;
}

.permission-module {
  padding: 12px 0;
}

.module-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.85);
}

.permission-pages {
  padding-left: 24px;
}

.permission-page {
  margin-bottom: 16px;
}

.page-title {
  font-size: 14px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.85);
}

.permission-items {
  display: flex;
  gap: 24px;
}

:deep(.ant-checkbox-wrapper) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.ant-divider) {
  border-color: #303030;
  margin: 16px 0;
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