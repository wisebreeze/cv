<template>
  <div>
    <Topbar />
    <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
      <div v-if="isMobile" class="toolbox-header-mobile">
        <mdui-tabs v-model="activeCategory" class="toolbox-tabs-mobile" @change="handleTabChange">
          <mdui-tab v-for="(category, index) in categoriesWithAll" :key="index" :value="index">
            {{ t(category.label) }}
          </mdui-tab>
        </mdui-tabs>
      </div>
      
      <div class="toolbox-container" :class="{ 'toolbox-mobile': isMobile }">
        <div v-if="!isMobile">
          <mdui-tabs v-model="activeCategory" class="toolbox-tabs" placement="left-start" @change="handleTabChange">
            <mdui-tab v-for="(category, index) in categoriesWithAll" :key="index" :value="index">
              {{ t(category.label) }}
            </mdui-tab>
          </mdui-tabs>
        </div>
        
        <div class="toolbox-content">
          <div class="transition-wrapper">
            <div 
              v-for="(category, index) in categoriesWithAll" 
              :key="index" 
              class="category-tools"
              :class="{
                active: activeCategory === index,
                'in-from-right': activeCategory === index && direction > 0,
                'in-from-left': activeCategory === index && direction < 0,
                'out-to-left': previousCategory === index && direction > 0,
                'out-to-right': previousCategory === index && direction < 0
              }"
            >
              <div 
                v-for="(tool, toolIndex) in category.tools" 
                :key="toolIndex" 
                class="tool-item"
                @click="router.push(tool.route)"
              >
                <ion-icon :name="tool.icon"></ion-icon>
                <span class="tool-name">{{ tool.text }}</span>
                <ion-icon name="chevron-forward" class="tool-arrow"></ion-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar.vue'

const { t } = useI18n()
const router = useRouter()

const categories = reactive([
  {
    label: "toolbox.text",
    tools: [
      { icon: "id-card-outline", text: "UUID 生成", route: '/toolbox/uuid' }
    ]
  },
  {
    label: "toolbox.image",
    tools: [
      { icon: "image-outline", text: "图片编辑", route: '/toolbox/picture' }
    ]
  },
  {
    label: "toolbox.video",
    tools: [
      
    ]
  },
  {
    label: "toolbox.other",
    tools: [
      { icon: "flash-outline", text: "每秒点击次数", route: '/toolbox/cps' },
      { icon: "stopwatch-outline", text: "秒表", route: '/toolbox/stopwatch' },
      { icon: "person-circle-outline", text: "浏览器 UA", route: '/toolbox/ua' },
      { icon: "repeat-outline", text: "单位换算", route: '/toolbox/units' }
    ]
  }
])

const activeCategory = ref(0)
const previousCategory = ref(0)
const direction = ref(0)
const isMobile = ref(false)
const windowWidth = ref(window.innerWidth)
const startX = ref(0)
const endX = ref(0)
const maxTabs = computed(() => categoriesWithAll.value.length - 1)

let resizeHandler = null

onMounted(() => {
  resizeHandler = () => {
    windowWidth.value = window.innerWidth
  }
  
  window.addEventListener('resize', resizeHandler)
  windowWidth.value = window.innerWidth
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})

const checkScreenSize = () => {
  isMobile.value = windowWidth.value < 768
}

checkScreenSize()

watch(windowWidth, checkScreenSize)

const categoriesWithAll = computed(() => {
  const allToolsCategory = {
    label: "toolbox.all",
    tools: categories.map(cat => cat.tools).flat()
  }
  
  return [allToolsCategory, ...categories]
})

const handleTabChange = e => {
  previousCategory.value = activeCategory.value
  direction.value = e.target.value > activeCategory.value ? 1 : -1
  activeCategory.value = e.target.value
}

/*const touchStartHandler = (e) => {
  if (!isMobile.value) return
  startX.value = e.touches[0].clientX
}

const touchEndHandler = (e) => {
  if (!isMobile.value) return
  
  endX.value = e.changedTouches[0].clientX
  const threshold = 50
  const diff = startX.value - endX.value
  const oldValue = activeCategory.value
  
  if (diff > threshold && oldValue < maxTabs.value) {
    previousCategory.value = oldValue
    direction.value = 1
    activeCategory.value = oldValue + 1
  } else if (diff < -threshold && oldValue > 0) {
    previousCategory.value = oldValue
    direction.value = -1
    activeCategory.value = oldValue - 1
  }
}*/
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important;
}

.toolbox-header-mobile {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbox-tabs-mobile {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: flex-start;

  &::-webkit-scrollbar {
    display: none;
  }

  :deep(.mdui-tab) {
    flex: 0 0 auto;
    white-space: nowrap;
    padding: 0 16px;
    min-width: 80px;
  }
}

.toolbox-container {
  display: flex;
  height: calc(var(--window-height) - 64px);
}

.toolbox-mobile {
  flex-direction: column;
}

.toolbox-tabs {
  height: 100%;
  :deep(.mdui-tab) {
    min-width: 120px;
  }
}

.toolbox-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  position: relative;
}

.transition-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.category-tools {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease;
  z-index: 0;
  transform: translateX(100%);
}

.category-tools.active {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0);
  z-index: 2;
}

.category-tools.in-from-right {
  transform: translateX(0);
  z-index: 2;
}

.category-tools.in-from-left {
  transform: translateX(0);
  z-index: 2;
}

.category-tools.out-to-left {
  transform: translateX(-100%);
  z-index: 1;
}

.category-tools.out-to-right {
  transform: translateX(100%);
  z-index: 1;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  transform: translateZ(0);
  
  &:hover {
    background: rgb(var(--mdui-color-surface-container-light));
  }
}

ion-icon {
  margin-right: 16px;
  transition: transform 0.2s;
}

.tool-item:hover ion-icon:first-child {
  transform: scale(1.1);
}

.tool-name {
  flex: 1;
}

.tool-arrow {
  margin-left: 16px;
  opacity: 0.6;
  transition: transform 0.2s;
}

.tool-item:hover .tool-arrow {
  transform: translateX(4px);
}
</style>