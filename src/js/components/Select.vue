<template>
  <div class="custom-select" :class="{ 'select-open': isOpen }" ref="selectContainer">
    <div class="select-field" @click="toggleDropdown">
      <!-- 标签 -->
      <div class="select-label" :class="{ 'label-active': isOpen || value }">
        {{ label }}
      </div>
      
      <div class="selected-value">
        {{ selectedLabel }}
      </div>
      
      <div class="select-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="arrow-icon">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </div>
    </div>
    
    <transition name="select-dropdown">
      <div 
        v-show="isOpen" 
        class="dropdown-menu" 
        ref="dropdownMenu"
        @click.stop
      >
        <div 
          v-for="option in options" 
          :key="option.value" 
          class="dropdown-item"
          :class="{ 'selected': value === option.value }"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
          <svg v-if="value === option.value" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['change', 'update:value'])

const isOpen = ref(false)
const selectContainer = ref(null)
const dropdownMenu = ref(null)

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.value)
  return selectedOption ? selectedOption.label : ''
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      adjustDropdownPosition()
    })
  }
}

function selectOption(value) {
  emit('update:value', value)
  emit('change', value)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    isOpen.value = false
  }
}

function adjustDropdownPosition() {
  if (!dropdownMenu.value) return
  
  const rect = selectContainer.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const menuHeight = dropdownMenu.value.offsetHeight
  const spaceBelow = windowHeight - rect.bottom
  
  // 如果下方空间不足，向上偏移
  if (spaceBelow < menuHeight) {
    dropdownMenu.value.style.top = 'auto'
    dropdownMenu.value.style.bottom = '100%'
    dropdownMenu.value.style.marginTop = '0'
    dropdownMenu.value.style.marginBottom = '4px'
  } else {
    dropdownMenu.value.style.top = '100%'
    dropdownMenu.value.style.bottom = 'auto'
    dropdownMenu.value.style.marginTop = '4px'
    dropdownMenu.value.style.marginBottom = '0'
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', adjustDropdownPosition)
  window.addEventListener('scroll', adjustDropdownPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', adjustDropdownPosition)
  window.removeEventListener('scroll', adjustDropdownPosition, true)
})
</script>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  width: 100%;
  z-index: 10; // 确保在正常文档流中显示
  
  .select-field {
    position: relative;
    display: flex;
    align-items: center;
    height: 30px;
    padding: 1.5rem 1rem 0.5rem;
    background-color: rgb(var(--mdui-color-surface-container-highest));
    border-radius: var(--mdui-shape-corner-extra-small) var(--mdui-shape-corner-extra-small) 0 0;
    box-shadow: inset 0 -.0625rem 0 0 rgb(var(--mdui-color-on-surface-variant));
    transition: box-shadow var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard);
    
    &:hover {
      box-shadow: inset 0 -.125rem 0 0 rgb(var(--mdui-color-on-surface));
    }
    
    .select-label {
      position: absolute;
      top: 50%;
      left: 1rem;
      font-size: 1rem;
      color: rgb(var(--mdui-color-on-surface-variant));
      transform: translateY(-50%);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      
      &.label-active {
        top: 0.75rem;
        font-size: 0.75rem;
        transform: translateY(0);
        color: rgb(var(--mdui-color-primary));
      }
    }
    
    .selected-value {
      flex: 1;
      font-size: 1rem;
      color: rgb(var(--mdui-color-on-surface));
      padding-top: 0.5rem;
    }
    
    .select-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: rgb(var(--mdui-color-on-surface-variant));
      
      .arrow-icon {
        width: 24px;
        height: 24px;
        fill: currentColor;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
  }
  
  &.select-open {
    .select-field {
      box-shadow: inset 0 -.125rem 0 0 rgb(var(--mdui-color-primary));
      
      .arrow-icon {
        transform: rotate(180deg);
      }
    }
    
    .dropdown-menu {
      opacity: 1;
      transform: scaleY(1);
      visibility: visible;
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: rgb(var(--mdui-color-surface-container));
    border-radius: var(--mdui-shape-corner-extra-small);
    box-shadow: var(--mdui-elevation-level3);
    overflow-y: auto;
    z-index: 100;
    transform-origin: top center;
    transform: scaleY(0.95);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 300px;
    
    .dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      font-size: 1rem;
      color: rgb(var(--mdui-color-on-surface));
      transition: background-color 0.2s;
      
      svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      
      &:hover {
        background-color: rgba(var(--mdui-color-primary), 0.08);
      }
      
      &:active {
        background-color: rgba(var(--mdui-color-primary), 0.12);
      }
      
      &.selected {
        background-color: rgba(var(--mdui-color-primary), 0.12);
        color: rgb(var(--mdui-color-primary));
        
        &:hover {
          background-color: rgba(var(--mdui-color-primary), 0.16);
        }
      }
    }
  }
}

.select-dropdown-enter-active {
  animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-dropdown-leave-active {
  animation: scale-out 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scaleY(0.8);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes scale-out {
  0% {
    opacity: 1;
    transform: scaleY(1);
  }
  100% {
    opacity: 0;
    transform: scaleY(0.8);
  }
}
</style>