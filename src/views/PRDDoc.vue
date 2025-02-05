<template>
  <div class="prd-doc-container">
    <div class="toc-container">
      <div class="toc-header">
        <h3>目錄</h3>
      </div>
      <div class="toc-content" v-html="tocContent"></div>
    </div>
    <a-card :bordered="false" class="prd-card">
      <div class="markdown-content" v-html="markdownContent"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import DOMPurify from 'dompurify'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import mermaid from 'mermaid'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
// @ts-ignore
import mdKatex from 'markdown-it-katex'
// 導入 PRD 文檔
import prdContent from '../docs/prd.md?raw'

// 初始化 markdown-it
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {
        // 如果高亮失敗，使用普通文本
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 添加 KaTeX 支援
md.use(mdKatex)

// 配置 inline math
md.inline.ruler.after('escape', 'math_inline', (state: any, silent: boolean) => {
  const start = state.pos
  const max = state.posMax

  if (state.src[start] !== '$') return false
  if (start + 2 >= max) return false
  if (state.src[start + 1] === '$') return false // 避免與 display math 衝突

  let end = start + 1
  while (end < max && state.src[end] !== '$') {
    end++
  }

  if (end === max || state.src[end] !== '$') return false

  if (!silent) {
    const content = state.src.slice(start + 1, end)
    try {
      const rendered = katex.renderToString(content, {
        throwOnError: false,
        displayMode: false
      })
      state.push('html_inline', '', 0).content = rendered
    } catch (error) {
      state.push('text', '', 0).content = content
    }
  }

  state.pos = end + 1
  return true
})

// 配置 mermaid
mermaid.initialize({
  theme: 'dark',
  startOnLoad: false,
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#1f2937',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#374151',
    lineColor: '#9ca3af',
    secondaryColor: '#374151',
    tertiaryColor: '#1f2937',
    
    // 節點樣式
    nodeBorder: '#4b5563',
    nodeTextColor: '#e5e7eb',
    
    // 子圖樣式
    subGraphBkg: '#111827',
    subGraphBorder: '#4b5563',
    subGraphTextColor: '#e5e7eb',

    // 箭頭顏色
    edgeColor: '#9ca3af',
    
    // 字體
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px'
  }
})

// 配置 markdown-it-container 來處理 mermaid 區塊
md.use(container, 'mermaid', {
  validate: function(params: string) {
    return params.trim().match(/^mermaid$/)
  },
  render: function(tokens: any[], idx: number) {
    if (tokens[idx].nesting === 1) {
      return '<div class="mermaid">'
    } else {
      return '</div>'
    }
  }
})

const markdownContent = ref('')
const tocContent = ref('')
const lastContent = ref('')

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

// 渲染 Mermaid 圖表
const renderMermaidDiagrams = async () => {
  const elements = document.querySelectorAll<HTMLElement>('.mermaid')
  elements.forEach(async (element) => {
    try {
      const code = element.textContent || ''
      const { svg } = await mermaid.render('mermaid-' + Math.random().toString(36).substr(2, 9), code)
      element.innerHTML = svg
    } catch (error) {
      console.error('Mermaid 渲染失敗:', error)
    }
  })
}

// 更新目錄和內容
const updateContent = async (content: string) => {
  // 生成標題映射
  const headingMap = generateHeadingMap(content)

  // 生成目錄
  tocContent.value = DOMPurify.sanitize(generateToc(content, headingMap))
  
  // 添加標題 id 並轉換 markdown
  const contentWithIds = addHeadingIds(content, headingMap)
  const rawHtml = md.render(contentWithIds)
  markdownContent.value = DOMPurify.sanitize(rawHtml)

  // 等待 DOM 更新後渲染 Mermaid 圖表
  await nextTick()
  await renderMermaidDiagrams()
}

onMounted(async () => {
  try {
    const content = prdContent
    lastContent.value = content
    await updateContent(content)
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
  background: #141414;
  border-radius: 8px;
  border: 1px solid #303030;
  overflow-y: auto;
  position: fixed;
  top: 88px;
  left: 24px;
  bottom: 24px;
  max-height: calc(100vh - 112px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.prd-card {
  flex: 1;
  margin-left: 304px; /* 280px + 24px gap */
  overflow: auto;
}

.toc-header {
  padding: 16px;
  border-bottom: 1px solid #303030;
  background: #1f1f1f;
}

.toc-header h3 {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.toc-content {
  padding: 12px 8px;
}

:deep(.toc-list) {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

:deep(.toc-sublist) {
  list-style: none;
  padding-left: 16px;
  margin: 4px 0;
  position: relative;
}

:deep(.toc-sublist::before) {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #303030;
}

:deep(.toc-item) {
  margin: 4px 0;
  position: relative;
}

:deep(.toc-link) {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.5;
  display: block;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.toc-link:hover) {
  color: var(--ant-primary-color);
  background: rgba(255, 255, 255, 0.04);
}

:deep(.toc-item.active .toc-link) {
  color: var(--ant-primary-color);
  background: rgba(var(--ant-primary-color-rgb), 0.1);
  font-weight: 500;
}

/* 滾動條樣式 */
.toc-container::-webkit-scrollbar {
  width: 6px;
}

.toc-container::-webkit-scrollbar-thumb {
  background: #434343;
  border-radius: 3px;
}

.toc-container::-webkit-scrollbar-track {
  background: transparent;
}

.toc-container:hover::-webkit-scrollbar-thumb {
  background: #525252;
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
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  margin: 1.5em 0;
  color: var(--ant-text-color);
  background: transparent;
  border: 1px solid #303030;
  border-radius: 8px;
  overflow: hidden;
}

.markdown-content :deep(th) {
  background: #1f1f1f;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #303030;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.markdown-content :deep(td) {
  padding: 12px 16px;
  border-bottom: 1px solid #303030;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
}

.markdown-content :deep(tr:last-child) td {
  border-bottom: none;
}

.markdown-content :deep(tr) {
  background-color: #141414;
  transition: background-color 0.3s ease;
}

.markdown-content :deep(tr:nth-child(2n)) {
  background-color: #1f1f1f;
}

.markdown-content :deep(tr:hover) {
  background-color: rgba(255, 255, 255, 0.08);
}

/* 深色模式特定樣式 */
:deep([data-theme='dark']) .markdown-content table {
  background: transparent;
  border-color: #303030;
}

:deep([data-theme='dark']) .markdown-content th {
  background: #1f1f1f;
  border-bottom-color: #303030;
  color: rgba(255, 255, 255, 0.85);
}

:deep([data-theme='dark']) .markdown-content td {
  border-bottom-color: #303030;
  color: rgba(255, 255, 255, 0.85);
}

:deep([data-theme='dark']) .markdown-content tr {
  background-color: #141414;
}

:deep([data-theme='dark']) .markdown-content tr:nth-child(2n) {
  background-color: #1f1f1f;
}

:deep([data-theme='dark']) .markdown-content tr:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* 表格容器樣式 */
.markdown-content :deep(.table-container) {
  padding: 12px;
  background: #141414;
  border-radius: 8px;
  margin: 1.5em 0;
}

/* 單元格內容樣式 */
.markdown-content :deep(td > code) {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid #303030;
  color: rgba(255, 255, 255, 0.85);
}

/* 數字對齊 */
.markdown-content :deep(td[align="right"]) {
  text-align: right;
}

.markdown-content :deep(td[align="center"]) {
  text-align: center;
}

.markdown-content :deep(.mermaid) {
  background: var(--ant-background-color-base);
  padding: 24px;
  border-radius: 8px;
  margin: 1.5em 0;
  text-align: center;
  border: 1px solid var(--ant-border-color-split);
}

.markdown-content :deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
  filter: brightness(1.1);
}

/* 深色模式特定樣式 */
:deep([data-theme='dark']) .markdown-content .mermaid {
  background: #111827;
}

:deep([data-theme='dark']) .markdown-content .mermaid svg {
  filter: brightness(1.2);
}

/* 代碼區塊樣式 */
.markdown-content :deep(pre.hljs) {
  padding: 16px;
  border-radius: 8px;
  margin: 1.5em 0;
  background: #282c34;
  border: 1px solid var(--ant-border-color-split);
  overflow-x: auto;
}

.markdown-content :deep(code) {
  font-family: 'JetBrains Mono', Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* 行內代碼樣式 */
.markdown-content :deep(:not(pre) > code) {
  padding: 2px 6px;
  margin: 0 2px;
  border-radius: 4px;
  background: var(--ant-background-color-base);
  border: 1px solid var(--ant-border-color-split);
  color: var(--ant-text-color);
}

/* 深色模式特定樣式 */
:deep([data-theme='dark']) .markdown-content pre.hljs {
  background: #1a1d23;
  border-color: #2a2e37;
}

:deep([data-theme='dark']) .markdown-content :not(pre) > code {
  background: #1a1d23;
  border-color: #2a2e37;
}

/* 添加 KaTeX 相關樣式 */
:deep(.katex) {
  font-size: 1.1em;
}

:deep(.katex-display) {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

:deep(.katex-display > .katex) {
  white-space: normal;
}

:deep(.katex-display > .katex > .katex-html) {
  overflow-x: auto;
  overflow-y: hidden;
  padding-left: 2px;
  padding-right: 2px;
}

/* 深色模式支援 */
:deep([data-theme='dark']) .katex {
  color: var(--ant-text-color);
}

:deep([data-theme='dark']) .katex .mord {
  color: var(--ant-text-color);
}
</style> 