<template>
  <div id="app" :style="contentStyle">
    <transition name="fade">
      <div v-if="showAgreementBar" class="agreement-bar">
        <div class="agreement-content">
          <mdui-typography variant="body-medium">
            {{ agreementNoticeText }}
          </mdui-typography>
        </div>
        <div class="agreement-actions">
          <mdui-button variant="text" @click="showDetails">
            {{ t('main.details') }}
          </mdui-button>
          <mdui-button @click="acceptAgreement">
            {{ t('main.agree') }}
          </mdui-button>
        </div>
      </div>
    </transition>

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

    <mdui-dialog :open="showAgreementDialog">
      <div slot="headline">
        {{ t('main.agreementTitle') }}
      </div>
      <div class="agreement-dialog-content">
        {{ t('main.agreementContent') }}
      </div>
      <div class="agreement-dialog-content">
        <a @click="goToPrivacy" class="agreement-link">{{ t('main.privacyPolicy') }}</a>
        {{ " " }}
        <a @click="goToTerms" class="agreement-link">{{ t('main.userAgreement') }}</a>
      </div>
      <mdui-button slot="action" variant="text" @click="hideDetails">
        {{ t('main.cancel') }}
      </mdui-button>
      <mdui-button slot="action" @click="acceptAgreement">
        {{ t('main.agree') }}
      </mdui-button>
    </mdui-dialog>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import fs from '../functions/file'
import Cookies from '../functions/cookie'

const { t } = useI18n()
const router = useRouter()

const agreementVersion = '2025.8.10'
const agreedVersion = Cookies.get('agreed_version')
const isFirstVisit = ref(!agreedVersion)
const showAgreementBar = ref(agreedVersion !== agreementVersion)
const showAgreementDialog = ref(false)

const agreementNoticeText = computed(() => {
  return isFirstVisit.value 
    ? t('main.firstAgreementNotice')
    : t('main.updateAgreementNotice', { version: agreementVersion })
})

const showDetails = () => {
  showAgreementBar.value = false
  showAgreementDialog.value = true
}

const hideDetails = () => {
  showAgreementDialog.value = false
  showAgreementBar.value = true
}

const goToPrivacy = () => {
  router.push('/privacy')
  showAgreementDialog.value = false
}

const goToTerms = () => {
  router.push('/terms')
  showAgreementDialog.value = false
}

const acceptAgreement = () => {
  Cookies.set('agreed_version', agreementVersion, { expires: 365 })
  isFirstVisit.value = false
  showAgreementBar.value = false
  showAgreementDialog.value = false
}

const transitionName = ref('')
const currentKey = ref(router.currentRoute.value.path)
const previousKey = ref('')
const showPrevious = ref(false)

const fileProvide = ref(new fs('memory'))
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
})
</script>

<style lang="scss">
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

/* 协议提示条 */
.agreement-bar {
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background-color: rgba(var(--mdui-color-surface-container), 0.65);
  bottom: 0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: fixed;
  z-index: 999;
  
  @media (min-width: 600px) {
    padding: 16px 24px;
  }

  .agreement-content {
    flex: 1;
    margin-right: 16px;
  }

  .agreement-actions {
    display: flex;
    gap: 8px;
  }
}

/* 协议对话框 */
.agreement-dialog-content {
  margin-bottom: 12px;
  .agreement-link {
    color: rgb(var(--mdui-color-primary));
    text-decoration: none;
    position: relative;
    transition: all 0.3s var(--mdui-motion-easing-emphasized);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background-color: rgb(var(--mdui-color-primary));
      transition: width 0.3s var(--mdui-motion-easing-emphasized);
    }
    
    &:hover::after {
      width: 100%;
    }
  }
}

/* 动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s var(--mdui-motion-easing-emphasized);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
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