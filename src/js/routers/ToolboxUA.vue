<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <mdui-text-field 
      :label="t('toolbox.ua.uaInputLabel')" 
      fullwidth 
      rows="3" 
      variant="filled" 
      v-model="uaInput"
      style="padding: 16px;box-sizing: border-box;"
    />

    <mdui-list>
      <mdui-list-item v-for="item in analysisResults" :key="item.label">
        <span>{{ t('toolbox.ua.' + item.label) }}</span>
        <span slot="description">{{ item.value }}</span>
      </mdui-list-item>
      
      <mdui-list-item v-if="showCurrentUA">
        <span>{{ t('toolbox.ua.currentUA') }}</span>
        <span slot="description">{{ currentUA }}</span>
      </mdui-list-item>
    </mdui-list>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()
const uaInput = ref('')
const currentUA = ref(navigator.userAgent)

const showCurrentUA = computed(() => uaInput.value.trim() === '')

const analysisResults = computed(() => {
  const ua = uaInput.value.trim() || currentUA.value
  return [
    { label: 'browser', value: parseBrowser(ua) },
    { label: 'os', value: parseOS(ua) },
    { label: 'engine', value: parseEngine(ua) },
    { label: 'deviceType', value: parseDeviceType(ua) }
  ]
})

function parseBrowser(ua) {
  const matches = {
    chrome: /Chrome\/(\d+)/,
    firefox: /Firefox\/(\d+)/,
    safari: /Version\/(\d+).+Safari/,
    edge: /Edg\/(\d+)/,
    opera: /OPR\/(\d+)/
  }
  
  for (const [browser, regex] of Object.entries(matches)) {
    const match = ua.match(regex)
    if (match) return `${t('toolbox.ua.' + browser)} ${match[1]}`
  }
  return t('unknown')
}

function parseOS(ua) {
  if (/Android/.test(ua)) return 'Android / HarmonyOS / HyperOS'
  if (/Windows NT/.test(ua)) return 'Windows'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  return t('toolbox.ua.unknown')
}

function parseEngine(ua) {
  if (/AppleWebKit/.test(ua)) return 'WebKit'
  if (/Gecko/.test(ua)) return 'Gecko'
  if (/Trident/.test(ua)) return 'Trident'
  if (/Blink/.test(ua)) return 'Blink'
  return t('toolbox.ua.unknown')
}

function parseDeviceType(ua) {
  if (/Mobi|Android|iPhone|iPad|iPod/.test(ua)) return t('toolbox.ua.mobile')
  if (/Windows|Mac|Linux/.test(ua)) return t('toolbox.ua.desktop')
  return t('toolbox.ua.other')
}
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important
}
</style>