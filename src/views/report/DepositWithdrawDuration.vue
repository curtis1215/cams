<template>
  <div class="deposit-withdraw-duration">
    <a-card :bordered="false" class="filter-card">
      <template #title>
        <span class="card-title">{{ t('report.depositWithdrawDuration.title') }}</span>
      </template>
      <!-- 查詢表單將在後續實現 -->
    </a-card>

    <a-card :bordered="false" class="table-card">
      <template #title>
        <span class="card-title">{{ t('report.depositWithdrawDuration.resultTitle') }}</span>
      </template>
      <!-- 表格內容將在後續實現 -->
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.deposit-withdraw-duration {
  width: 100%;
}
</style> 