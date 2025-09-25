<template>
  <div class="wallet-transfer">
    <a-row :gutter="24">
      <!-- 左側轉出錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card from-wallet">
          <template #title>
            <span class="card-title">{{ t('title.fromWalletInfo') }}</span>
          </template>

          <!-- 搜尋表單 -->
          <a-form layout="vertical" :model="fromWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('field.merchant') }}</div>
                <a-select v-model:value="fromWalletForm.merchant" class="full-width" @change="handleFromMerchantChange">
                  <a-select-option v-for="merchant in mockSelectors.merchants" :key="merchant.value" :value="merchant.value">
                    {{ merchant.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('field.chainType') }}</div>
                <a-select v-model:value="fromWalletForm.chainType" :disabled="chainTypeDisabled.from" class="full-width" @change="handleFromChainTypeChange">
                  <a-select-option v-for="chain in mockSelectors.chainTypes" :key="chain.value" :value="chain.value">
                    {{ chain.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('field.walletType') }}</div>
                <a-select v-model:value="fromWalletForm.walletType" class="full-width" @change="handleFromWalletTypeChange">
                  <a-select-option v-for="type in mockSelectors.walletTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
            <!-- 條件式地址搜尋框 -->
            <div class="form-row" v-if="fromWalletForm.walletType === 'User' || fromWalletForm.walletType === 'External'">
              <a-form-item class="form-item address-search">
                <div class="form-label">{{ t('field.walletAddress') }}</div>
                <a-input
                  v-model:value="fromWalletForm.address"
                  :placeholder="t('prompt.pleaseInputWalletAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="query-button">
                <div class="form-label">&nbsp;</div>
                <a-button type="primary" @click="handleFromWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ t('action.search') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>

          <!-- 錢包選擇區域 -->
          <div class="selection-container" v-if="fromWalletList.length > 0 || fromWalletListLoading">
            <a-row :gutter="16">
              <!-- 左側錢包列表 -->
              <a-col :span="12">
                <div class="section">
                  <div class="section-title">{{ t('title.fromWalletList') }}</div>
                  <div class="wallet-list-container">
                    <a-list
                      :data-source="fromWalletList"
                      :loading="fromWalletListLoading"
                      size="small"
                    >
                      <template #renderItem="{ item }">
                        <a-list-item
                          :class="['wallet-item', { 'selected': selectedFromWallet?.id === item.id }]"
                          @click="handleSelectFromWallet(item)"
                        >
                          <div class="wallet-info">
                            <div class="wallet-code">{{ item.code }}</div>
                            <div class="wallet-address">{{ formatWalletAddress(item.address) }}</div>
                          </div>
                        </a-list-item>
                      </template>
                    </a-list>
                  </div>
                </div>
              </a-col>

              <!-- 右側幣種列表 -->
              <a-col :span="12">
                <div class="section" v-if="selectedFromWallet">
                  <div class="section-title">{{ t('title.fromCoinList') }}</div>
                  <div class="coin-list-container">
                    <a-list
                      :data-source="selectedFromWallet.coins"
                      size="small"
                    >
                      <template #renderItem="{ item }">
                        <a-list-item
                          :class="['coin-item', { 'selected': selectedFromCoin?.currency === item.currency }]"
                          @click="handleSelectFromCoin(item)"
                        >
                          <div class="coin-info">
                            <div class="coin-name">{{ item.currency }}</div>
                            <div class="coin-balance">{{ formatNumber(item.balance) }}</div>
                          </div>
                        </a-list-item>
                      </template>
                    </a-list>
                  </div>
                </div>
                <div class="section" v-else>
                  <div class="section-title">{{ t('title.fromCoinList') }}</div>
                  <div class="empty-coin-state">
                    請先選擇錢包
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>

          <!-- 空狀態 -->
          <div class="empty-state" v-if="fromWalletList.length === 0 && !fromWalletListLoading">
            {{ t('prompt.clickSearchToLoadWallets') }}
          </div>
        </a-card>
      </a-col>

      <!-- 右側轉入錢包 -->
      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card to-wallet">
          <template #title>
            <span class="card-title">{{ t('title.toWalletInfo') }}</span>
          </template>

          <!-- 搜尋表單 -->
          <a-form layout="vertical" :model="toWalletForm">
            <div class="form-row">
              <a-form-item class="form-item">
                <div class="form-label">{{ t('field.merchant') }}</div>
                <a-select v-model:value="toWalletForm.merchant" class="full-width" @change="handleToMerchantChange">
                  <a-select-option v-for="merchant in mockSelectors.merchants" :key="merchant.value" :value="merchant.value">
                    {{ merchant.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('field.chainType') }}</div>
                <a-select v-model:value="toWalletForm.chainType" :disabled="chainTypeDisabled.to" class="full-width" @change="handleToChainTypeChange">
                  <a-select-option v-for="chain in mockSelectors.chainTypes" :key="chain.value" :value="chain.value">
                    {{ chain.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item class="form-item">
                <div class="form-label">{{ t('field.walletType') }}</div>
                <a-select v-model:value="toWalletForm.walletType" class="full-width" @change="handleToWalletTypeChange">
                  <a-select-option v-for="type in mockSelectors.walletTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
            <!-- 條件式地址搜尋框 -->
            <div class="form-row" v-if="toWalletForm.walletType === 'User' || toWalletForm.walletType === 'External'">
              <a-form-item class="form-item address-search">
                <div class="form-label">{{ t('field.walletAddress') }}</div>
                <a-input
                  v-model:value="toWalletForm.address"
                  :placeholder="t('prompt.pleaseInputWalletAddress')"
                  class="full-width"
                  allow-clear
                />
              </a-form-item>
            </div>
            <div class="form-row">
              <a-form-item class="query-button">
                <div class="form-label">&nbsp;</div>
                <a-button type="primary" @click="handleToWalletQuery">
                  <template #icon><SearchOutlined /></template>
                  {{ t('action.search') }}
                </a-button>
              </a-form-item>
            </div>
          </a-form>

          <!-- 錢包選擇區域 -->
          <div class="selection-container" v-if="toWalletList.length > 0 || toWalletListLoading">
            <a-row :gutter="16">
              <!-- 左側錢包列表 -->
              <a-col :span="12">
                <div class="section">
                  <div class="section-title">{{ t('title.toWalletList') }}</div>
                  <div class="wallet-list-container">
                    <a-list
                      :data-source="toWalletList"
                      :loading="toWalletListLoading"
                      size="small"
                    >
                      <template #renderItem="{ item }">
                        <a-list-item
                          :class="['wallet-item', { 'selected': selectedToWallet?.id === item.id }]"
                          @click="handleSelectToWallet(item)"
                        >
                          <div class="wallet-info">
                            <div class="wallet-code">{{ item.code }}</div>
                            <div class="wallet-address">{{ formatWalletAddress(item.address) }}</div>
                          </div>
                        </a-list-item>
                      </template>
                    </a-list>
                  </div>
                </div>
              </a-col>

              <!-- 右側幣種列表 -->
              <a-col :span="12">
                <div class="section" v-if="selectedToWallet">
                  <div class="section-title">{{ t('title.toCoinList') }}</div>
                  <div class="coin-list-container">
                    <a-list
                      :data-source="getAvailableToCoins()"
                      size="small"
                    >
                      <template #renderItem="{ item }">
                        <a-list-item
                          :class="['coin-item', {
                            'selected': selectedToCoin?.currency === item.currency,
                            'disabled': !isToWalletCoinAvailable(item)
                          }]"
                          @click="handleSelectToCoin(item)"
                        >
                          <div class="coin-info">
                            <div class="coin-name">{{ item.currency }}</div>
                            <div class="coin-balance">{{ formatNumber(item.balance) }}</div>
                          </div>
                        </a-list-item>
                      </template>
                    </a-list>
                  </div>
                </div>
                <div class="section" v-else>
                  <div class="section-title">{{ t('title.toCoinList') }}</div>
                  <div class="empty-coin-state">
                    請先選擇錢包
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>

          <!-- 空狀態 -->
          <div class="empty-state" v-if="toWalletList.length === 0 && !toWalletListLoading">
            {{ t('prompt.clickSearchToLoadWallets') }}
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 轉出錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card from-detail">
          <template #title>
            <span class="card-title">{{ t('title.fromWalletDetail') }}</span>
          </template>
          <div class="detail-content" v-if="selectedFromCoin">
            <div class="detail-item">
              <span class="detail-label">{{ t('field.currency') }}</span>
              <span class="detail-value">{{ selectedFromCoin.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('balance.current') }}</span>
              <span class="detail-value">{{ formatNumber(selectedFromCoin.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('balance.availableOutflow') }}</span>
              <span class="detail-value">{{ formatNumber(selectedFromCoin.balance) }}</span>
            </div>
          </div>
          <div class="empty-state" v-else>
            {{ t('prompt.pleaseSelectCoin') }}
          </div>
        </a-card>
      </a-col>

      <!-- 轉入錢包詳情 -->
      <a-col :span="12">
        <a-card :bordered="false" class="detail-card to-detail">
          <template #title>
            <span class="card-title">{{ t('title.toWalletDetail') }}</span>
          </template>
          <div class="detail-content" v-if="selectedToCoin">
            <div class="detail-item">
              <span class="detail-label">{{ t('field.currency') }}</span>
              <span class="detail-value">{{ selectedToCoin.currency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('balance.current') }}</span>
              <span class="detail-value">{{ formatNumber(selectedToCoin.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('balance.availableInflow') }}</span>
              <span class="detail-value">{{ formatNumber(selectedToCoin.balance) }}</span>
            </div>
          </div>
          <div class="empty-state" v-else>
            {{ t('prompt.pleaseSelectCoin') }}
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 轉帳資訊 -->
    <a-card :bordered="false" class="transfer-info">
      <template #title>
        <span class="card-title">{{ t('title.transferInfo') }}</span>
      </template>
      <div class="transfer-amount-container">
        <a-form layout="inline">
          <a-form-item :label="t('field.transferAmount')">
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
              {{ t('field.maxAmount') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleTransfer">
              {{ t('action.transfer') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <!-- 轉帳確認彈窗 -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="t('prompt.confirmTransfer')"
      @ok="handleConfirmTransfer"
      @cancel="handleCancelTransfer"
      :confirmLoading="confirmLoading"
      width="600px"
    >
      <div class="confirm-content">
        <!-- 轉出資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ t('title.fromWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.typeLabel') }}</span>
              <span class="confirm-value">{{ fromWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.chainType') }}</span>
              <span class="confirm-value">{{ fromWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.currency') }}</span>
              <span class="confirm-value">{{ fromWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.address') }}</span>
              <span class="confirm-value">{{ fromWalletForm.address }}</span>
            </div>
          </div>
        </a-card>

        <!-- 轉帳數量卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <div class="amount-title">
              <span>{{ t('field.transferAmount') }}：</span>
              <span class="amount-value">{{ formatNumber(transferAmount) }}</span>
            </div>
          </template>
        </a-card>

        <!-- 轉入資訊卡片 -->
        <a-card :bordered="false" class="confirm-card">
          <template #title>
            <span class="card-title">{{ t('title.toWalletInfo') }}</span>
          </template>
          <div class="confirm-card-content">
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.typeLabel') }}</span>
              <span class="confirm-value">{{ toWalletForm.walletType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.chainType') }}</span>
              <span class="confirm-value">{{ toWalletForm.chainType }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.currency') }}</span>
              <span class="confirm-value">{{ toWalletForm.currency }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">{{ t('field.address') }}</span>
              <span class="confirm-value">{{ toWalletForm.address }}</span>
            </div>
          </div>
        </a-card>
      </div>
    </a-modal>

    <!-- 轉帳申請查詢 -->
    <a-card :title="t('title.transferQueryTitle')" class="transfer-card query-card">
      <a-form layout="inline" class="query-form">
        <div class="form-row">
          <a-form-item :label="t('field.merchant')" class="form-item">
            <a-select v-model:value="queryParams.merchant" class="full-width">
              <a-select-option v-for="merchant in mockSelectors.merchants" :key="merchant.value" :value="merchant.value">
                {{ merchant.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('field.chainType')" class="form-item">
            <a-select v-model:value="queryParams.chainType" class="full-width">
              <a-select-option v-for="chain in mockSelectors.chainTypes" :key="chain.value" :value="chain.value">
                {{ chain.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('field.currency')" class="form-item">
            <a-select v-model:value="queryParams.currency" class="full-width">
              <a-select-option v-for="currency in mockSelectors.currencies" :key="currency.value" :value="currency.value">
                {{ currency.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('field.typeLabel')" class="form-item">
            <a-select v-model:value="queryParams.walletType" class="full-width">
              <a-select-option v-for="type in mockSelectors.walletTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item :label="t('field.address')" class="form-item address-input">
            <a-input v-model:value="queryParams.address" class="full-width" :placeholder="t('prompt.pleaseInputAddress')" />
          </a-form-item>
          <a-form-item :label="'\u00A0'" class="form-item query-button">
            <a-space>
              <a-button type="primary" @click="handleQuery">
                {{ t('action.search') }}
              </a-button>
              <a-button @click="handleReset">
                {{ t('action.reset') }}
              </a-button>
            </a-space>
          </a-form-item>
        </div>
      </a-form>
    </a-card>

    <!-- 轉帳列表 -->
    <a-card :title="t('title.transferList')" class="transfer-card list-card">
      <a-table 
        :dataSource="transferList" 
        :columns="columns" 
        :loading="loading" 
        :pagination="pagination" 
        @change="handleTableChange"
        :scroll="{ y: 480 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button 
                type="primary" 
                size="small" 
                v-if="record.auditStatus === 'pending'"
                @click="handleAudit(record)"
              >
                {{ t('action.audit') }}
              </a-button>
              <a-button 
                type="link" 
                size="small" 
                v-if="['approved', 'rejected'].includes(record.auditStatus)"
                @click="handleViewAuditDetail(record)"
              >
                {{ t('action.detail') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 審核操作彈窗 -->
    <a-modal
      v-model:open="auditModalVisible"
      :title="t('title.auditOperation')"
      @ok="handleConfirmAudit"
      @cancel="handleCancelAudit"
      :confirmLoading="auditLoading"
    >
      <a-form :model="auditForm" layout="vertical">
        <a-form-item :label="t('field.auditOperation')" required>
          <a-select v-model:value="auditForm.status" style="width: 100%">
            <a-select-option value="approved">{{ t('auditStatus.approved') }}</a-select-option>
            <a-select-option value="rejected">{{ t('auditStatus.rejected') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('field.auditReason')" required>
          <a-textarea 
            v-model:value="auditForm.reason"
            :rows="4"
            :placeholder="t('prompt.pleaseInputAuditReason')"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 審核詳情彈窗 -->
    <a-modal
      v-model:open="auditDetailModalVisible"
      :title="t('title.auditDetail')"
      @cancel="() => auditDetailModalVisible = false"
      :footer="null"
    >
      <div class="audit-detail" v-if="selectedRecord">
        <div class="audit-detail-item">
          <span class="audit-detail-label">{{ t('field.auditOperation') }}：</span>
          <span class="audit-detail-value">{{ selectedRecord.auditStatus === 'approved' ? t('auditStatus.approved') : t('auditStatus.rejected') }}</span>
        </div>
        <div class="audit-detail-item">
          <span class="audit-detail-label">{{ t('field.auditReason') }}：</span>
          <span class="audit-detail-value">{{ selectedRecord.auditReason }}</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import zhLocale from '@/locales/wallet/Transfer/zh.json'
import enLocale from '@/locales/wallet/Transfer/en.json'
import mockData from '@/mock/wallet/Transfer/transfer.mock.json'
import walletsMockData from '@/mock/wallet/Transfer/wallets.mock.json'
import mockSelectors from '@/mock/wallet/Transfer/selectors.mock.json'

// 在 script 標籤下方添加必要的介面定義
interface TransferRecord {
  key: string | number;
  transferOrderId?: string;
  fromWalletId: string;
  fromChainType: string;
  fromCurrency: string;
  amount: string;
  toMerchant: string;
  toWalletId: string;
  toChainType: string;
  toCurrency: string;
  createTime: string;
  auditTime: string;
  auditStatus: 'pending' | 'approved' | 'rejected';
  auditReason?: string;
  transferStatus?: 'submitted' | 'onchain' | 'confirming' | 'completed' | 'failed';
  confirmations?: number;
  requiredConfirmations?: number;
  walletType?: string;
  fromMerchant?: string;
}

interface WalletInfo {
  id: string;
  code: string;
  address: string;
  walletType: string;
  chainType: string;
  merchant: string;
  coins: CoinInfo[];
}

interface CoinInfo {
  currency: string;
  balance: string;
}

const messages = {
  zh: zhLocale,
  en: enLocale
}

const { t } = useI18n({
  messages,
  legacy: false
})

// 轉出錢包表單
interface WalletForm {
  merchant?: string;
  chainType?: string;
  walletType?: string;
  address?: string;
}

// 轉出錢包表單
const fromWalletForm = reactive<WalletForm>({
  merchant: undefined,
  chainType: undefined,
  walletType: undefined,
  address: undefined
})

// 轉入錢包表單
const toWalletForm = reactive<WalletForm>({
  merchant: undefined,
  chainType: undefined,
  walletType: undefined,
  address: undefined
})

// 錢包列表和選擇
const fromWalletList = ref<WalletInfo[]>([])
const toWalletList = ref<WalletInfo[]>([])
const fromWalletListLoading = ref(false)
const toWalletListLoading = ref(false)
const selectedFromWallet = ref<WalletInfo | null>(null)
const selectedToWallet = ref<WalletInfo | null>(null)
const selectedFromCoin = ref<CoinInfo | null>(null)
const selectedToCoin = ref<CoinInfo | null>(null)

// 鏈類型聯動限制
const chainTypeDisabled = reactive({
  from: false,
  to: false
})

// 錢包詳情
const fromWalletDetail = reactive({
  ...mockData.fromWalletDetail
})

const toWalletDetail = reactive({
  ...mockData.toWalletDetail
})

// 轉帳相關
const transferAmount = ref(0)
const useMaxAmount = ref(false)
const maxAmount = computed(() => {
  return selectedFromCoin.value ? Number(selectedFromCoin.value.balance) : 0
})

// 處理最大數量變更
const handleMaxAmountChange = (checked: boolean) => {
  if (checked) {
    transferAmount.value = maxAmount.value
  }
}

// 格式化數字
const formatNumber = (value: string | number) => {
  if (!value) return '0.00000000'
  return Number(value).toFixed(8)
}

// 格式化錢包地址顯示
const formatWalletAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// 獲取可用的轉入幣種
const getAvailableToCoins = (): CoinInfo[] => {
  if (!selectedToWallet.value) return []

  // 如果沒有選擇轉出幣種，顯示所有轉入錢包的幣種
  if (!selectedFromCoin.value) {
    return selectedToWallet.value.coins
  }

  // 如果已選擇轉出幣種，只顯示匹配的幣種
  return selectedToWallet.value.coins.filter(coin =>
    coin.currency === selectedFromCoin.value?.currency
  )
}

// 檢查轉入錢包幣種是否可用
const isToWalletCoinAvailable = (coin: CoinInfo): boolean => {
  if (!selectedFromCoin.value) return true
  return coin.currency === selectedFromCoin.value.currency
}

// 商戶變更處理
const handleFromMerchantChange = () => {
  selectedFromWallet.value = null
  selectedFromCoin.value = null
  fromWalletList.value = []
}

const handleToMerchantChange = () => {
  selectedToWallet.value = null
  selectedToCoin.value = null
  toWalletList.value = []
}

// 鏈類型變更處理
const handleFromChainTypeChange = () => {
  selectedFromWallet.value = null
  selectedFromCoin.value = null
  fromWalletList.value = []

  // 同步轉入錢包的鏈類型
  toWalletForm.chainType = fromWalletForm.chainType
  selectedToWallet.value = null
  selectedToCoin.value = null
  toWalletList.value = []
}

const handleToChainTypeChange = () => {
  // 轉入錢包的鏈類型必須跟隨轉出錢包，不允許單獨修改
  if (fromWalletForm.chainType && toWalletForm.chainType !== fromWalletForm.chainType) {
    message.warning('轉入錢包鏈類型必須與轉出錢包保持一致')
    toWalletForm.chainType = fromWalletForm.chainType
    return
  }
  selectedToWallet.value = null
  selectedToCoin.value = null
  toWalletList.value = []
}

// 錢包類型變更處理
const handleFromWalletTypeChange = () => {
  selectedFromWallet.value = null
  selectedFromCoin.value = null
  fromWalletList.value = []
}

const handleToWalletTypeChange = () => {
  selectedToWallet.value = null
  selectedToCoin.value = null
  toWalletList.value = []
}

// 載入錢包列表
const loadFromWalletList = () => {
  // 移除商戶限制，允許搜尋所有錢包

  console.log('🔍 載入轉出錢包列表，搜尋條件：', {
    chainType: fromWalletForm.chainType,
    walletType: fromWalletForm.walletType,
    address: fromWalletForm.address,
    addressLength: fromWalletForm.address?.length,
    willFilterByAddress: (fromWalletForm.walletType === 'User' || fromWalletForm.walletType === 'External') && fromWalletForm.address
  })

  fromWalletListLoading.value = true
  setTimeout(() => {
    const filteredWallets = walletsMockData.walletList.filter(wallet => {
      const chainMatch = !fromWalletForm.chainType || wallet.chainType === fromWalletForm.chainType
      const typeMatch = !fromWalletForm.walletType || wallet.walletType === fromWalletForm.walletType

      // 地址搜尋：僅當錢包類型為用戶錢包或外轉錢包時生效
      const needAddressFilter = fromWalletForm.walletType === 'User' || fromWalletForm.walletType === 'External'
      let addressMatch = true

      if (needAddressFilter && fromWalletForm.address) {
        // 優先匹配真實地址
        const realAddressMatch = wallet.address?.toLowerCase().includes(fromWalletForm.address.toLowerCase())
        // 為了demo展示，如果沒有真實匹配，則進行模糊匹配（錢包代號、類型等）
        const demoMatch = wallet.code?.toLowerCase().includes(fromWalletForm.address.toLowerCase()) ||
                         wallet.walletType?.toLowerCase().includes(fromWalletForm.address.toLowerCase())

        addressMatch = realAddressMatch || demoMatch
      }

      console.log(`錢包 ${wallet.code} 詳細檢查:`, {
        wallet: wallet,
        fromWalletFormType: fromWalletForm.walletType,
        walletType: wallet.walletType,
        walletAddress: wallet.address,
        searchAddress: fromWalletForm.address,
        needAddressFilter,
        chainMatch,
        typeMatch,
        addressMatch,
        passed: chainMatch && typeMatch && addressMatch
      })

      return chainMatch && typeMatch && addressMatch
    })

    console.log('過濾後的錢包列表：', filteredWallets)
    fromWalletList.value = filteredWallets
    fromWalletListLoading.value = false

    if (filteredWallets.length === 0) {
      // 如果是因為地址搜尋導致沒有結果，提供可用地址建議
      const isAddressFiltering = (fromWalletForm.walletType === 'User' || fromWalletForm.walletType === 'External') && fromWalletForm.address
      if (isAddressFiltering) {
        const availableUserWallets = walletsMockData.walletList.filter(wallet =>
          wallet.walletType === fromWalletForm.walletType &&
          (!fromWalletForm.chainType || wallet.chainType === fromWalletForm.chainType)
        )
        if (availableUserWallets.length > 0) {
          const availableAddresses = availableUserWallets.map(w => w.address).join(', ')
          message.info(`未找到包含地址 "${fromWalletForm.address}" 的錢包。可用的${fromWalletForm.walletType === 'User' ? '用戶錢包' : '外轉錢包'}地址: ${availableAddresses}`)
        } else {
          message.info('未找到符合條件的轉出錢包')
        }
      } else {
        message.info('未找到符合條件的轉出錢包')
      }
    } else {
      message.success(`已載入 ${filteredWallets.length} 個轉出錢包`)
    }
  }, 500)
}

const loadToWalletList = () => {
  // 移除商戶限制，允許搜尋所有錢包

  console.log('🔍 載入轉入錢包列表，搜尋條件：', {
    chainType: toWalletForm.chainType,
    walletType: toWalletForm.walletType,
    address: toWalletForm.address,
    addressLength: toWalletForm.address?.length,
    willFilterByAddress: (toWalletForm.walletType === 'User' || toWalletForm.walletType === 'External') && toWalletForm.address
  })

  toWalletListLoading.value = true
  setTimeout(() => {
    const filteredWallets = walletsMockData.walletList.filter(wallet => {
      const chainMatch = !toWalletForm.chainType || wallet.chainType === toWalletForm.chainType
      const typeMatch = !toWalletForm.walletType || wallet.walletType === toWalletForm.walletType

      // 地址搜尋：僅當錢包類型為用戶錢包或外轉錢包時生效
      const needAddressFilter = toWalletForm.walletType === 'User' || toWalletForm.walletType === 'External'
      let addressMatch = true

      if (needAddressFilter && toWalletForm.address) {
        // 優先匹配真實地址
        const realAddressMatch = wallet.address?.toLowerCase().includes(toWalletForm.address.toLowerCase())
        // 為了demo展示，如果沒有真實匹配，則進行模糊匹配（錢包代號、類型等）
        const demoMatch = wallet.code?.toLowerCase().includes(toWalletForm.address.toLowerCase()) ||
                         wallet.walletType?.toLowerCase().includes(toWalletForm.address.toLowerCase())

        addressMatch = realAddressMatch || demoMatch
      }

      console.log(`錢包 ${wallet.code} 詳細檢查:`, {
        wallet: wallet,
        toWalletFormType: toWalletForm.walletType,
        walletType: wallet.walletType,
        walletAddress: wallet.address,
        searchAddress: toWalletForm.address,
        needAddressFilter,
        chainMatch,
        typeMatch,
        addressMatch,
        passed: chainMatch && typeMatch && addressMatch
      })

      return chainMatch && typeMatch && addressMatch
    })

    console.log('轉入錢包過濾結果：', filteredWallets)
    toWalletList.value = filteredWallets
    toWalletListLoading.value = false

    if (filteredWallets.length === 0) {
      message.info('未找到符合條件的錢包')
    } else {
      message.success(`已載入 ${filteredWallets.length} 個錢包`)
    }
  }, 500)
}

// 錢包選擇處理
const handleSelectFromWallet = (wallet: WalletInfo) => {
  selectedFromWallet.value = wallet
  selectedFromCoin.value = null
  // 重置轉入幣種選擇
  selectedToCoin.value = null
}

const handleSelectToWallet = (wallet: WalletInfo) => {
  selectedToWallet.value = wallet
  selectedToCoin.value = null
}

// 幣種選擇處理
const handleSelectFromCoin = (coin: CoinInfo) => {
  selectedFromCoin.value = coin

  // 如果已選擇轉入錢包，檢查是否有相同幣種，如果有則自動選擇
  if (selectedToWallet.value) {
    const matchingCoin = selectedToWallet.value.coins.find(c => c.currency === coin.currency)
    if (matchingCoin) {
      selectedToCoin.value = matchingCoin
    } else {
      selectedToCoin.value = null
      message.info(`轉入錢包沒有 ${coin.currency} 幣種，請重新選擇轉入錢包`)
    }
  }
}

const handleSelectToCoin = (coin: CoinInfo) => {
  // 檢查轉出錢包是否選擇了相同幣種
  if (selectedFromCoin.value && selectedFromCoin.value.currency !== coin.currency) {
    message.warning('轉入幣種必須與轉出幣種保持一致')
    return
  }

  // 如果轉出還沒選擇幣種，提示先選擇轉出
  if (!selectedFromCoin.value) {
    message.warning('請先選擇轉出幣種')
    return
  }

  selectedToCoin.value = coin
}

// 處理轉出錢包查詢
const handleFromWalletQuery = () => {
  loadFromWalletList()
}

// 處理轉入錢包查詢
const handleToWalletQuery = () => {
  loadToWalletList()
}

// 轉帳確認相關
const confirmModalVisible = ref(false)
const confirmLoading = ref(false)

// 處理轉帳按鈕點擊
const handleTransfer = () => {
  if (!selectedFromWallet.value || !selectedToWallet.value) {
    message.error(t('prompt.pleaseSelectFromAndToWallet'))
    return
  }

  if (!selectedFromCoin.value || !selectedToCoin.value) {
    message.error(t('prompt.pleaseSelectCoin'))
    return
  }

  if (!transferAmount.value) {
    message.error(t('prompt.pleaseInputTransferAmount'))
    return
  }

  // 更新確認彈窗中的表單資料
  Object.assign(fromWalletForm, {
    walletType: selectedFromWallet.value.walletType,
    chainType: selectedFromWallet.value.chainType,
    currency: selectedFromCoin.value.currency,
    address: selectedFromWallet.value.address
  })

  Object.assign(toWalletForm, {
    walletType: selectedToWallet.value.walletType,
    chainType: selectedToWallet.value.chainType,
    currency: selectedToCoin.value.currency,
    address: selectedToWallet.value.address
  })

  // 顯示確認彈窗
  confirmModalVisible.value = true
}

// 處理確認轉帳
const handleConfirmTransfer = async () => {
  confirmLoading.value = true
  try {
    // TODO: 實現轉帳邏輯
    console.log('轉帳資訊:', {
      fromWallet: selectedFromWallet.value,
      fromCoin: selectedFromCoin.value,
      toWallet: selectedToWallet.value,
      toCoin: selectedToCoin.value,
      amount: transferAmount.value
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 調用
    message.success(t('prompt.transferRequestSubmitted'))
    confirmModalVisible.value = false
  } catch (error) {
    message.error(t('prompt.transferFailed'))
  } finally {
    confirmLoading.value = false
  }
}

// 處理取消轉帳
const handleCancelTransfer = () => {
  confirmModalVisible.value = false
}

// 查詢參數
const queryParams = reactive({
  merchant: undefined,
  chainType: undefined,
  currency: undefined,
  walletType: undefined,
  address: ''
})

// 轉帳列表數據
const transferList = ref(mockData.transferList)
const loading = ref(false)

// 格式化地址顯示
const formatAddress = (address: string): string => {
  if (!address) return '-'
  return `${address.slice(0, 4)}***${address.slice(-4)}`
}

// 複製地址
const copyAddress = async (address: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(address)
    message.success(t('message.copySuccess'))
  } catch (err) {
    message.error(t('message.copyFailed'))
  }
}

// 表格列定義
const columns = [
  {
    title: t('field.transferOrderId'),
    dataIndex: 'transferOrderId',
    key: 'transferOrderId',
    width: 180,
  },
  {
    title: t('field.fromAddress'),
    dataIndex: 'fromWalletId',
    key: 'fromWalletId',
    width: 200,
    customRender: ({ text }: { text: string }) => {
      return h('div', { class: 'address-container' }, [
        h('span', {}, formatAddress(text)),
        h(CopyOutlined, {
          class: 'copy-icon',
          onClick: () => copyAddress(text)
        })
      ])
    }
  },
  {
    title: t('field.fromChainType'),
    dataIndex: 'fromChainType',
    key: 'fromChainType',
    width: 120,
  },
  {
    title: t('field.fromCurrency'),
    dataIndex: 'fromCurrency',
    key: 'fromCurrency',
    width: 120,
  },
  {
    title: t('field.transferAmount'),
    dataIndex: 'amount',
    key: 'amount',
    width: 140,
    align: 'right'
  },
  {
    title: t('field.toWallet'),
    dataIndex: 'toMerchant',
    key: 'toMerchant',
    width: 120
  },
  {
    title: t('field.toAddress'),
    dataIndex: 'toWalletId',
    key: 'toWalletId',
    width: 200,
    customRender: ({ text }: { text: string }) => {
      return h('div', { class: 'address-container' }, [
        h('span', {}, formatAddress(text)),
        h(CopyOutlined, {
          class: 'copy-icon',
          onClick: () => copyAddress(text)
        })
      ])
    }
  },
  {
    title: t('field.toChainType'),
    dataIndex: 'toChainType',
    key: 'toChainType',
    width: 100
  },
  {
    title: t('field.toCurrency'),
    dataIndex: 'toCurrency',
    key: 'toCurrency',
    width: 100
  },
  {
    title: t('field.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160
  },
  {
    title: t('field.auditTime'),
    dataIndex: 'auditTime',
    key: 'auditTime',
    width: 160
  },
  {
    title: t('field.auditStatus'),
    dataIndex: 'auditStatus',
    key: 'auditStatus',
    width: 100,
    customRender: ({ text }: { text: 'pending' | 'approved' | 'rejected' }) => {
      const statusMap = {
        pending: t('auditStatus.pending'),
        approved: t('auditStatus.approved'),
        rejected: t('auditStatus.rejected')
      }
      return statusMap[text] || text
    }
  },
  {
    title: t('transferStatus.label'),
    dataIndex: 'transferStatus',
    key: 'transferStatus',
    width: 120,
    customRender: ({ text, record }: { text?: 'submitted' | 'onchain' | 'confirming' | 'completed' | 'failed', record: TransferRecord }) => {
      if (['pending', 'rejected'].includes(record.auditStatus)) {
        return ''
      }
      const statusMap = {
        submitted: t('transferStatus.submitted'),
        onchain: t('transferStatus.onchain'),
        confirming: (record: TransferRecord) => `${t('transferStatus.confirming')}(${record.confirmations}/${record.requiredConfirmations})`,
        completed: t('transferStatus.completed'),
        failed: t('transferStatus.failed')
      }
      return text && typeof statusMap[text] === 'function' ? statusMap[text](record) : (text && statusMap[text]) || ''
    }
  },
  {
    title: t('field.action'),
    key: 'action',
    width: 80,
    fixed: 'right'
  }
]

// 格式化表格分頁
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
  showSizeChanger: true,
  showQuickJumper: true
})

// 更新查詢方法
const handleQuery = () => {
  loading.value = true
  // 模擬API調用
  setTimeout(() => {
    // 使用 mock 數據進行過濾
    const filteredData = mockData.transferList.filter(item => {
      if (queryParams.merchant && item.fromMerchant !== queryParams.merchant) return false
      if (queryParams.chainType && item.fromChainType !== queryParams.chainType) return false
      if (queryParams.currency && item.fromCurrency !== queryParams.currency) return false
      // 暫時移除 walletType 過濾條件，因為 mock 數據中沒有此字段
      // if (queryParams.walletType && item.walletType !== queryParams.walletType) return false
      if (queryParams.address && !item.fromWalletId.toLowerCase().includes(queryParams.address.toLowerCase())) return false
      return true
    })
    transferList.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 1000)
}

// 初始化數據
onMounted(() => {
  handleQuery()
})

// 重置方法
const handleReset = () => {
  queryParams.merchant = undefined
  queryParams.chainType = undefined
  queryParams.currency = undefined
  queryParams.walletType = undefined
  queryParams.address = ''
}

// 審核相關
const auditModalVisible = ref(false)
const auditDetailModalVisible = ref(false)
const auditLoading = ref(false)
const selectedRecord = ref<TransferRecord | null>(null)
const auditForm = reactive({
  status: undefined as string | undefined,
  reason: ''
})

// 處理審核按鈕點擊
const handleAudit = (record: TransferRecord) => {
  selectedRecord.value = record
  auditForm.status = undefined
  auditForm.reason = ''
  auditModalVisible.value = true
}

// 處理確認審核
const handleConfirmAudit = async () => {
  if (!auditForm.status) {
    message.error(t('wallet.prompt.pleaseSelectAuditOperation'))
    return
  }
  if (!auditForm.reason) {
    message.error(t('wallet.prompt.pleaseInputAuditReason'))
    return
  }

  auditLoading.value = true
  try {
    // TODO: 實現審核邏輯
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 調用
    
    // 更新本地數據
    if (selectedRecord.value) {
      const index = transferList.value.findIndex(item => item.key === selectedRecord.value?.key)
      if (index !== -1) {
        transferList.value[index] = {
          ...transferList.value[index],
          auditStatus: auditForm.status,
          auditReason: auditForm.reason,
          auditTime: new Date().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        }
      }
    }
    
    message.success(t('wallet.prompt.auditSuccess'))
    auditModalVisible.value = false
  } catch (error) {
    message.error(t('wallet.prompt.auditFailed'))
  } finally {
    auditLoading.value = false
  }
}

// 處理取消審核
const handleCancelAudit = () => {
  auditModalVisible.value = false
}

// 處理查看審核詳情
const handleViewAuditDetail = (record: TransferRecord) => {
  selectedRecord.value = record
  auditDetailModalVisible.value = true
}

// 處理表格變更
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  handleQuery()
}
</script>

<style scoped>
@import '../../styles/common.css';

.wallet-transfer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  :deep(.ant-row) {
    flex: 1;
    display: flex;
    margin-bottom: 0;
  }

  :deep(.ant-col) {
    height: auto;
    display: flex;
    flex-direction: column;
  }

  .transfer-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;

    &.from-wallet,
    &.to-wallet {
      min-height: 400px;

      .ant-form {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;

        .form-row {
          flex-shrink: 0;
          display: flex;
          gap: 16px;
          margin-bottom: 0;

          .form-item {
            flex: 1;
            min-width: 0;
            margin-bottom: 0;
          }

          .query-button {
            flex: 0 0 auto;
            margin-left: auto;
            margin-bottom: 0;
          }
        }
      }

      .selection-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
        overflow: auto;
        border-top: 1px solid #303030;
        margin-top: 16px;

        .section {
          flex-shrink: 0;

          .section-title {
            font-weight: 500;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.85);
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #404040;
          }

          .wallet-list-container,
          .coin-list-container {
            max-height: 180px;
            overflow-y: auto;

            .ant-list {
              .wallet-item,
              .coin-item {
                cursor: pointer;
                padding: 10px 12px;
                border-radius: 6px;
                margin-bottom: 6px;
                background-color: #1f1f1f;
                border: 1px solid #303030;
                transition: all 0.3s ease;

                &:hover {
                  background-color: #262626;
                  border-color: #434343;
                }

                &.selected {
                  background-color: #1890ff;
                  border-color: #1890ff;

                  .wallet-info,
                  .coin-info {
                    color: #fff;
                  }
                }

                &.disabled {
                  cursor: not-allowed;
                  opacity: 0.5;
                  background-color: #141414;
                  border-color: #262626;

                  &:hover {
                    background-color: #141414;
                    border-color: #262626;
                  }

                  .wallet-info,
                  .coin-info {
                    color: rgba(255, 255, 255, 0.3);
                  }
                }

                .wallet-info,
                .coin-info {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  width: 100%;

                  .wallet-code,
                  .coin-name {
                    font-weight: 500;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.85);
                  }

                  .wallet-address,
                  .coin-balance {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.65);
                  }
                }
              }
            }
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 30px 20px;
        color: rgba(255, 255, 255, 0.45);
        font-size: 14px;
        border-top: 1px solid #303030;
        margin-top: 16px;
      }

      .empty-coin-state {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.45);
        font-size: 13px;
        background-color: #1a1a1a;
        border: 1px solid #303030;
        border-radius: 6px;
      }
    }
  }

  .detail-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    min-height: 200px;

    .detail-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
      overflow: auto;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .detail-label {
        color: rgba(255, 255, 255, 0.45);
        min-width: 80px;
      }

      .detail-value {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .query-card {
    margin-bottom: 16px;

    :deep(.ant-card-body) {
      padding: 24px;
    }

    .query-form {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .form-row {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        margin: 0;
        flex-wrap: nowrap;

        .form-item {
          flex: 1;
          min-width: 0;
          margin: 0;
          
          :deep(.ant-form-item-label) {
            padding-bottom: 8px;
          }

          :deep(.ant-form-item-control-input) {
            width: 100%;
          }

          :deep(.ant-select),
          :deep(.ant-input),
          :deep(.ant-select-selector) {
            width: 100% !important;
          }

          &.address-input {
            flex: 2;
          }

          &.query-button {
            flex: 0 0 auto;
            margin: 0;

            :deep(.ant-form-item-control) {
              margin-top: 30px;
            }

            :deep(.ant-space) {
              gap: 8px !important;
            }
          }
        }
      }
    }
  }

  .list-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;

    :deep(.ant-card-body) {
      flex: 1;
      padding: 0;
      overflow: hidden;

      .ant-table-wrapper {
        height: 100%;
      }

      .ant-spin-nested-loading,
      .ant-spin-container,
      .ant-table {
        height: 100%;
      }

      .ant-table-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ant-table-body {
        flex: 1;
        overflow: auto;
      }
    }
  }

  .address-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .copy-icon {
    cursor: pointer;
    color: #1890ff;
    font-size: 16px;
    transition: color 0.3s;

    &:hover {
      color: #40a9ff;
    }
  }

}
</style> 