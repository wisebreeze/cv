<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div class="uuid-generator">
      <mdui-text-field :label="t('toolbox.uuid.output')" :value="uuidOutput" readonly auto-rows rows="4"></mdui-text-field>
      
      <div class="button-group">
        <mdui-button variant="filled" @click="generateUUIDs(count)">{{ t('toolbox.uuid.generate') }}</mdui-button>
        <mdui-button @click="generateUUIDs(2)">{{ t('toolbox.uuid.generateTwo') }}</mdui-button>
        <mdui-button @click="generateUUIDs(4)">{{ t('toolbox.uuid.generateFour') }}</mdui-button>
      </div>
      
      <div class="settings-section">
        <h3>{{ t('toolbox.uuid.settings') }}</h3>
        
        <div class="settings-grid">
          <div class="setting">
            <label>{{ t('toolbox.uuid.count') }}</label>
            <mdui-text-field type="number" min="1" max="100" :value="count" @change="e => count = parseInt(e.target.value) || 1"></mdui-text-field>
          </div>
          
          <div class="setting">
            <label>{{ t('toolbox.uuid.version') }}</label>
            <mdui-select :value="version" @change="e => version = e.target.value || 'v4'">
              <mdui-menu-item value="v1">UUID v1</mdui-menu-item>
              <mdui-menu-item value="v3" disabled>UUID v3</mdui-menu-item>
              <mdui-menu-item value="v4">UUID v4</mdui-menu-item>
              <mdui-menu-item value="v5" disabled>UUID v5</mdui-menu-item>
              <mdui-menu-item value="v6">UUID v6</mdui-menu-item>
              <mdui-menu-item value="v7">UUID v7</mdui-menu-item>
            </mdui-select>
          </div>
          
          <div class="setting" v-if="version === 'v3' || version === 'v5'">
            <label>{{ t('toolbox.uuid.namespace') }}</label>
            <mdui-text-field :value="namespace" @change="e => namespace = e.target.value" :placeholder="t('toolbox.uuid.namespacePlaceholder')"></mdui-text-field>
          </div>
          
          <div class="setting" v-if="version === 'v3' || version === 'v5'">
            <label>{{ t('toolbox.uuid.name') }}</label>
            <mdui-text-field :value="name" @change="e => name = e.target.value" :placeholder="t('toolbox.uuid.namePlaceholder')"></mdui-text-field>
          </div>
          
          <mdui-list-item class="setting" rounded>
            <label>{{ t('toolbox.uuid.copyOnGenerate') }}</label>
            <mdui-switch slot="end-icon" :checked="copyOnGenerate" @change="e => copyOnGenerate = e.target.checked"></mdui-switch>
          </mdui-list-item>
          
          <mdui-list-item class="setting" rounded>
            <label>{{ t('toolbox.uuid.copyEachLine') }}</label>
            <mdui-switch slot="end-icon" :checked="copyEachLine" @change="e => copyEachLine = e.target.checked"></mdui-switch>
          </mdui-list-item>
          
          <div class="setting">
            <label>{{ t('toolbox.uuid.case') }}</label>
            <mdui-select :value="uppercase" @change="e => uppercase = e.target.value || 'lower'">
              <mdui-menu-item value="lower">{{ t('toolbox.uuid.lowercase') }}</mdui-menu-item>
              <mdui-menu-item value="upper">{{ t('toolbox.uuid.uppercase') }}</mdui-menu-item>
            </mdui-select>
          </div>
          
          <mdui-list-item class="setting" rounded>
            <label>{{ t('toolbox.uuid.hyphens') }}</label>
            <mdui-switch slot="end-icon" :checked="useHyphens" @change="e => useHyphens = e.target.checked"></mdui-switch>
          </mdui-list-item>
          
          <div class="setting">
            <label>{{ t('toolbox.uuid.resultFormat') }}</label>
            <mdui-select :value="resultStyle" @change="e => resultStyle = e.target.value || 'string'">
              <mdui-menu-item value="string">{{ t('toolbox.uuid.string') }}</mdui-menu-item>
              <mdui-menu-item value="csv">{{ t('toolbox.uuid.csv') }}</mdui-menu-item>
            </mdui-select>
          </div>
        </div>
      </div>
      
      <div class="history-section">
        <h3>{{ t('toolbox.uuid.history') }}</h3>
        <div class="history-list">
          <div v-for="(item, index) in history" :key="index" class="history-item" :class="{ error: item.error }">
            <div class="history-header">
              <span class="time">{{ item.time }}</span>
              <span class="count">{{ t('toolbox.uuid.generatedCount', { count: item.count }) }}</span>
            </div>
            <div v-if="item.error" class="error-message">{{ item.error }}</div>
            <div v-else class="result-preview">
              {{ item.result.length > 0 ? item.result[0] : '' }}
              <span v-if="item.result.length > 1"> {{ t('toolbox.uuid.more', { count: item.result.length - 1 }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()

const uuidOutput = ref('')
const count = ref(1)
const version = ref('v4')
const namespace = ref('')
const name = ref('')
const copyOnGenerate = ref(true)
const copyEachLine = ref(true)
const uppercase = ref('lower')
const useHyphens = ref(true)
const resultStyle = ref('string')
const history = ref([])

watch(version, (newVal) => {
  if (newVal !== 'v3' && newVal !== 'v5') {
    namespace.value = ''
    name.value = ''
  }
})

function generateUUID() {
  const ver = version.value
  let uuid = ''
  
  if (ver === 'v4') {
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    
  } else if (ver === 'v3' || ver === 'v5') {
    const ns = namespace.value
    const n = name.value
    const hashFunc = ver === 'v3' ? md5 : sha1
    
    const hash = hashFunc(ns + n)
    const fullHash = hash.padStart(32, '0').slice(0, 32)
    
    const timeLow = fullHash.substring(0, 8)
    const timeMid = fullHash.substring(8, 12)
    
    const timeHigh = parseInt(fullHash.substring(12, 16), 16)
    const versionBits = ver === 'v3' ? 0x3000 : 0x5000
    const timeHighAndVersion = (timeHigh & 0x0FFF) | versionBits
    
    const clockSeq = parseInt(fullHash.substring(16, 20), 16)
    const clockSeqWithVariant = (clockSeq & 0x3FFF) | 0x8000
    
    const node = fullHash.substring(20, 32)
    
    uuid = timeLow + '-' + 
           timeMid + '-' + 
           timeHighAndVersion.toString(16).padStart(4, '0') + '-' + 
           clockSeqWithVariant.toString(16).padStart(4, '0') + '-' + 
           node
    
  } else if (ver === 'v1' || ver === 'v6' || ver === 'v7') {
    const UUID_EPOCH_OFFSET = 122192928000000000
    const now = Date.now()
    const perf = performance.now()
    const ms = now + Math.floor(perf)
    const ticks = ms * 10000 + Math.floor((perf % 1) * 10000) + UUID_EPOCH_OFFSET
    
    const timeLow = (ticks & 0xFFFFFFFF).toString(16).padStart(8, '0')
    const timeMid = ((ticks >> 32) & 0xFFFF).toString(16).padStart(4, '0')
    const timeHi = (ticks >> 48) & 0x0FFF
    const version = ver === 'v1' ? 0x1000 : ver === 'v6' ? 0x6000 : 0x7000
    const timeHiAndVersion = (timeHi | version).toString(16).padStart(4, '0')
    
    const clockSeq = Math.floor(Math.random() * 0x3FFF)
    const clockSeqWithVariant = (clockSeq | 0x8000)
    const clockSeqStr = clockSeqWithVariant.toString(16).padStart(4, '0')
    
    const nodeBytes = new Uint8Array(6)
    for (let i = 0; i < 6; i++) {
      nodeBytes[i] = Math.floor(Math.random() * 256)
    }
    nodeBytes[0] |= 0x01
    let node = ''
    for (let i = 0; i < 6; i++) {
      node += nodeBytes[i].toString(16).padStart(2, '0')
    }
    
    uuid = timeLow + '-' +
           timeMid + '-' +
           timeHiAndVersion + '-' +
           clockSeqStr + '-' +
           node
  }
  
  return uuid
}

function md5(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(32, '0')
}

function sha1(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(40, '0')
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {}
    document.body.removeChild(textArea)
  }
}

function generateUUIDs(buttonCount = null) {
  const generateCount = buttonCount !== null ? buttonCount : count.value
  const result = []
  let error = null
  
  try {
    if (version.value === 'v3' || version.value === 'v5') {
      if (!namespace.value.trim() || !name.value.trim()) {
        throw new Error(t('toolbox.uuid.namespaceNameRequired'))
      }
    }
    
    for (let i = 0; i < generateCount; i++) {
      result.push(generateUUID())
    }
    
    let formattedResult = uppercase.value === 'upper' 
      ? result.map(id => id.toUpperCase()) 
      : result
    
    if (!useHyphens.value) {
      formattedResult = formattedResult.map(id => id.replace(/-/g, ''))
    }
    
    uuidOutput.value = resultStyle.value === 'csv' 
      ? formattedResult.join(',') 
      : formattedResult.join('\n')
    
    if (copyOnGenerate.value) {
      if (generateCount <= 100 && copyEachLine.value) {
        formattedResult.forEach(line => {
          copyToClipboard(line)
          if (formattedResult.length > 1) {
            setTimeout(() => {}, 50)
          }
        })
      } else {
        copyToClipboard(uuidOutput.value)
      }
    }
  } catch (e) {
    error = e.message
    uuidOutput.value = t('toolbox.uuid.generationError')
  }
  
  history.value.unshift({
    time: new Date().toLocaleTimeString(),
    count: generateCount,
    result: result,
    error: error
  })
  
  if (history.value.length > 10) {
    history.value.pop()
  }
}
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important;
}

.uuid-generator {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  .button-group {
    display: flex;
    margin: 20px 0;
    gap: 12px;
    @media (max-width: 600px) {
      flex-direction: column;
    }
    @media (min-width: 601px) {
      mdui-button {
        flex: 1;
      }
    }
  }
  .settings-section {
    margin-top: 30px;
    background: var(--mdui-color-surface-container);
    border-radius: 12px;
    h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: var(--mdui-color-on-surface);
      font-size: 1.2rem;
    }
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    .setting {
      display: flex;
      flex-direction: column;
      gap: 8px;
      label {
        font-size: 0.9rem;
        color: var(--mdui-color-on-surface-variant);
      }
    }
  }
  .history-section {
    margin-top: 30px;
    h3 {
      margin-bottom: 15px;
      color: var(--mdui-color-on-surface);
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
      padding: 5px;
    }
    .history-item {
      background: var(--mdui-color-surface-container-low);
      border-radius: 8px;
      padding: 15px;
      transition: all 0.2s;
      &.error {
        background: var(--mdui-color-surface-container-high);
        border-left: 4px solid var(--mdui-color-error);
      }
      .history-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.85rem;
        .time {
          color: var(--mdui-color-on-surface-variant);
        }
        .count {
          font-weight: 500;
        }
      }
      .error-message {
        color: var(--mdui-color-error);
        font-size: 0.9rem;
      }
      .result-preview {
        font-family: monospace;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>