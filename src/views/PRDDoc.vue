<template>
  <div class="prd-doc-container">
    <div class="toc-container">
      <div class="toc-content" v-html="tocContent"></div>
    </div>
    <a-card :bordered="false" class="prd-card">
      <div class="markdown-content" v-html="markdownContent"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import axios from 'axios'

// 配置 marked 使用同步模式
marked.setOptions({
  async: false
})

const markdownContent = ref('')
const tocContent = ref('')

interface Heading {
  level: number
  title: string
  id: string
}

interface HeadingMap {
  [key: string]: string;
}

// 生成標題 ID 映射
const generateHeadingMap = (content: string): HeadingMap => {
  const headingMap: HeadingMap = {}
  const lines = content.split('\n')
  const usedIds = new Set<string>()

  lines.forEach(line => {
    if (line.startsWith('#')) {
      const title = line.replace(/^#+\s*/, '')
      // 生成英文 ID
      let id = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // 保留中文字符
        .replace(/^-+|-+$/g, '') // 移除首尾的連字符
        .split('-')
        .map(part => {
          // 如果是中文，轉換為拼音或相關英文詞
          if (/[\u4e00-\u9fa5]/.test(part)) {
            const mapping: { [key: string]: string } = {
              '告警': 'alert',
              '監控': 'monitoring',
              '數據': 'data',
              '節點': 'node',
              '高度': 'height',
              '錢包': 'wallet',
              '訂單': 'order',
              '對帳': 'reconciliation',
              '報表': 'report',
              '參數': 'params',
              '系統': 'system',
              '管理': 'management'
            }
            return part.split('').map(char => mapping[char] || char).join('-')
          }
          return part
        })
        .join('-')

      // 確保 ID 唯一
      let uniqueId = id
      let counter = 1
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`
        counter++
      }
      usedIds.add(uniqueId)

      headingMap[title] = uniqueId
    }
  })

  return headingMap
}

// 修改生成 ID 的函數
const generateId = (text: string, headingMap: HeadingMap): string => {
  return headingMap[text] || text
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

// 修改 markdown 標題，添加 id
const addHeadingIds = (content: string, headingMap: HeadingMap): string => {
  return content.replace(/^(#{1,6})\s*(.*?)$/gm, (match, hashes, title) => {
    const id = generateId(title, headingMap)
    return `${hashes} <span id="${id}"></span>${title}`
  })
}

// 修改生成目錄的函數
const generateToc = (content: string, headingMap: HeadingMap): string => {
  const headings: Heading[] = []
  const lines = content.split('\n')
  
  lines.forEach(line => {
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 0
      const title = line.replace(/^#+\s*/, '')
      const id = generateId(title, headingMap)
      headings.push({ level, title, id })
    }
  })

  let toc = '<ul class="toc-list">'
  let prevLevel = 1
  
  headings.forEach(({ level, title, id }) => {
    if (level > prevLevel) {
      toc += '<ul class="toc-sublist">'.repeat(level - prevLevel)
    } else if (level < prevLevel) {
      toc += '</ul>'.repeat(prevLevel - level)
    }
    
    toc += `<li class="toc-item">
      <a href="#${id}" class="toc-link" onclick="event.preventDefault(); document.getElementById('${id}').scrollIntoView({ behavior: 'smooth', block: 'start' }); window.scrollBy(0, -100);">${title}</a>
    </li>`
    
    prevLevel = level
  })
  
  toc += '</ul>'.repeat(prevLevel - 1)
  toc += '</ul>'
  
  return toc
}

onMounted(async () => {
  try {
    // 從外部文件加載 Markdown 內容
    const response = await axios.get('/src/docs/prd.md')
    const content = response.data as string

    // 生成標題映射
    const headingMap = generateHeadingMap(content)

    // 生成目錄
    tocContent.value = DOMPurify.sanitize(generateToc(content, headingMap))
    
    // 添加標題 id 並轉換 markdown
    const contentWithIds = addHeadingIds(content, headingMap)
    const rawHtml = marked.parse(contentWithIds) as string
    markdownContent.value = DOMPurify.sanitize(rawHtml)
  } catch (error) {
    console.error('加載 PRD 文檔失敗:', error)
  }
})
</script>

<style scoped>
.prd-doc-container {
  height: 100%;
  display: flex;
  gap: 24px;
  padding: 24px;
  position: relative;
}

.toc-container {
  width: 280px;
  flex-shrink: 0;
  background: var(--ant-background-color);
  border-radius: 8px;
  border: 1px solid var(--ant-border-color-split);
  overflow-y: auto;
  position: fixed;
  top: 88px; /* 64px header + 24px padding */
  left: 24px;
  bottom: 24px;
  max-height: calc(100vh - 112px); /* 100vh - 64px header - 48px padding */
}

.prd-card {
  flex: 1;
  margin-left: 304px; /* 280px + 24px gap */
  overflow: auto;
}

:deep(.toc-list) {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

:deep(.toc-sublist) {
  list-style: none;
  padding-left: 16px;
  margin: 0;
}

:deep(.toc-item) {
  margin: 4px 0;
}

:deep(.toc-link) {
  color: var(--ant-text-color);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.5;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.toc-link:hover) {
  color: var(--ant-primary-color);
  background: var(--ant-primary-1);
}

.markdown-content {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ant-text-color);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  position: relative;
  scroll-margin-top: 100px;
}

.markdown-content :deep(span[id]) {
  position: absolute;
  top: -100px;
  visibility: hidden;
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