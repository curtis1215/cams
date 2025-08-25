<template>
  <div class="version-display">
    <span class="version-text">v{{ version }}</span>
  </div>
</template>

<script setup lang="ts">
import packageJson from '../../package.json'

const version = packageJson.version
</script>

<style scoped>
.version-display {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 8px;
}

.version-text {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: white;
}

/* 亮色模式樣式 */
body:not(.dark) .version-display {
  color: rgba(255, 255, 255, 0.9);
}

body:not(.dark) .version-text {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}
</style>