<template>
  <a-config-provider
    :theme="{
      algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    }"
    :locale="locale"
  >
    <div :class="isDark ? 'dark' : ''">
      <router-view></router-view>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'
import { watch } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import { theme } from 'ant-design-vue'
import { ref } from 'vue'

const { darkAlgorithm, defaultAlgorithm } = theme

const isDark = useDark()
const { locale: i18nLocale } = useI18n()
const locale = ref(zhCN)

watch(i18nLocale, (val) => {
  locale.value = val === 'zh' ? zhCN : enUS
})
</script>

<style>
.dark {
  background-color: #141414;
  color: #fff;
}

#app {
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
}
</style>
