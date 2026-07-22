<template>
  <div>
    <Topbar v-if="isDesktop" />
    <div class="editor-container" :id="isDesktop ? 'content' : ''">
      <div v-if="isDesktop" class="editor-sidebar">
        <EditorSidebar
          :isDesktop="isDesktop"
          :isSidebar="true"
        />
      </div>
      <div :class="isDesktop ? 'editor-content desktop' : 'editor-content'">
        <transition-group :name="transitionName">
          <component
            :is="CurrentComponent"
            :isDesktop="isDesktop"
            :key="currentKey"
            class="editor-component current"
          />
          <component
            :is="PreviousComponent"
            :isDesktop="isDesktop"
            :key="previousKey"
            class="editor-component previous"
            v-if="showPrevious"
          />
        </transition-group>
      </div>
      <Transition name="dialog">
        <div v-if="showDownloadDialog" class="download-dialog-overlay" @click.self="showDownloadDialog = false">
          <div class="download-dialog">
            <div class="ns download-dialog-header">
              <h2 class="download-dialog-title">{{ t('gui$download') }}</h2>
              <mdui-button-icon @click="showDownloadDialog = false">
                <ion-icon name="close-outline"></ion-icon>
              </mdui-button-icon>
            </div>
            <div class="download-dialog-content">
              <div class="download-helps">
                <div class="ns download-progress">
                  <div>{{ t("download.progress", [parseFloat(downloadProgress.toFixed(2))]) }}</div>
                  <mdui-linear-progress :value="downloadProgress" max="100" />
                  <mdui-button
                    class="download-button-firefox"
                    variant="filled"
                    full-width
                    v-if="isFirefox"
                    @click="handleDownload"
                  >
                    {{ t('gui$download') }}
                  </mdui-button>
                </div>
                <div
                  v-for="(item, index) in [1,2,3,4,5,6]"
                  :key="index"
                  class="download-help"
                >
                  <h3>{{ t('download.help'+item) }}</h3>
                  <p v-html="$t('download.help'+item+'desc').replace(/\n/g, '<br>')" />
                </div>
              </div>
            </div>
            <div class="download-dialog-footer" v-if="!isFirefox">
              <mdui-button
                variant="filled"
                full-width
                @click="handleDownload"
              >
                {{ t('gui$download') }}
              </mdui-button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, provide, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import Topbar from '../components/Topbar'
import EditorSidebar from './EditorSidebar.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const error = inject("error")
const fs = inject("fs")

const transitionName = ref('')
const currentKey = ref(route.path)
const previousKey = ref('')
const showPrevious = ref(false)
const isDesktop = ref(window.innerWidth >= 768)

const showDownloadDialog = ref(false)
const downloadProgress = ref(0)
provide('showDownloadDialog', showDownloadDialog)

const CurrentComponent = computed(() => {
  return route.matched[1]?.components?.default
})

const PreviousComponent = computed(() => {
  return router.getRoutes().find(r => r.path === previousKey.value)?.component
})

router.beforeEach((to, from) => {
  previousKey.value = from.path
  showPrevious.value = true
  
  const toMeta = to.matched[to.matched.length - 1].meta.i || 0
  const fromMeta = from.matched[from.matched.length - 1].meta.i || 0

  if (toMeta > fromMeta) {
    transitionName.value = 'slide-left'
  } else if (toMeta < fromMeta) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = ''
  }
})

watch(() => route.path, (to) => {
  currentKey.value = to
  setTimeout(() => {
    showPrevious.value = false
  }, 300)
})

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768
}

const uuid = () => {
  var a = (new Date).getTime();
  return window.performance && "function" == typeof window.performance.now && (a += performance.now()), "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(b) {
    var c = 0 | (a + 16 * Math.random()) % 16;
    return a = Math.floor(a / 16), ("x" == b ? c : 8 | 3 & c).toString(16)
  })
}

const handleDownload = async () => {
  try {
    downloadProgress.value = 0
  
    let zipFileName = 'export.zip'
    if (await fs.value.exist("manifest.json")) {
      const manifestJSON = await fs.value.read("manifest.json")
      const packName = manifestJSON.header ? manifestJSON.header.name && manifestJSON.header.name.trim(" ") !== '' ? manifestJSON.header.name : 'export' : 'export'
      zipFileName = packName.length > 15 ? packName.substring(0, 15) + '....zip' : packName + '.zip';
    } else {
      const uuid1 = uuid()
      const uuid2 = uuid()
      await fs.value.write("manifest.json", {
        format_version: 2,
        header: {
          name: "",
          description: "",
          uuid: uuid1,
          version: [1,0,0],
          min_engine_version: [1,18,0]
        },
        modules: [
          {
            type: "resources",
            uuid: uuid2,
            version: [1,0,0]
          }
        ]
      })
    }
  
    await fs.value.exportToZip(zipFileName, ({ percent }) => {
      downloadProgress.value = percent
    })
    showDownloadDialog.value = false
  } catch (e) {
    error.value(e)
    console.error(e)
  }
}

const isFirefox = computed(() => {
  if (typeof InstallTrigger !== 'undefined') {
    return true
  }
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('firefox') && !ua.includes('seamonkey')) {
    return true
  }
  return false
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
$enter-easing: ease-out;
$leave-easing: ease-in;

#content {
  padding-top: 64px;
}

.editor-container {
  display: grid;
  grid-template-columns: 340px 1fr;
  width: 100%;
  height: 100%;
}

.editor-sidebar {
  // border-right: 1px solid rgba(var(--mdui-color-outline-variant), 1);
  z-index: 2001;
}

.editor-content {
  overflow: hidden;
  position: relative;
  z-index: 2001;
  & .desktop {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 1.5rem 0 0 0;
  }
}

.editor-component {
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

@media (max-width: 767px) {
  .editor-container {
    grid-template-columns: 1fr; // 移动端不显示左侧边栏
  }
  .editor-sidebar {
    display: none;
  }
}

/* 下载弹窗样式 */
.download-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end; /* 对齐到底部 */
  z-index: 2002;
}

.download-dialog {
  width: 90%;
  max-width: 600px;
  max-height: 80%;
  background-color: rgb(var(--mdui-color-surface));
  border-radius: 12px 12px 0 0; /* 左上、右上为圆角，左下、右下为直角 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .download-dialog {
    width: 60%;
    max-height: none;
    border-radius: 12px;
  }
}

.download-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 1);
  > .download-dialog-title {
    margin: 0;
    font-size: 1.5rem;
    color: rgb(var(--mdui-color-on-surface));
  }
}

.download-dialog-content {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
  word-break: break-word;
  white-space: pre-wrap;
  > .download-helps {
    margin-bottom: 6.5rem;
    > .download-progress {
      margin-bottom: 1.5rem;
      > .download-button-firefox {
        margin-top: 0.5rem;
      }
    }
    > .download-help {
      margin-bottom: 1.5rem;
      > h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: rgb(var(--mdui-color-on-surface));
      }
      > p {
        color: rgb(var(--mdui-color-on-surface-variant));
        line-height: 1.6;
      }
    }
  }
}

.download-dialog-footer {
  padding: 1.5rem;
  position: sticky;
  bottom: 0;
  background-color: rgb(var(--mdui-color-surface));
  border-top: 1px solid rgba(var(--mdui-color-outline-variant), 1);
}

.dialog-enter-active {
  animation: dialog-overlay-alpha 0.3s $enter-easing 0s;
  .download-dialog {
    animation: dialog-enter 0.3s $enter-easing;
  }
}
.dialog-leave-active {
  animation: dialog-overlay-alpha 0.3s $leave-easing 0s reverse;
  .download-dialog {
    animation: dialog-leave 0.3s $leave-easing 0s reverse;
  }
}

@keyframes dialog-enter {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes dialog-leave {
  from {
    transform: translateY(100%);
    opacity: 1;
  }
  to {
    transform: translateY(0);
    opacity: 0;
  }
}

@keyframes dialog-overlay-alpha {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>