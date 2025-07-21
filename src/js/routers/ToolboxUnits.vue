<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div class="unit-conversion">
      <div class="category-row">
        <mdui-select :label="t('toolbox.unitConversion.category')" class="category-select" :value="selectedCategory" @change="selectedCategory = $event.target.value">
          <mdui-menu-item v-for="category in categories" :key="category" :value="category">{{ t(`toolbox.unitConversion.categories.${category}`) }}</mdui-menu-item>
        </mdui-select>
        <div v-if="inputValue" class="action-buttons">
          <mdui-button-icon @click="copyResult">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 1.2rem;height: 1.2rem;"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg>
          </mdui-button-icon>
          <mdui-button-icon @click="clearInput">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 1.2rem;height: 1.2rem;"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
          </mdui-button-icon>
        </div>
      </div>
      
      <div class="input-row">
        <mdui-text-field class="input-field" :label="t('toolbox.unitConversion.inputValue')" :value="inputValue" @input="inputValue = $event.target.value" type="number"></mdui-text-field>
      </div>
      
      <div class="unit-selection">
        <mdui-select :label="t('toolbox.unitConversion.inputUnit')" :value="inputUnit" @change="inputUnit = $event.target.value">
          <mdui-menu-item v-for="unit in currentUnits" :key="unit.name" :value="unit.name">{{ t(`toolbox.unitConversion.units.${unit.name}`) }}</mdui-menu-item>
        </mdui-select>
        <mdui-button-icon class="swap-btn" @click="swapUnits">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 1.6rem;height: 1.6rem;"><path d="M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z" /></svg>
        </mdui-button-icon>
        <mdui-select :label="t('toolbox.unitConversion.outputUnit')" :value="outputUnit" @change="outputUnit = $event.target.value">
          <mdui-menu-item v-for="unit in currentUnits" :key="unit.name" :value="unit.name">{{ t(`toolbox.unitConversion.units.${unit.name}`) }}</mdui-menu-item>
        </mdui-select>
      </div>
      
      <div class="result-display">
        <div class="output-value">{{ displayOutputValue }}</div>
        <div class="output-unit">{{ outputUnitLabel }}</div>
        <div class="conversion-relation">{{ conversionRelation }}</div>
        <div class="standard-unit" v-if="isOutputStandard">{{ t('toolbox.unitConversion.standardUnit') }}</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()
const inputValue = ref('')
const selectedCategory = ref('time')
const inputUnit = ref('s')
const outputUnit = ref('min')

const categories = ref(['time', 'length', 'mass', 'temperature', 'area', 'volume', 'speed', 'data', 'pressure', 'energy', 'power'])

const units = {
  time: [
    { name: 'ns', factor: 1e-9 },
    { name: 'μs', factor: 1e-6 },
    { name: 'ms', factor: 1e-3 },
    { name: 's', factor: 1 },
    { name: 'min', factor: 60 },
    { name: 'h', factor: 3600 },
    { name: 'd', factor: 86400 }
  ],
  length: [
    { name: 'nm', factor: 1e-9 },
    { name: 'μm', factor: 1e-6 },
    { name: 'mm', factor: 1e-3 },
    { name: 'cm', factor: 0.01 },
    { name: 'm', factor: 1 },
    { name: 'km', factor: 1000 },
    { name: 'in', factor: 0.0254 },
    { name: 'ft', factor: 0.3048 },
    { name: 'yd', factor: 0.9144 },
    { name: 'mi', factor: 1609.34 }
  ],
  mass: [
    { name: 'μg', factor: 1e-9 },
    { name: 'mg', factor: 1e-6 },
    { name: 'g', factor: 0.001 },
    { name: 'kg', factor: 1 },
    { name: 't', factor: 1000 },
    { name: 'oz', factor: 0.0283495 },
    { name: 'lb', factor: 0.453592 }
  ],
  temperature: [
    { name: '°C', factor: 1, offset: 0 },
    { name: '°F', factor: 5/9, offset: -32 },
    { name: 'K', factor: 1, offset: 273.15 },
    { name: '°R', factor: 5/9, offset: 0 }
  ],
  area: [
    { name: 'mm²', factor: 1e-6 },
    { name: 'cm²', factor: 0.0001 },
    { name: 'm²', factor: 1 },
    { name: 'ha', factor: 10000 },
    { name: 'km²', factor: 1e6 },
    { name: 'in²', factor: 0.00064516 },
    { name: 'ft²', factor: 0.092903 },
    { name: 'ac', factor: 4046.86 }
  ],
  volume: [
    { name: 'mm³', factor: 1e-9 },
    { name: 'ml', factor: 0.001 },
    { name: 'l', factor: 0.001 },
    { name: 'm³', factor: 1 },
    { name: 'in³', factor: 0.0000163871 },
    { name: 'ft³', factor: 0.0283168 },
    { name: 'gal', factor: 0.00378541 }
  ],
  speed: [
    { name: 'm/s', factor: 1 },
    { name: 'km/h', factor: 0.277778 },
    { name: 'mph', factor: 0.44704 },
    { name: 'knot', factor: 0.514444 },
    { name: 'ft/s', factor: 0.3048 }
  ],
  data: [
    { name: 'b', factor: 0.125 },
    { name: 'B', factor: 1 },
    { name: 'KB', factor: 1024 },
    { name: 'MB', factor: 1048576 },
    { name: 'GB', factor: 1073741824 },
    { name: 'TB', factor: 1099511627776 },
    { name: 'PB', factor: 1125899906842624 },
    { name: 'EB', factor: 1152921504606846976 }
  ],
  pressure: [
    { name: 'Pa', factor: 1 },
    { name: 'hPa', factor: 100 },
    { name: 'kPa', factor: 1000 },
    { name: 'MPa', factor: 1e6 },
    { name: 'bar', factor: 100000 },
    { name: 'psi', factor: 6894.76 },
    { name: 'mmHg', factor: 133.322 }
  ],
  energy: [
    { name: 'J', factor: 1 },
    { name: 'kJ', factor: 1000 },
    { name: 'MJ', factor: 1e6 },
    { name: 'cal', factor: 4.184 },
    { name: 'kcal', factor: 4184 },
    { name: 'kWh', factor: 3.6e6 },
    { name: 'eV', factor: 1.602e-19 }
  ],
  power: [
    { name: 'W', factor: 1 },
    { name: 'kW', factor: 1000 },
    { name: 'MW', factor: 1e6 },
    { name: 'hp', factor: 745.7 }
  ]
}

const currentUnits = computed(() => units[selectedCategory.value] || [])

watch(selectedCategory, (newVal) => {
  if (units[newVal] && units[newVal].length > 1) {
    inputUnit.value = units[newVal][0].name
    outputUnit.value = units[newVal][3]?.name || units[newVal][1].name
  }
})

const inputUnitObj = computed(() => 
  currentUnits.value.find(u => u.name === inputUnit.value) || { factor: 1, offset: 0 }
)

const outputUnitObj = computed(() => 
  currentUnits.value.find(u => u.name === outputUnit.value) || { factor: 1, offset: 0 }
)

const outputValue = computed(() => {
  if (!inputValue.value) return ''
  
  const inputVal = parseFloat(inputValue.value)
  if (isNaN(inputVal)) return ''
  
  if (selectedCategory.value === 'temperature') {
    const baseValue = (inputVal - inputUnitObj.value.offset) / inputUnitObj.value.factor
    return (baseValue * outputUnitObj.value.factor) + outputUnitObj.value.offset
  }
  
  const baseValue = inputVal * inputUnitObj.value.factor
  return baseValue / outputUnitObj.value.factor
})

const displayOutputValue = computed(() => {
  if (outputValue.value === '') return ''
  const num = parseFloat(outputValue.value)
  if (isNaN(num)) return ''
  
  if (Math.abs(num) < 0.0001 || Math.abs(num) > 1000000) {
    return num.toExponential(4)
  }
  
  const fixedNum = num.toFixed(6).replace(/\.?0+$/, '')
  return fixedNum.replace(/(\.[0-9]*[1-9])0+$/, '$1')
})

const outputUnitLabel = computed(() => {
  return t(`toolbox.unitConversion.units.${outputUnit.value}`)
})

const conversionRelation = computed(() => {
  if (!inputValue.value || parseFloat(inputValue.value) === 0) return ''
  
  const inputVal = parseFloat(inputValue.value)
  if (isNaN(inputVal)) return ''
  
  const oneInputToOutput = 1 * (inputUnitObj.value.factor / outputUnitObj.value.factor)
  return `1 ${t(`toolbox.unitConversion.units.${inputUnit.value}`)} = ${Number.parseFloat(oneInputToOutput.toFixed(6))} ${t(`toolbox.unitConversion.units.${outputUnit.value}`)}`
})

const isOutputStandard = computed(() => {
  const standardUnits = {
    time: 's',
    length: 'm',
    mass: 'kg',
    temperature: 'K',
    area: 'm²',
    volume: 'm³',
    speed: 'm/s',
    data: 'B',
    pressure: 'Pa',
    energy: 'J',
    power: 'W'
  }
  return outputUnit.value === standardUnits[selectedCategory.value]
})

function swapUnits() {
  [inputUnit.value, outputUnit.value] = [outputUnit.value, inputUnit.value]
}

function copyResult() {
  if (!outputValue.value) return
  const text = `${displayOutputValue.value} ${outputUnitLabel.value}`
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

function clearInput() {
  inputValue.value = ''
}
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important
}

.unit-conversion {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
  padding: 16px;
  box-sizing: border-box;
  
  .category-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .category-select {
      flex-grow: 1;
    }
    
    .action-buttons {
      margin-left: 8px;
      display: flex;
      gap: 8px;
    }
  }
  
  .input-row {
    margin-bottom: 16px;
  }
  
  .unit-selection {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    
    mdui-select {
      flex: 1;
    }
    
    .swap-btn {
      flex-shrink: 0;
    }
  }
  
  .result-display {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    text-align: left;
    user-select: text;
    -ms-user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;
    
    .output-value {
      font-size: 2.5rem;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .output-unit {
      font-size: 1.1rem;
      color: var(--mdui-color-on-surface-variant);
      margin-bottom: 16px;
    }
    
    .conversion-relation {
      font-size: 0.875rem;
      color: var(--mdui-color-on-surface-variant);
      margin-bottom: 8px;
    }
    
    .standard-unit {
      font-size: 0.75rem;
      color: var(--mdui-color-primary);
    }
  }
}

@media (max-width: 600px) {
  .unit-conversion {
    .result-display {
      align-items: center;
      text-align: center;
      margin-top: 24px;
      margin-bottom: 24px;
      
      .output-value {
        font-size: 3rem;
      }
    }
    
    .input-field {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
      padding: 16px;
      background: var(--mdui-color-surface);
      box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
      z-index: 100;
    }
  }
}

@media (min-width: 601px) {
  .unit-conversion {
    max-width: 600px;
    margin: 0 auto;
  }
}

mdui-menu-item::part(container) {
  height: 1.8rem;
}

mdui-text-field {
  &::part(container) {
    box-shadow: inset 0 -.0625rem 0 0 rgb(var(--mdui-color-on-surface-variant));
  }
  &::part(supporting) {
    display: none;
  }
  &::part(label) {
    color: rgb(var(--mdui-color-on-surface-variant));
  }
  &::part(error-icon) {
    display: none;
  }
  &::part(input) {
    caret-color: rgb(var(--mdui-color-primary));
  }
}
</style>