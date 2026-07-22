<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div class="click-test-container">
      <div 
        class="test-card"
        @click="handleCardClick"
        @keydown.enter="handleKeyPress"
        tabindex="0"
      >
        <div v-if="showStartPrompt" class="start-prompt">{{ t('toolbox.cps.startPrompt') }}</div>
        
        <div v-if="isTesting || showResults" class="card-content">
          <div class="main-count">{{ displayCount }}</div>
          <div v-if="isTesting && testType === 'fixed'" class="time-left">{{ t('toolbox.cps.timeLeft') }}: {{ timeLeft }}s</div>
          <div v-if="showResults" class="test-complete">{{ t('toolbox.cps.testComplete') }}</div>
        </div>
        
        <div v-if="showResults" class="card-footer">
          <mdui-button @click="resetTest">{{ t('toolbox.cps.restart') }}</mdui-button>
        </div>
      </div>
      
      <Transition name="fade-collapse">
        <div v-if="showProgress" class="progress-container">
          <mdui-linear-progress :value="timeLeft" :max="testDuration"></mdui-linear-progress>
        </div>
      </Transition>
      
      <div class="stats-panel">
        <div class="stat-item" v-if="showTotalCount || showResults">
          <div class="stat-label">{{ t('toolbox.cps.totalClicks') }}</div>
          <div class="stat-value">{{ totalClicks }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">{{ t('toolbox.cps.cps') }}</div>
          <div class="stat-value">{{ currentCPS }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">{{ t('toolbox.cps.maxCPS') }}</div>
          <div class="stat-value">{{ maxCPS }}</div>
        </div>
        
        <div class="stat-item" v-if="showResults">
          <div class="stat-label">{{ t('toolbox.cps.averageCPS') }}</div>
          <div class="stat-value">{{ averageCPS }}</div>
        </div>
      </div>
      
      <div class="control-panel">
        <mdui-select 
          :label="t('toolbox.cps.testType')" 
          :value="testType"
          @change="handleTestTypeChange"
        >
          <mdui-menu-item value="cps">{{ t('toolbox.cps.cpsTest') }}</mdui-menu-item>
          <mdui-menu-item value="fixed">{{ t('toolbox.cps.fixedTimeTest') }}</mdui-menu-item>
        </mdui-select>
        
        <mdui-select 
          v-if="testType === 'fixed'"
          :label="t('toolbox.cps.duration')" 
          :value="testDuration"
          @change="handleDurationChange"
        >
          <mdui-menu-item v-for="time in durations" :key="time" :value="time">{{ time }} {{ t('toolbox.cps.seconds') }}</mdui-menu-item>
        </mdui-select>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()

const testType = ref('fixed')
const testDuration = ref(8)
const durations = [5, 8, 10, 15, 20, 30]
const isTesting = ref(false)
const showResults = ref(false)
const showStartPrompt = ref(true)

const clickCount = ref(0)
const totalClicks = ref(0)
const currentCPS = ref(0)
const maxCPS = ref(0)
const timeLeft = ref(0)
const keyPressed = ref(false)

let cpsTimer = null
let fixedTimer = null
let secondTimer = null
let elapsedSeconds = 0

const displayCount = computed(() => {
  if (testType.value === 'cps') return clickCount.value
  return totalClicks.value
})

const showTotalCount = computed(() => {
  return testType.value === 'fixed' && isTesting.value
})

const showProgress = computed(() => {
  return testType.value === 'fixed' && isTesting.value
})

const averageCPS = computed(() => {
  if (testDuration.value === 0) return 0
  return (totalClicks.value / testDuration.value).toFixed(2)
})

function handleCardClick() {
  if (showStartPrompt.value) {
    showStartPrompt.value = false
  }
  
  if (!isTesting.value && !showResults.value) {
    startTest()
    return
  }
  
  if (isTesting.value) {
    registerClick()
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (!keyPressed.value) {
      registerClick()
      keyPressed.value = true
    }
  }
}

function handleKeyUp(event) {
  if (event.key === 'Enter') {
    keyPressed.value = false
  }
}

function registerClick() {
  clickCount.value++
  totalClicks.value++
  
  if (testType.value === 'cps') {
    currentCPS.value = clickCount.value
    if (clickCount.value > maxCPS.value) {
      maxCPS.value = clickCount.value
    }
  }
}

function startTest() {
  resetCounters()
  isTesting.value = true
  showResults.value = false
  elapsedSeconds = 0
  
  document.addEventListener('keydown', handleKeyPress)
  document.addEventListener('keyup', handleKeyUp)
  
  if (testType.value === 'cps') {
    startCPSTest()
  } else {
    startFixedTimeTest()
  }
}

function startCPSTest() {
  cpsTimer = setInterval(() => {
    clickCount.value = 0
    currentCPS.value = 0
  }, 1000)
}

function startFixedTimeTest() {
  timeLeft.value = testDuration.value
  
  secondTimer = setInterval(() => {
    elapsedSeconds++
    
    currentCPS.value = clickCount.value
    if (clickCount.value > maxCPS.value) {
      maxCPS.value = clickCount.value
    }
    
    clickCount.value = 0
  }, 1000)
  
  fixedTimer = setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 0) {
      endTest()
    }
  }, 1000)
}

function endTest() {
  isTesting.value = false
  showResults.value = true

  clearInterval(cpsTimer)
  clearInterval(fixedTimer)
  clearInterval(secondTimer)
  
  document.removeEventListener('keydown', handleKeyPress)
  document.removeEventListener('keyup', handleKeyUp)
}

function resetTest() {
  clearInterval(cpsTimer)
  clearInterval(fixedTimer)
  clearInterval(secondTimer)

  resetCounters()
  isTesting.value = false
  showResults.value = false
  showStartPrompt.value = true
}

function resetCounters() {
  clickCount.value = 0
  totalClicks.value = 0
  currentCPS.value = 0
  maxCPS.value = 0
  timeLeft.value = 0
  elapsedSeconds = 0
}

function handleTestTypeChange(event) {
  testType.value = event.target.value || "fixed"
  resetTest()
}

function handleDurationChange(event) {
  testDuration.value = parseInt(event.target.value || 8)
  resetTest()
}

onUnmounted(() => {
  clearInterval(cpsTimer)
  clearInterval(fixedTimer)
  clearInterval(secondTimer)
  document.removeEventListener('keydown', handleKeyPress)
  document.removeEventListener('keyup', handleKeyUp)
})
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important
}

.click-test-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.test-card {
  background: rgba(var(--mdui-color-surface-container-highest), 0.6);
  border-radius: 24px;
  height: 50vh;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  outline: none;
  
  &:active {
    transform: scale(0.98);
    background: rgba(var(--mdui-color-surface-container-high), 0.6);
  }
}

.start-prompt {
  font-size: 1.5rem;
  color: var(--mdui-color-on-surface-variant);
  text-align: center;
  padding: 0 20px;
}

.card-content {
  text-align: center;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.main-count {
  font-size: 5rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--mdui-color-primary);
}

.time-left {
  font-size: 1.2rem;
  color: var(--mdui-color-on-surface-variant);
}

.test-complete {
  font-size: 1.2rem;
  color: var(--mdui-color-primary);
  margin-top: 8px;
}

.card-footer {
  width: 100%;
  padding: 16px;
  border-top: 1px solid var(--mdui-color-outline-variant);
  text-align: center;
}

.progress-container {
  margin: 0 auto 24px;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
}

.stats-panel {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 120px;
  text-align: center;
  background: var(--mdui-color-surface-container-low);
  border-radius: 16px;
  padding: 16px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--mdui-color-on-surface-variant);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--mdui-color-primary);
}

.control-panel {
  background: var(--mdui-color-surface-container-low);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  
  mdui-select {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.fade-collapse-enter-active, .fade-collapse-leave-active {
  transition: opacity 0.3s ease, height 0.3s ease, margin 0.3s ease;
}

.fade-collapse-enter-from, .fade-collapse-leave-to {
  opacity: 0;
  height: 0;
  margin: 0;
}

@media (max-width: 800px) {
  .test-card {
    height: 40vh;
  }
  
  .main-count {
    font-size: 4rem;
  }
}

@media (max-width: 80px) {
  .stat-item {
    min-width: 100%;
  }

  .stats-panel {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    min-width: calc(50% - 8px);
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>