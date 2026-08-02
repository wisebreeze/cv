<template>
  <div class="palettePanel">
    <template v-if="!props.onlyAlpha">
      <div 
        class="color-palette" 
        name="color"
        ref="colorPaletteRef"
        :style="colorPaletteStyle"
        @mousedown="handleColorDragStart"
        @touchstart="handleColorDragStart"
        @drop.prevent="handleFileDrop"
        @dragover.prevent
      >
        <div class="color-pointer" name="color" ref="colorPointer" />
      </div>
      <div class="preview" :style="colorPreviewStyle" />
      <div 
        class="hue slider" 
        name="hue"
        ref="hueRef"
        @mousedown="handleHueDragStart"
        @touchstart="handleHueDragStart"
      >
        <div class="sliderBox" name="hue" ref="hueSlider" />
      </div>
      <div 
        class="alpha slider" 
        name="alpha"
        v-if="props.useAlpha"
        ref="alphaRef"
        :style="colorAlphaStyle"
        @mousedown="handleAlphaDragStart"
        @touchstart="handleAlphaDragStart"
      >
        <div class="sliderBox" name="alpha" ref="alphaSlider" />
      </div>
  
      <div class="colorInputPanel">
        <div class="colorInputStack" ref="inputStackRef">
          <div type="a">
            <input 
              class="colorInput"
              name="a"
              type="number"
              :value="inputValues.a"
              @input="handleInput('a', $event)"
            >
            <div>r</div>
          </div>
          <div type="b">
            <input 
              class="colorInput"
              name="b"
              type="number"
              :value="inputValues.b"
              @input="handleInput('b', $event)"
            >
            <div>g</div>
          </div>
          <div type="c">
            <input 
              class="colorInput"
              name="c"
              type="number"
              :value="inputValues.c"
              @input="handleInput('c', $event)"
            >
            <div>b</div>
          </div>
          <div type="alpha">
            <input 
              class="colorInput"
              name="alpha"
              type="number"
              :value="inputValues.alpha"
              @input="handleInput('alpha', $event)"
            >
            <div>a</div>
          </div>
          <div type="hex" v-show="selectedFormat.value === 'hex'">
            <input 
              class="colorInput" 
              name="hex" 
              maxlength="9" 
              type="text"
              :value="inputValues.hex"
              @change="handleInput('hex', $event)"
            >
            <div>hex</div>
          </div>
        </div>
        <mdui-dropdown>
          <mdui-button variant="tonal" slot="trigger" style="padding:5px;height:3rem;width:1.8rem">
            <ion-icon style="font-size:1.5rem" name="chevron-expand-outline" />
          </mdui-button>
          <mdui-menu dense>
            <mdui-menu-item class="hex result" @click="selectFormat('hex')">{{ formatValues.hex }}</mdui-menu-item>
            <mdui-menu-item class="rgb result" @click="selectFormat('rgb')">{{ formatValues.rgb }}</mdui-menu-item>
            <mdui-menu-item class="hsl result" @click="selectFormat('hsl')">{{ formatValues.hsl }}</mdui-menu-item>
            <mdui-menu-item class="result" @click="triggerFileUpload">{{ "上传图片并取色" }}</mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>
      </div>
    </template>
    <input 
      class="upload-input" 
      type="file" 
      accept="image/*" 
      ref="uploadInput"
      @change="handleImageUpload"
    />
    <div class="sliderFlex" type="alpha" v-if="props.onlyAlpha">
      <input 
        class="colorInput" 
        type="number" 
        name="alpha"
        max="100"
        :value="inputValues.alpha"
        @input="handleInput('alpha', $event)"
      >
      <mdui-slider 
        class="alphaSlider" 
        max="100" 
        nolabel
        :value="inputValues.alpha"
        @input="handleInput('alpha', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'

// 定义组件
const props = defineProps({
  modelValue: {
    type: [Array, Number, String],
    default: '#000000'
  },
  useAlpha: {
    type: Boolean,
    default: true
  },
  onlyAlpha: {
    type: Boolean,
    default: false
  }
})

const colorPointer = ref(null)
const hueSlider = ref(null)
const alphaSlider = ref(null)
const emit = defineEmits(['update:modelValue', 'change', 'input'])

// 响应式数据
const colorValues = reactive({
  hue: 0,
  saturation: 1,
  brightness: 1,
  alpha: props.onlyAlpha ? (typeof props.modelValue === 'number' ? props.modelValue : 1) : 1
})

const inputValues = reactive({
  a: 0,
  b: 0,
  c: 0,
  alpha: 1,
  hex: '#000000'
})

const formatValues = reactive({
  hex: '#000000',
  rgb: 'rgb(0, 0, 0)',
  hsl: 'hsl(0, 0%, 0%)'
})

const dragState = reactive({
  isDragging: false,
  dragType: null, // 'color', 'hue', 'alpha'
  lastInputTime: 0,
  inputTimeout: null
})

const colorPaletteRef = ref(null)
const alphaRef = ref(null)
const hueRef = ref(null)
const inputStackRef = ref(null)
const init = ref(false)
const selectedFormat = ref('rgb')
const uploadInput = ref(null)
const alphaValue = ref(255)

const colorUtils = {
  rgbToHsb(r, g, b) {
    r /= 255, g /= 255, b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const delta = max - min
    let h, s, v = max
    if (delta === 0) {
      h = 0
    } else {
      switch (max) {
        case r:
          h = ((g - b) / delta) % 6
          break
        case g:
          h = (b - r) / delta + 2
          break
        case b:
          h = (r - g) / delta + 4
          break
      }
      h = Math.round(h * 60)
      if (h < 0) h += 360
    }
    s = max === 0 ? 0 : delta / max
    return [h, s, v]
  },
  rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2
    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return [h * 360, s, l]
  },
  hsbToRgb(h, s, v) {
    h = h % 360
    if (h < 0) h += 360
    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c
    let r, g, b
    if (h >= 0 && h < 60) {
      [r, g, b] = [c, x, 0]
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, c, 0]
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, c, x]
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, c]
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, c]
    } else {
      [r, g, b] = [c, 0, x]
    }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ]
  },
  hslToRgb(h, s, l) {
    h = h % 360
    if (h < 0) h += 360
    h /= 360  
    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ]
  },
  hexToRgb(hex) {
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    const num = parseInt(hex, 16)
    return [num >> 16, (num >> 8) & 255, num & 255]
  },
  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
}

// 更新格式化的颜色值
function updateFormatValues() {
  const { hue, saturation, brightness, alpha } = colorValues
  const [r, g, b] = colorUtils.hsbToRgb(hue, saturation, brightness)
  const [hHsl, sHsl, lHsl] = colorUtils.rgbToHsl(r, g, b)
  let hexValue = colorUtils.rgbToHex(r, g, b)
  if (props.useAlpha) {
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
    hexValue = hexValue + alphaHex
  }
  const rgbValue = props.useAlpha 
    ? `rgba(${r}, ${g}, ${b}, ${Number.parseFloat(alpha.toFixed(2))})`
    : `rgb(${r}, ${g}, ${b})`
  const hslValue = props.useAlpha 
    ? `hsla(${Math.round(hHsl)}, ${Math.round(sHsl * 100)}%, ${Math.round(lHsl * 100)}%, ${Number.parseFloat(alpha.toFixed(2))})`
    : `hsl(${Math.round(hHsl)}, ${Math.round(sHsl * 100)}%, ${Math.round(lHsl * 100)}%)`
  formatValues.hex = hexValue
  formatValues.rgb = rgbValue
  formatValues.hsl = hslValue
}

// 计算属性
const currentColor = computed(() => {
  const { hue, saturation, brightness, alpha } = colorValues
  const [r, g, b] = colorUtils.hsbToRgb(hue, saturation, brightness)
  
  return {
    hex: colorUtils.rgbToHex(r, g, b),
    rgba: `rgba(${r}, ${g}, ${b}, ${alpha})`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(brightness * 100)}%)`,
    rgbArray: [r, g, b, alpha]
  }
})

// 监听颜色值变化
watch(colorValues, () => {
  updateInputsForFormat()
  emitColorChange()
}, { deep: true })

// 监听透明度滑块变化
watch(alphaValue, (value) => {
  colorValues.alpha = value / 100
})

// 初始化时解析颜色
onMounted(() => {
  parseInitialColor()
  updateInputVisibility()
  nextTick(() => {
    init.value = true
  })
})

// 事件处理函数
function handleColorDragStart(e) {
  const palette = e.currentTarget
  const rect = palette.getBoundingClientRect()
  
  startDrag(e, 'color', (x, y) => {
    colorValues.saturation = x / rect.width
    colorValues.brightness = 1 - (y / rect.height)
    
    // 使用像素单位更新位置
    if (colorPointer.value) {
      colorPointer.value.style.transform = `translate(${x}px, ${y}px)`
    }
  })
}

function handleHueDragStart(e) {
  const slider = e.currentTarget
  const rect = slider.getBoundingClientRect()
  
  startDrag(e, 'hue', (x) => {
    colorValues.hue = (x / rect.width) * 360
    
    // 使用像素单位更新位置
    if (hueSlider.value) {
      hueSlider.value.style.transform = `translateX(${x}px)`
    }
  })
}

function handleAlphaDragStart(e) {
  const slider = e.currentTarget
  const rect = slider.getBoundingClientRect()
  
  startDrag(e, 'alpha', (x) => {
    colorValues.alpha = x / rect.width
    
    if (alphaSlider.value) {
      alphaSlider.value.style.transform = `translateX(${x}px)`
    }
  })
}

function handleInput(type, event) {
  const value = event.target.value
  dragState.lastInputTime = Date.now()
  if (dragState.inputTimeout) {
    clearTimeout(dragState.inputTimeout)
    dragState.inputTimeout = null
  }
  dragState.inputTimeout = setTimeout(() => {
    if (Date.now() - dragState.lastInputTime > 300) {
      emitChange()
    }
  }, 300)
  if (selectedFormat.value === 'hex') {
    if (type === 'hex') {
      handleHexInput(value)
    } else if (type === 'alpha') {
      handleAlphaInput(value)
    }
  }
  else if (selectedFormat.value === 'rgb') {
    if (type === 'a' || type === 'b' || type === 'c') {
      handleRgbInput(type, value)
    } else if (type === 'alpha') {
      handleAlphaInput(value)
    }
  }
  else if (selectedFormat.value === 'hsl') {
    if (type === 'a' || type === 'b' || type === 'c') {
      handleHslInput(type, value)
    } else if (type === 'alpha') {
      handleAlphaInput(value)
    }
  }
  emitInput()
}

// 处理 HSL 输入
function handleHslInput(channel, value) {
  const numValue = parseInt(value) || 0
  let h = inputValues.a
  let s = inputValues.b / 100
  let l = inputValues.c / 100
  switch (channel) {
    case 'a':
      h = Math.max(0, Math.min(360, numValue))
      break
    case 'b':
      s = Math.max(0, Math.min(100, numValue)) / 100
      break
    case 'c':
      l = Math.max(0, Math.min(100, numValue)) / 100
      break
  }
  const [r, g, b] = colorUtils.hslToRgb(h, s, l)
  const [hHsb, sHsb, vHsb] = colorUtils.rgbToHsb(r, g, b)
  colorValues.hue = hHsb
  colorValues.saturation = sHsb
  colorValues.brightness = vHsb
  inputValues.a = h
  inputValues.b = Math.round(s * 100)
  inputValues.c = Math.round(l * 100)
  nextTick(updateSliderPositions)
}

// 处理RGB输入
function handleRgbInput(channel, value) {
  const numValue = parseInt(value) || 0
  const clampedValue = Math.min(255, Math.max(0, numValue))
  if (channel === 'a') inputValues.a = clampedValue
  if (channel === 'b') inputValues.b = clampedValue
  if (channel === 'c') inputValues.c = clampedValue
  const [h, s, v] = colorUtils.rgbToHsb(
    inputValues.a,
    inputValues.b,
    inputValues.c
  )
  colorValues.hue = h
  colorValues.saturation = s
  colorValues.brightness = v
  inputValues.hex = colorUtils.rgbToHex(
    inputValues.a,
    inputValues.b,
    inputValues.c
  )
  nextTick(updateSliderPositions)
}

function handleAlphaInput(value) {
  const numValue = parseInt(value) || 0
  alphaValue.value = Math.min(100, Math.max(0, numValue))
  colorValues.alpha = alphaValue.value / 255
  nextTick(updateSliderPositions)
}

// 更新颜色选择点位置
function updateSliderPositions() {
  if (!colorPointer.value || !hueSlider.value) return
  const paletteRect = colorPaletteRef.value.getBoundingClientRect()
  const hueRect = hueRef.value.getBoundingClientRect()
  const pointerX = colorValues.saturation * paletteRect.width
  const pointerY = (1 - colorValues.brightness) * paletteRect.height
  const hueX = (colorValues.hue / 360) * hueRect.width
  colorPointer.value.style.transform = `translate(${pointerX}px, ${pointerY}px)`
  hueSlider.value.style.transform = `translateX(${hueX}px)`
  if (alphaSlider.value) {
    const alphaRect = alphaRef.getBoundingClientRect()
    const alphaX = colorValues.alpha * alphaRect.width
    alphaSlider.value.style.transform = `translateX(${alphaX}px)`
  }
}

// 处理HEX输入
function handleHexInput(value) {
  const cleanValue = value.replace(/[^0-9a-f]/gi, '')
  if (/^([0-9a-f]{3,8})$/i.test(cleanValue)) {
    let hex = cleanValue
    let alpha = null
    let alphaHex = ''
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map(char => char + char).join('')
    }
    if (props.useAlpha && hex.length === 8) {
      alpha = parseInt(hex.substring(6, 8), 16) / 255
      alphaHex = hex.substring(6, 8)
      hex = hex.substring(0, 6)
    } else if (hex.length > 6) {
      hex = hex.substring(0, 6)
    }
    hex = `#${hex}`
    try {
      const [r, g, b] = colorUtils.hexToRgb(hex)
      const [h, s, v] = colorUtils.rgbToHsb(r, g, b)
      colorValues.hue = h
      colorValues.saturation = s
      colorValues.brightness = v
      if (props.useAlpha && alpha !== null) {
        colorValues.alpha = alpha
        alphaValue.value = Math.round(alpha * 100)
      }
      inputValues.a = r
      inputValues.b = g
      inputValues.c = b
      inputValues.hex = props.useAlpha ? hex + alphaHex : hex
      nextTick(updateSliderPositions)
    } catch (e) {
      console.error('Invalid HEX color:', value, e)
    }
  } else {
    inputValues.hex = currentColor.value.hex
  }
}

function selectFormat(format) {
  selectedFormat.value = format
  updateInputVisibility()
}

function triggerFileUpload() {
  uploadInput.value.click()
}

function handleFileDrop(e) {
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processImageFile(files[0])
  }
}

function handleImageUpload(e) {
  if (e.target.files.length > 0) {
    processImageFile(e.target.files[0])
  }
}

// 拖拽处理
function startDrag(e, type, callback) {
  if (e.cancelable) e.preventDefault()
  dragState.isDragging = true
  dragState.dragType = type
  const isTouch = e.type.includes('touch')
  const target = e.currentTarget
  const rect = target.getBoundingClientRect()
  const getPosition = (event) => {
    return isTouch 
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: event.clientX, y: event.clientY }
  }
  const handleMove = (moveEvent) => {
    const pos = getPosition(moveEvent)
    const x = Math.max(0, Math.min(rect.width, pos.x - rect.left))
    const y = type === 'color' 
      ? Math.max(0, Math.min(rect.height, pos.y - rect.top))
      : 0
    callback(x, y)
    emitInput()
  }
  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchend', handleEnd)
    dragState.isDragging = false
    emitChange()
  }
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('touchmove', handleMove, { passive: false })
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchend', handleEnd)
}

// 解析初始颜色
function parseInitialColor() {
  if (typeof props.modelValue === 'string') {
    // HEX格式
    if (/^#?([0-9A-F]{3,8})$/i.test(props.modelValue)) {
      const hex = props.modelValue.startsWith('#') 
        ? props.modelValue 
        : `#${props.modelValue}`

      const [r, g, b] = colorUtils.hexToRgb(hex)
      const [h, s, v] = colorUtils.rgbToHsb(r, g, b)

      colorValues.hue = h
      colorValues.saturation = s
      colorValues.brightness = v
      inputValues.hex = hex
    }
  } else if (Array.isArray(props.modelValue)) {
    const [r, g, b, a] = props.modelValue
    const [h, s, v] = colorUtils.rgbToHsb(r, g, b)

    colorValues.hue = h
    colorValues.saturation = s
    colorValues.brightness = v
    colorValues.alpha = a ?? 1
    alphaValue.value = Math.round((a ?? 1) * 100)

    inputValues.a = r
    inputValues.b = g
    inputValues.c = b
    inputValues.alpha = alphaValue.value
    inputValues.hex = colorUtils.rgbToHex(r, g, b)
  } else if (props.onlyAlpha && typeof props.modelValue === "number") {
    const alpha = props.modelValue * 100
    alphaValue.value = alpha
    inputValues.alpha = alpha
  } else console.warm("Warm: Unknown modelvalue type")

  // 更新
  updateFormatValues()
  nextTick(() => {
    updateSliderPositions()
  })
}

// 更新输入框的值
function updateInputs() {
  const { hue, saturation, brightness, alpha } = colorValues
  const [r, g, b] = colorUtils.hsbToRgb(hue, saturation, brightness)
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')

  inputValues.a = r
  inputValues.b = g
  inputValues.c = b
  inputValues.alpha = Math.round(alpha * 100)
  inputValues.hex = currentColor.value.hex + alphaHex
  
  updateFormatValues()
}

// 更新预览
const colorPreviewStyle = computed(() => {
  return {
    background: `linear-gradient(${formatValues.hex}, ${formatValues.hex}) 0 0 / cover,
      linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 12px 12px,
      linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 6px 6px / 12px 12px`
  }
})

const colorAlphaStyle = computed(() => {
  const hex = formatValues.hex.substring(0, 7)
  return {
    background: `linear-gradient(to right, rgba(0, 0, 0, 0), ${hex}) 0 0 / cover,
      linear-gradient(45deg, rgba(0, 0, 0, 0.25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.25) 0) 0 0 / 10px 10px,
      linear-gradient(45deg, rgba(0, 0, 0, 0.25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.25) 0) 5px 5px / 10px 10px`
  }
})

const colorPaletteStyle = computed(() => {
  return {
    background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
      linear-gradient(to right, rgba(0, 0, 0, 0), hsl(${colorValues.hue}, 100%, 50%))`
  }
})

// 发出颜色变化事件
function emitInput() {
  if (!init.value) return
  const rgba = getRgbaArray()
  emit('input', props.onlyAlpha ? rgba[3] : rgba)
}

function emitChange() {
  if (!init.value) return
  const rgba = getRgbaArray()
  emit('change', props.onlyAlpha ? rgba[3] : rgba)
}

function getRgbaArray() {
  return [
    inputValues.a,
    inputValues.b,
    inputValues.c,
    colorValues.alpha
  ]
}

function emitColorChange() {
  if (!init.value) return
  const { hue, saturation, brightness, alpha } = colorValues
  const [r, g, b] = colorUtils.hsbToRgb(hue, saturation, brightness) 
  const rgba = [r, g, b, alpha]
  emit('update:modelValue', props.onlyAlpha ? alpha : props.useAlpha ? rgba : rgba.slice(0, 3))
  if (dragState.isDragging) {
    emitInput()
  } else {
    emitChange()
  }
}

function updateInputVisibility() {
  if (!inputStackRef.value) return
  const inputs = inputStackRef.value.querySelectorAll('div[type]')
  
  inputs.forEach(input => {
    const type = input.getAttribute('type')
    
    switch (selectedFormat.value) {
      case 'hex':
        input.style.display = type === 'hex' ? 'block' : 'none'
        break
        
      case 'rgb':
        if (type === 'a' || type === 'b' || type === 'c' || (type === 'alpha' && props.useAlpha)) {
          input.style.display = 'block'
          // 更新标签文字
          const label = input.querySelector('div')
          if (label) {
            if (type === 'a') label.textContent = 'r'
            if (type === 'b') label.textContent = 'g'
            if (type === 'c') label.textContent = 'b'
          }
        } else {
          input.style.display = 'none'
        }
        break
        
      case 'hsl':
        if (type === 'a' || type === 'b' || type === 'c' || (type === 'alpha' && props.useAlpha)) {
          input.style.display = 'block'
          // 更新标签文字
          const label = input.querySelector('div')
          if (label) {
            if (type === 'a') label.textContent = 'h'
            if (type === 'b') label.textContent = 's'
            if (type === 'c') label.textContent = 'l'
          }
        } else {
          input.style.display = 'none'
        }
        break
    }
  })
  
  updateInputsForFormat()
}

function updateInputsForFormat() {
  const { hue, saturation, brightness, alpha } = colorValues
  switch (selectedFormat.value) {
    case 'hex':
      inputValues.hex = currentColor.value.hex
      if (props.useAlpha) {
        const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
        inputValues.hex = inputValues.hex + alphaHex
      }
      break 
    case 'rgb':
      const [r, g, b] = colorUtils.hsbToRgb(hue, saturation, brightness)
      inputValues.a = r
      inputValues.b = g
      inputValues.c = b
      inputValues.alpha = Math.round(alpha * 100)
      break
    case 'hsl':
      const [r2, g2, b2] = colorUtils.hsbToRgb(hue, saturation, brightness)
      const [h, s, l] = colorUtils.rgbToHsl(r2, g2, b2)
      inputValues.a = Math.round(h)
      inputValues.b = Math.round(s * 100)
      inputValues.c = Math.round(l * 100)
      inputValues.alpha = Math.round(alpha * 100)
      break
  }
  updateFormatValues()
}

// 处理图像上传
function extractColorsFromImage(image) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const maxSize = 100
    let width = image.width
    let height = image.height
    if (width > height) {
      if (width > maxSize) {
        height = Math.round(height * maxSize / width)
        width = maxSize
      }
    } else {
      if (height > maxSize) {
        width = Math.round(width * maxSize / height)
        height = maxSize
      }
    }
    canvas.width = width
    canvas.height = height
    ctx.drawImage(image, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    const colors = []
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      colors.push([r, g, b])
    }
    const colorCount = {}
    colors.forEach(color => {
      const key = color.join(',')
      colorCount[key] = (colorCount[key] || 0) + 1
    })
    let primaryColor = [0, 0, 0]
    let maxCount = 0
    for (const [key, count] of Object.entries(colorCount)) {
      if (count > maxCount) {
        maxCount = count
        primaryColor = key.split(',').map(Number)
      }
    }
    const secondaryColor = calculateSecondaryColor(primaryColor)
    const surfaceColor = calculateSurfaceColor(primaryColor)
    const containerColor = calculateContainerColor(surfaceColor)
    const onPrimary = calculateOnColor(primaryColor)
    const onSecondary = calculateOnColor(secondaryColor)
    const onSurface = calculateOnColor(surfaceColor)
    const onContainer = calculateOnColor(containerColor)
    resolve({
      primary: primaryColor,
      onPrimary,
      secondary: secondaryColor,
      onSecondary,
      surface: surfaceColor,
      onSurface,
      container: containerColor,
      onContainer
    })
  })
}

// 次要颜色
function calculateSecondaryColor(primary) {
  const [r, g, b] = primary
  const [h, s, l] = colorUtils.rgbToHsl(r, g, b)
  const newH = (h + 180) % 360
  const newS = Math.min(1, s * 1.2)
  return colorUtils.hslToRgb(newH, newS, l)
}

// 表面颜色
function calculateSurfaceColor(primary) {
  const [r, g, b] = primary
  const [h, s, l] = colorUtils.rgbToHsl(r, g, b)
  const newS = Math.max(0.05, s * 0.3)
  const newL = Math.min(0.95, l * 1.3)
  return colorUtils.hslToRgb(h, newS, newL)
}

// 容器颜色
function calculateContainerColor(surface) {
  const [r, g, b] = surface
  const [h, s, l] = colorUtils.rgbToHsl(r, g, b)
  const newL = Math.max(0.1, l * 0.9)
  return colorUtils.hslToRgb(h, s, newL)
}

// on 颜色
function calculateOnColor(color) {
  const [r, g, b] = color
  const [h, s, l] = colorUtils.rgbToHsl(r, g, b)
  const newL = Math.max(0.05, l * 0.2)
  return colorUtils.hslToRgb(h, s, newL)
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const img = new Image()
    img.src = e.target.result
    img.onload = async () => {
      try {
        const colors = await extractColorsFromImage(img)
        const [r, g, b] = colors.primary
        const [h, s, v] = colorUtils.rgbToHsb(r, g, b)
        colorValues.hue = h
        colorValues.saturation = s
        colorValues.brightness = v
        inputValues.a = r
        inputValues.b = g
        inputValues.c = b
        inputValues.hex = colorUtils.rgbToHex(r, g, b)
        nextTick(updateSliderPositions)
        emitInput()
        emitChange()
      } catch (error) {
        console.error('Color extraction failure:', error)
      }
    }
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped lang="scss">
$color-primary-dark: var(--mdui-color-primary-dark);
$color-surface-container-highest: var(--mdui-color-surface-container-highest);
$color-on-surface-variant: var(--mdui-color-on-surface-variant);

@mixin input {
  height: 2rem;
  padding: 5px;
  width: calc(100% - 0.8rem);
  border: none;
  outline: none;
  text-align: center;
  transition: all 0.15s ease-in 0s;
  background: rgb($color-surface-container-highest);
  border-radius: var(--mdui-shape-corner-extra-small) var(--mdui-shape-corner-extra-small) 0 0;
  box-shadow: inset 0 -.0625rem 0 0 rgb($color-on-surface-variant);
}

.colorPreview {
  width: 32px;
  height: 32px;
  background: red;
  border-radius: 50%;
}

.palettePanel {
  position: relative;
  background: rgba($color-primary-dark, 0.2);
  margin: 0 auto;
  width: 100%;
  height: auto;
  border-radius: 3px 3px 5% 5%;
  user-select: none;
  overflow-y: hidden;

  &[type="alpha"] {
    border-radius: 8px;
    padding: 10px;
    box-sizing: border-box;
    display: none;
  }

  > .colorInputPanel {
    display: flex;
    justify-content: center;
    margin: 1.4rem 0;
    height: 2.8rem;
    padding-bottom: 1rem;

    > .colorInputStack {
      width: calc(100% - 45px - 2.5rem);
      margin: 0.4rem 0.8rem 0 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      .colorInput,
      .sliderFlex .colorInput {
        @include input
      }

      &:focus {
        box-shadow: inset 0 -.125rem 0 0 rgb($color-primary-dark);
      }
    }
  }

  > .color-palette {
    width: 100%;
    height: 120px;
    margin-bottom: 15px;
    border-radius: 5px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
      linear-gradient(to left, rgba(0, 0, 0, 0), rgba(255, 255, 255, 1));
    background-color: red;
    overflow: hidden;

    > .color-pointer {
      position: relative;
      left: -6px;
      top: -6px;
      width: 12px;
      height: 12px;
      transform: translate(-6px, -6px);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.65);
    }
  }

  > .preview {
    background: white;
    float: left;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-left: 12px;
    border: 1px solid #eee;
  }

  > .slider {
    background: darkblue;
    width: calc(100% - 75px);
    height: 10px;
    margin-left: 60px;
    position: relative;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  > .slider.hue {
    background: linear-gradient(
      to right,
      hsl(0, 100%, 50%) 0%,
      hsl(30, 100%, 50%) 8.33%,
      hsl(60, 100%, 50%) 16.67%,
      hsl(90, 100%, 50%) 25%,
      hsl(120, 100%, 50%) 33.33%,
      hsl(150, 100%, 50%) 41.67%,
      hsl(180, 100%, 50%) 50%,
      hsl(210, 100%, 50%) 58.33%,
      hsl(240, 100%, 50%) 66.67%,
      hsl(270, 100%, 50%) 75%,
      hsl(300, 100%, 50%) 83.33%,
      hsl(330, 100%, 50%) 91.67%,
      hsl(0, 100%, 50%) 100%
    );
  }

  > .slider.alpha {
    background:
      linear-gradient(to right, rgba(0, 0, 0, 0), rgba(255, 255, 255, 1)) 0 0 / cover,
      linear-gradient(45deg, rgba(0, 0, 0, 0.25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.25) 0) 0 0 / 10px 10px,
      linear-gradient(45deg, rgba(0, 0, 0, 0.25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.25) 0) 5px 5px / 10px 10px;
  }

  > .slider > .sliderBox {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transform: translateX(0);
    background: rgba(250, 250, 250, 0.65);
    position: relative;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2));
    left: -8px;
    top: -2px;
  }

  > .colorInputPanel .result {
    color: rgba($color-on-surface-variant, 0.65);
    margin: 0;
    line-height: 2;
    text-align: center;
    user-select: auto;
  }

  > .upload-input {
    display: none;
  }

  > .sliderFlex {
    display: flex;
    padding: 0.8rem;
    > input {
      @include input;
    }
  }
}
</style>