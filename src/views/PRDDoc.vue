<template>
  <div class="prd-doc-container">
    <a-card :bordered="false" class="prd-card">
      <div class="markdown-content" v-html="markdownContent"></div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 配置 marked 使用同步模式
marked.setOptions({
  async: false
})

const markdownContent = ref('')

const prdContent = `
# CAMS - 加密貨幣資產管理系統

## 系統概述

CAMS（Cryptocurrency Asset Management System）是一個專業的加密貨幣資產管理系統，為商戶提供完整的加密貨幣資產管理解決方案。

### 核心功能

#### 1. 監控管理
- **數據監控**：實時監控系統運行狀態
- **告警監控**：異常情況即時告警
- **節點高度監控**：區塊鏈節點同步狀態監控

#### 2. 錢包管理
- **錢包查詢**：多維度查詢錢包信息
- **錢包詳情**：查看錢包詳細信息
- **錢包轉賬**：進行錢包間轉賬操作
- **代幣兌換**：不同代幣間的兌換功能

#### 3. 訂單管理
- **充值訂單**：充值訂單查詢和管理
- **提現訂單**：提現訂單查詢和管理
- **轉賬訂單**：轉賬訂單查詢和管理
- **兌換訂單**：兌換訂單查詢和管理
- **交易明細**：詳細的交易記錄查詢

#### 4. 對帳管理
- **錢包餘額對帳**：自動化對帳功能

#### 5. 數據報表
- **充提時長報表**：分析充提幣效率
- **錢包盈虧查詢**：分析錢包資產變化
- **節點高度分析**：分析節點同步情況

#### 6. 參數管理
- **區塊鏈管理**：管理支持的區塊鏈
- **合約幣種管理**：管理支持的代幣

#### 7. 系統管理
- **用戶管理**：系統用戶管理
- **角色管理**：權限角色管理
- **商戶管理**：商戶信息管理

## 技術架構

### 前端技術棧
- Vue 3
- Ant Design Vue
- Vue Router
- Vite
- TypeScript

### 後端技術棧
- Node.js
- Express
- MongoDB
- Redis

### 區塊鏈集成
- Web3.js
- Ethers.js

## 部署要求

### 硬件要求
- CPU: 8核心以上
- 內存: 16GB以上
- 硬碟: 500GB以上 SSD

### 軟件要求
- Node.js 16+
- MongoDB 4.4+
- Redis 6+
- Docker 20+

## 安全措施

### 數據安全
- 數據加密存儲
- 定期數據備份
- 敏感信息脫敏

### 訪問安全
- 多因素認證
- IP白名單
- 操作日誌記錄

### 錢包安全
- 多重簽名
- 冷熱錢包分離
- 私鑰加密存儲

## 更新日誌

### v1.0.0 (2024-03-20)
- 初始版本發布
- 基礎功能實現

### v1.0.1 (2024-03-21)
- 修復已知問題
- 優化用戶體驗
- 提升系統穩定性
`

onMounted(() => {
  // 將 markdown 轉換為 HTML 並進行安全處理
  const rawHtml = marked.parse(prdContent, { async: false })
  markdownContent.value = DOMPurify.sanitize(rawHtml)
})
</script>

<style scoped>
.prd-doc-container {
  height: 100%;
  overflow: auto;
}

.prd-card {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--ant-background-color);
}

.markdown-content {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ant-text-color);
}

.markdown-content :deep(h1) {
  font-size: 2em;
  margin-bottom: 1em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--ant-border-color-split);
  color: var(--ant-heading-color);
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  margin-top: 1.5em;
  margin-bottom: 1em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--ant-border-color-split);
  color: var(--ant-heading-color);
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--ant-heading-color);
}

.markdown-content :deep(h4) {
  font-size: 1.1em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--ant-heading-color);
}

.markdown-content :deep(p) {
  margin: 1em 0;
  color: var(--ant-text-color);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
  color: var(--ant-text-color);
}

.markdown-content :deep(li) {
  margin: 0.5em 0;
}

.markdown-content :deep(code) {
  background-color: var(--ant-background-color-base);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  color: var(--ant-text-color);
}

.markdown-content :deep(pre) {
  background-color: var(--ant-background-color-base);
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
}

.markdown-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0 1em;
  color: var(--ant-text-color-secondary);
  border-left: 0.25em solid var(--ant-border-color-split);
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  color: var(--ant-text-color);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 6px 13px;
  border: 1px solid var(--ant-border-color-split);
}

.markdown-content :deep(tr) {
  background-color: var(--ant-background-color);
  border-top: 1px solid var(--ant-border-color-split);
}

.markdown-content :deep(tr:nth-child(2n)) {
  background-color: var(--ant-background-color-base);
}

:deep(.ant-card) {
  background: var(--ant-background-color);
}
</style> 