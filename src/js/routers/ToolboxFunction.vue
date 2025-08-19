<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div id="graph-container" ref="graphContainer" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @wheel="handleWheel">
      <canvas ref="canvas" id="graph-canvas"></canvas>
    </div>

    <div id="control-panel">
      <mdui-text-field 
        id="function-input"
        :label="t('toolbox.function.inputLabel')" 
        fullwidth 
        variant="filled" 
        :value="functionExpression" 
        @input="updateFunction"
      />
      <mdui-button-icon id="more-button" @click.stop="openMenu">
        <ion-icon name="ellipsis-vertical"></ion-icon>
      </mdui-button-icon>

      <div 
        id="menu-backdrop" 
        v-if="menuVisible" 
        @click="closeMenu"
      ></div>

      <div 
        id="main-menu" 
        ref="mainMenu"
        :style="menuStyle"
        v-show="menuVisible"
        @click.stop
      >
        <div class="menu-content" v-if="!subMenuOpen">
          <div class="menu-item" @click="copyExpression">{{ t('toolbox.function.copy') }}</div>
          <div class="menu-item" @click="screenshot">{{ t('toolbox.function.screenshot') }}</div>
          <div class="menu-item" @click="openSubMenu">{{ t('toolbox.function.examples') }}<ion-icon name="chevron-forward"></ion-icon></div>
        </div>

        <div class="menu-content" v-else>
          <div class="menu-item back-item" @click="closeSubMenu">
            <ion-icon name="chevron-back"></ion-icon>
            {{ t('toolbox.function.back') }}
          </div>
          <div class="menu-item" @click="loadExample('linear')">{{ t('toolbox.function.linear') }}</div>
          <div class="menu-item" @click="loadExample('quadratic')">{{ t('toolbox.function.quadratic') }}</div>
          <div class="menu-item" @click="loadExample('cubic')">{{ t('toolbox.function.cubic') }}</div>
          <div class="menu-item" @click="loadExample('inverse')">{{ t('toolbox.function.inverse') }}</div>
          <div class="menu-item" @click="loadExample('exponential')">{{ t('toolbox.function.exponential') }}</div>
          <div class="menu-item" @click="loadExample('logarithmic')">{{ t('toolbox.function.logarithmic') }}</div>
          <div class="menu-item" @click="loadExample('rose')">{{ t('toolbox.function.rose') }}</div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()
const canvas = ref(null)
const graphContainer = ref(null)
const functionExpression = ref('')
const menuVisible = ref(false)
const subMenuOpen = ref(false)
const scale = ref(50)
const offsetX = ref(0)
const offsetY = ref(0)
const menuPosition = ref({ x: 0, y: 0 })
const mainMenu = ref(null)
let isDragging = false
let lastX = 0
let lastY = 0
let touchDistance = 0
let ctx = null
let animationFrame = null

const examples = {
  linear: 'x',
  quadratic: 'x^2',
  cubic: 'x^3',
  inverse: '1/x',
  exponential: '2^x',
  logarithmic: 'log(x)',
  rose: '5*sin(3*theta)'
}

const menuStyle = computed(() => {
  const style = {
    left: `${menuPosition.value.x}px`,
    top: `${menuPosition.value.y}px`,
    transform: menuVisible.value ? 'scale(1)' : 'scale(0.8)',
    opacity: menuVisible.value ? 1 : 0
  }

  if (mainMenu.value) {
    const rect = mainMenu.value.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      style.left = `${window.innerWidth - rect.width - 8}px`
    }
    if (rect.bottom > window.innerHeight) {
      style.top = `${window.innerHeight - rect.height - 8}px`
    }
  }

  return style
})

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
  window.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('click', handleOutsideClick)
  cancelAnimationFrame(animationFrame)
})

function initCanvas() {
  const canvasEl = canvas.value
  ctx = canvasEl.getContext('2d')
  handleResize()
  drawGrid()
}

function handleResize() {
  const container = graphContainer.value
  const canvasEl = canvas.value
  canvasEl.width = container.clientWidth
  canvasEl.height = container.clientHeight - 100
  drawGrid()
}

function openMenu(e) {
  const buttonRect = e.currentTarget.getBoundingClientRect()
  menuPosition.value = {
    x: buttonRect.right - 200,
    y: buttonRect.top - 8
  }
  menuVisible.value = true
  subMenuOpen.value = false
  e.stopPropagation()
}

function closeMenu() {
  menuVisible.value = false
}

function handleOutsideClick(e) {
  if (menuVisible.value && !e.target.closest('#main-menu')) {
    closeMenu()
  }
}

function openSubMenu() {
  subMenuOpen.value = true
}

function closeSubMenu() {
  subMenuOpen.value = false
}

function copyExpression() {
  const textarea = document.createElement('textarea')
  textarea.value = functionExpression.value
  textarea.style.position = 'fixed'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  closeMenu()
}

function loadExample(type) {
  functionExpression.value = examples[type]
  drawGrid()
  closeMenu()
}

function drawGrid() {
  const canvasEl = canvas.value
  const width = canvasEl.width
  const height = canvasEl.height
  const centerX = width / 2 - offsetX.value
  const centerY = height / 2 - offsetY.value
  const gridSize = scale.value
  
  ctx.clearRect(0, 0, width, height)
  
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  ctx.beginPath()
  
  for (let x = centerX % gridSize; x < width; x += gridSize) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  
  for (let y = centerY % gridSize; y < height; y += gridSize) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  
  ctx.stroke()
  
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  
  ctx.beginPath()
  ctx.moveTo(0, centerY)
  ctx.lineTo(width, centerY)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(centerX, 0)
  ctx.lineTo(centerX, height)
  ctx.stroke()
  
  if (functionExpression.value) {
    drawFunction()
  }
}

function drawFunction() {
  const canvasEl = canvas.value
  const width = canvasEl.width
  const height = canvasEl.height
  const centerX = width / 2 - offsetX.value
  const centerY = height / 2 - offsetY.value
  const scaleFactor = scale.value
  
  ctx.strokeStyle = '#ff5252'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  for (let x = 0; x < width; x++) {
    const graphX = (x - centerX) / scaleFactor
    let graphY
    try {
      graphY = evalFunction(graphX)
    } catch {
      continue
    }
    const y = centerY - graphY * scaleFactor
    
    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.stroke()
}

function evalFunction(x) {
  const expr = functionExpression.value
    .replace(/\^/g, '**')
    .replace(/log/g, 'Math.log10')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
  
  try {
    return eval(expr)
  } catch {
    return 0
  }
}

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    touchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  } else {
    isDragging = true
    lastX = e.touches ? e.touches[0].clientX : e.clientX
    lastY = e.touches ? e.touches[0].clientY : e.clientY
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2) {
    const newDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const delta = newDistance - touchDistance
    scale.value = Math.max(10, Math.min(200, scale.value + delta * 0.1))
    touchDistance = newDistance
    drawGrid()
  } else if (isDragging) {
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const y = e.touches ? e.touches[0].clientY : e.clientY
    offsetX.value -= x - lastX
    offsetY.value -= y - lastY
    lastX = x
    lastY = y
    drawGrid()
  }
  e.preventDefault()
}

function handleWheel(e) {
  scale.value = Math.max(10, Math.min(200, scale.value - e.deltaY * 0.1))
  drawGrid()
}

function updateFunction(e) {
  functionExpression.value = e.target.value
  drawGrid()
}

function screenshot() {
  const canvasEl = canvas.value
  const link = document.createElement('a')
  link.download = 'function-graph.png'
  link.href = canvasEl.toDataURL('image/png')
  link.click()
  closeMenu()
}
</script>

<style lang="scss">
#content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#graph-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  touch-action: none;
}

#graph-canvas {
  display: block;
  background-color: rgb(var(--mdui-color-surface));
}

#control-panel {
  display: flex;
  padding: 16px;
  align-items: center;
  gap: 8px;
  background-color: rgb(var(--mdui-color-surface-container));
}

#function-input {
  flex: 1;
}

#menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 999;
}

#main-menu {
  position: fixed;
  min-width: 200px;
  max-width: 300px;
  max-height: 60vh;
  background-color: rgb(var(--mdui-color-surface-container));
  border-radius: 12px;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
  transform-origin: top right;
}

.menu-content {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: rgb(var(--mdui-color-on-surface));
  position: fixed;
  user-select: none;
  z-index: 1000;
  
  &:hover {
    background-color: rgb(var(--mdui-color-surface-container-hover));
  }
  
  &:active {
    background-color: rgb(var(--mdui-color-surface-container-pressed));
  }
}

.back-item {
  color: rgb(var(--mdui-color-primary));
}

ion-icon {
  font-size: 20px;
  color: rgb(var(--mdui-color-on-surface-variant));
}
</style>