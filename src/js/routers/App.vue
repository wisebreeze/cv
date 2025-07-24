<template>
  <div id="app" :style="contentStyle">
    <div class="router-container">
      <transition-group :name="transitionName">
        <component
          :is="CurrentComponent"
          :key="currentKey"
          class="router-component current"
        />
        <component
          :is="PreviousComponent"
          v-if="showPrevious"
          :key="previousKey"
          class="router-component previous"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import fs from '../functions/file'

const { t } = useI18n()
const router = useRouter()
const transitionName = ref('')
const currentKey = ref(router.currentRoute.value.path)
const previousKey = ref('')
const showPrevious = ref(false)

const fileProvide = ref(new fs('indexedDB'))
const error = ref(e => {
  console.error(e)
  mdui.snackbar({
    action: t("editor.copy"),
    autoCloseDelay: 5000,
    closeable: true,
    message: e,
    onActionClick: () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(e)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = e
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
    },
    placement: "bottom"
  })
})
provide('fs', fileProvide)
provide('error', error)

const windowWidth = ref(0)
const windowHeight = ref(0)

const CurrentComponent = computed(() => {
  return router.currentRoute.value.matched[0]?.components?.default
})

const PreviousComponent = computed(() => {
  return router.getRoutes().find(r => r.path === previousKey.value)?.component
})

router.beforeEach((to, from) => {
  previousKey.value = from.path
  showPrevious.value = true
  
  if (to.meta.i > from.meta.i) {
    transitionName.value = 'slide-left'
  } else if (to.meta.i < from.meta.i) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = ''
  }
})

watch(() => router.currentRoute.value, (to) => {
  currentKey.value = to.path
  setTimeout(() => {
    showPrevious.value = false
  }, 300)
})

const updateDimensions = () => {
  windowHeight.value = window.innerHeight
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})

const contentStyle = computed(() => {
  return {
    '--window-height': `${windowHeight.value}px`,
    '--window-width': `${windowWidth.value}px`
  }
});
</script>

<style>
#app {
  position: relative;
  width: var(--window-width);
  height: var(--window-height);
  overflow: hidden;
}

.router-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.router-component {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.current {
  z-index: 2;
}

.previous {
  z-index: 1;
}

mdui-dialog {
  z-index: 10000;
}

/* 动画定义 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

/* 向右滑动 */
.slide-left-enter-active {
  z-index: 2;
}
.slide-left-enter-from {
  transform: translateX(40%);
}
.slide-left-leave-active {
  z-index: 1;
}
.slide-left-leave-to {
  transform: translateX(-20%);
  opacity: 0;
}

/* 向左滑动 */
.slide-right-enter-active {
  z-index: 2;
}
.slide-right-enter-from {
  transform: translateX(-20%);
}
.slide-right-leave-active {
  z-index: 1;
}
.slide-right-leave-to {
  transform: translateX(40%);
  opacity: 0;
}
</style>