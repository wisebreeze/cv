<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div class="stopwatch-container">
      <div class="time-display" :class="{'small-font': hours >= 100}">
        {{ formattedTime }}
      </div>
      <div class="records-container">
        <transition-group name="record-item" tag="div">
          <div v-for="(record, index) in records" :key="record.id" class="record-item">
            <div class="record-index">#{{ records.length - index }}</div>
            <div class="record-details">
              <div class="record-time">{{ formatRecordTime(record.time) }}</div>
              <div class="record-diff">+{{ formatRecordTime(record.diff) }}</div>
            </div>
          </div>
        </transition-group>
      </div>
      <div class="controls">
        <mdui-button-icon v-if="state !== 'stopped'" class="reset-btn" :disabled="state === 'running'" @click="reset">
          <mdui-tooltip :content="t('toolbox.stopwatch.reset')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
          </mdui-tooltip>
        </mdui-button-icon>
        
        <mdui-button-icon class="main-btn" variant="filled" @click="toggleTimer">
          <mdui-tooltip :content="mainButtonText">
            <ion-icon :name="state === 'stopped' || state === 'paused' ? 'play-outline' : 'pause-outline'"></ion-icon>
          </mdui-tooltip>
        </mdui-button-icon>
        
        <mdui-button-icon v-if="state !== 'stopped'" class="record-btn" :disabled="state !== 'running'" @click="recordTime">
          <mdui-tooltip :content="t('toolbox.stopwatch.record')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </mdui-tooltip>
        </mdui-button-icon>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()

const state = ref('stopped')
const startTime = ref(0)
const elapsedTime = ref(0)
const pauseStart = ref(0)
const pauseTime = ref(0)
const animationRef = ref(null)
const records = ref([])
const lastRecordTime = ref(0)

const hours = computed(() => {
  return Math.floor(elapsedTime.value / 3600000)
})

const formattedTime = computed(() => {
  const ms = elapsedTime.value
  const hrs = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  const centisecs = Math.floor((ms % 1000) / 10)
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
})

const mainButtonText = computed(() => {
  if (state.value === 'stopped') return t('toolbox.stopwatch.start')
  if (state.value === 'paused') return t('toolbox.stopwatch.resume')
  return t('toolbox.stopwatch.pause')
})

function formatRecordTime(ms) {
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  const centisecs = Math.floor((ms % 1000) / 10)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
}

function updateTimer() {
  if (state.value === 'running') {
    elapsedTime.value = Date.now() - startTime.value - pauseTime.value
    animationRef.value = requestAnimationFrame(updateTimer)
  }
}

function toggleTimer() {
  if (state.value === 'stopped') {
    startTime.value = Date.now()
    state.value = 'running'
    animationRef.value = requestAnimationFrame(updateTimer)
  } else if (state.value === 'running') {
    state.value = 'paused'
    pauseStart.value = Date.now()
    cancelAnimationFrame(animationRef.value)
  } else if (state.value === 'paused') {
    pauseTime.value += Date.now() - pauseStart.value
    state.value = 'running'
    animationRef.value = requestAnimationFrame(updateTimer)
  }
}

function recordTime() {
  if (state.value === 'stopped') return
  
  const currentTime = elapsedTime.value
  const diff = lastRecordTime.value === 0 ? currentTime : currentTime - lastRecordTime.value
  lastRecordTime.value = currentTime
  
  records.value.unshift({
    id: Date.now(),
    time: currentTime,
    diff: diff
  })
}

function reset() {
  state.value = 'stopped'
  cancelAnimationFrame(animationRef.value)
  elapsedTime.value = 0
  startTime.value = 0
  pauseTime.value = 0
  records.value = []
  lastRecordTime.value = 0
}

onUnmounted(() => {
  cancelAnimationFrame(animationRef.value)
})
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important
}

.stopwatch-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.time-display {
  font-family: monospace;
  font-size: 4.5rem;
  font-weight: bold;
  text-align: center;
  margin: 2rem 0;
  color: var(--mdui-color-primary);
  
  &.small-font {
    font-size: 3.5rem;
  }
}

.records-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
  padding: 0 16px;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--mdui-color-outline-variant);
  transition: all 0.3s ease;
}

.record-index {
  font-weight: bold;
  margin-right: 16px;
  color: var(--mdui-color-on-surface);
  min-width: 36px;
}

.record-details {
  flex: 1;
}

.record-time {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--mdui-color-on-surface);
}

.record-diff {
  font-size: 0.9rem;
  color: var(--mdui-color-on-surface-variant);
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 16px;
  background: var(--mdui-color-surface-container-low);
  border-radius: 28px;
  margin-bottom: 24px;
}

.main-btn {
  width: 120px;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 500;
}

.record-item-enter-active,
.record-item-leave-active {
  transition: all 0.4s ease;
}

.record-item-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.record-item-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.record-item-leave-from {
  opacity: 1;
  transform: scale(1);
}

.record-item-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 600px) {
  .time-display {
    font-size: 4rem;
    
    &.small-font {
      font-size: 2.8rem;
    }
  }
  
  .controls {
    gap: 16px;
  }
  
  .main-btn {
    width: 100px;
    height: 48px;
    font-size: 1rem;
  }
}
</style>