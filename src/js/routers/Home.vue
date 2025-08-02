<template>
  <div>
    <Topbar />
    <div
      id="content"
      class="ns"
      :style="contentStyle"
      @wheel.passive="handleWheel"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend.passive="onTouchEnd"
    >
      <Transition :name="transitionName" mode="out-in" appear>
        <section 
          v-show="currentPage === 0" 
          ref="page1" 
          class="page"
          key="page1"
        >
          <div class="hero">
            <h1 class="title gradient-text">{{ $t('main.heroTitle') }}</h1>
            <p class="subtitle">{{ $t('main.heroSubtitle') }}</p>
          </div>
          <div class="actions">
            <mdui-button variant="filled" @click="$router.push('/download')">{{ $t('main.getStarted') }}</mdui-button>
            <mdui-button variant="outlined" @click="$router.push('/custom')">{{ $t('main.customize') }}</mdui-button>
          </div>
        </section>
      </Transition>

      <Transition :name="transitionName" mode="out-in" appear>
        <section 
          v-show="currentPage === 1" 
          ref="page2" 
          class="page"
          key="page2"
        >
          <h2 class="section-title">{{ $t('main.whyTitle') }}</h2>
          <div class="cards">
            <mdui-card class="card">
              <ion-icon name="color-palette-outline" size="large"></ion-icon>
              <div>
                <strong>{{ $t('main.card1Title') }}</strong>
                <span>{{ $t('main.card1Desc') }}</span>
              </div>
            </mdui-card>
            <mdui-card class="card">
              <ion-icon name="phone-portrait-outline" size="large"></ion-icon>
              <div>
                <strong>{{ $t('main.card2Title') }}</strong>
                <span>{{ $t('main.card2Desc') }}</span>
              </div>
            </mdui-card>
            <mdui-card class="card">
              <ion-icon name="sparkles-outline" size="large"></ion-icon>
              <div>
                <strong>{{ $t('main.card3Title') }}</strong>
                <span>{{ $t('main.card3Desc') }}</span>
              </div>
            </mdui-card>
          </div>
        </section>
      </Transition>

      <Transition :name="transitionName" mode="out-in" appear>
        <section 
          v-show="currentPage === 2" 
          ref="page3" 
          class="page"
          key="page3"
        >
          <div class="feature-container">
            <div class="feature-content">
              <div class="feature-badge gradient-text">
                <ion-icon name="sparkles-outline"></ion-icon>
                <span>{{ $t('main.newFeature') }}</span>
              </div>
              <h2 class="feature-title">{{ $t('main.panelTitle') }}</h2>
              <p class="feature-desc">{{ $t('main.panelDesc') }}</p>
            </div>
            <img src="../../image/panel.jpg" class="feature-image">
          </div>
        </section>
      </Transition>

      <Transition :name="transitionName" mode="out-in" appear>
        <section 
          v-show="currentPage === 3" 
          ref="page4" 
          class="page"
          key="page4"
        >
          <div class="feature-container">
            <div class="feature-content">
              <div class="feature-badge gradient-text">
                <ion-icon name="sparkles-outline"></ion-icon>
                <span>{{ $t('main.newFeature') }}</span>
              </div>
              <h2 class="feature-title">{{ $t('main.compatibleTitle') }}</h2>
              <p class="feature-desc">{{ $t('main.compatibleDesc') }}</p>
            </div>
            <img src="../../image/compatible.jpg" class="feature-image">
          </div>
        </section>
      </Transition>

      <Transition :name="transitionName" mode="out-in" appear>
        <section 
          v-show="currentPage === 4" 
          ref="page5" 
          class="page"
          key="page5"
        >
          <div class="feature-container">
            <div class="feature-content">
              <div class="feature-badge gradient-text">
                <ion-icon name="sparkles-outline"></ion-icon>
                <span>{{ $t('main.newFeature') }}</span>
              </div>
              <h2 class="feature-title">{{ $t('main.designTitle') }}</h2>
              <p class="feature-desc">{{ $t('main.designDesc') }}</p>
            </div>
            <img src="../../image/design.jpg" class="feature-image">
            <p class="more-content">{{ $t('main.moreContent') }}</p>
          </div>
        </section>
      </Transition>

      <Transition :name="transitionName" mode="out-in" appear>
        <section 
          v-show="currentPage === 5" 
          ref="page6" 
          class="page footer-page"
          key="page6"
        >
          <div class="footer-top">
            <div class="footer-brand">
              <img src="../../image/icon.png" style="height: 2.5rem;width: 2.5rem;">
              <span class="footer-title">{{ $t('main.heroTitle') }}</span>
            </div>
            <mdui-button 
              variant="filled" 
              class="footer-button"
              @click="$router.push('/download')"
            >
              {{ $t('main.getStarted') }}
            </mdui-button>
          </div>
          
          <div class="footer-sitemap">
            <div class="sitemap-column left-column">
              <mdui-button variant="text" @click="$router.push('/group')">{{ $t('main.groupChat') }}</mdui-button>
              <mdui-button variant="text" @click="$router.push('/custom')">{{ $t('main.customize') }}</mdui-button>
            </div>
            <div class="sitemap-column right-column">
              <mdui-button variant="text" @click="$router.push('/privacy')">{{ $t('main.privacyPolicy') }}</mdui-button>
              <mdui-button variant="text" @click="$router.push('/terms')">{{ $t('main.userAgreement') }}</mdui-button>
            </div>
          </div>
          
          <div class="footer-copyright">
            {{ $t('main.copyright') }}
          </div>
        </section>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Topbar from '../components/Topbar'

defineProps({
  isDesktop: {
    type: Boolean,
    default: false
  },
  isSidebar: {
    type: Boolean,
    default: false
  }
})

const currentPage = ref(0)
const transitionName = ref('page-down')
let startY = 0
let isAnimating = false
let wheelTimeout = null
let lastScrollDirection = null

const contentStyle = computed(() => ({
  width: '100%',
  height: 'var(--window-height)',
  boxSizing: 'border-box',
  overflowY: 'hidden',
  position: 'relative'
}))

const setWindowHeight = () => {
  const height = window.innerHeight
  document.documentElement.style.setProperty('--window-height', `${height}px`)
}

const scrollToPage = (index) => {
  if (index < 0 || index >= 6 || isAnimating) return
  
  transitionName.value = index > currentPage.value ? 'page-up' : 'page-down'
  lastScrollDirection = index > currentPage.value ? 'up' : 'down'
  
  isAnimating = true
  currentPage.value = index
  setTimeout(() => { isAnimating = false }, 700)
}

const handleWheel = (e) => {
  if (isAnimating) return
  
  clearTimeout(wheelTimeout)
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 50 && currentPage.value < 5) {
      scrollToPage(currentPage.value + 1)
    } else if (e.deltaY < -50 && currentPage.value > 0) {
      scrollToPage(currentPage.value - 1)
    }
  }, 50)
}

const onTouchStart = (e) => { 
  startY = e.touches[0].clientY 
}

const onTouchMove = (e) => {
  if (isAnimating) e.preventDefault()
}

const onTouchEnd = (e) => {
  if (isAnimating) return
  
  const deltaY = startY - e.changedTouches[0].clientY
  if (Math.abs(deltaY) < 60) return
  
  if (deltaY > 60 && currentPage.value < 5) {
    scrollToPage(currentPage.value + 1)
  } else if (deltaY < -60 && currentPage.value > 0) {
    scrollToPage(currentPage.value - 1)
  }
}

let touchStartY = 0
const preventPullToRefresh = (e) => {
  if (window.scrollY <= 0 && e.touches[0].clientY > touchStartY) {
    e.preventDefault()
  }
}

onMounted(() => {
  setWindowHeight()
  window.addEventListener('resize', setWindowHeight)
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY
  }, { passive: true })
  document.addEventListener('touchmove', preventPullToRefresh, { passive: false })
})

onBeforeUnmount(() => {
  document.removeEventListener('touchmove', preventPullToRefresh)
  document.removeEventListener('touchstart', () => {})
  window.removeEventListener('resize', setWindowHeight)
  clearTimeout(wheelTimeout)
})
</script>

<style scoped lang="scss">
#content {
  padding-top: 64px !important;
  perspective: 1000px;
}

.page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--window-height);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  
  &:nth-child(1) {
    z-index: 10;
  }
  
  &:nth-child(2) {
    z-index: 9;
  }

  &:nth-child(3) {
    z-index: 8;
  }

  &:nth-child(4) {
    z-index: 7;
  }

  &:nth-child(5) {
    z-index: 6;
  }
}

.feature-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  gap: 32px;
}

.feature-image {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: element-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
  transform: translateY(20px);
  opacity: 0;
}

.feature-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: element-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
  transform: translateY(20px);
  opacity: 0;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  margin-bottom: 8px;
  
  ion-icon {
    font-size: 1rem;
  }
}

.feature-title {
  font-size: 2rem;
  margin: 0 0 12px;
  color: var(--mdui-color-on-surface);
}

.feature-desc {
  font-size: 1.125rem;
  color: var(--mdui-color-on-surface-variant);
  margin: 0 0 24px;
  max-width: 500px;
}

.more-content {
  font-size: 1rem;
  color: var(--mdui-color-on-surface-variant);
  animation: element-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
  transform: translateY(20px);
  opacity: 0;
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  text-align: center;
}

.page-up-enter-active {
  animation: page-up-enter 0.7s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

.page-up-leave-active {
  animation: page-up-leave 0.7s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

@keyframes page-up-enter {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes page-up-leave {
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}

.page-down-enter-active {
  animation: page-down-enter 0.7s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

.page-down-leave-active {
  animation: page-down-leave 0.7s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

@keyframes page-down-enter {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes page-down-leave {
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.gradient-text {
  background: linear-gradient(135deg, #85bbe7 0%, #0e68b1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title {
  font-size: 3rem;
  margin: 0 0 8px;
  animation: element-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
  transform: translateY(20px);
  opacity: 0;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--mdui-color-on-surface-variant);
  margin: 0 0 32px;
  animation: element-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
  transform: translateY(20px);
  opacity: 0;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 32px;
  color: var(--mdui-color-on-surface);
  animation: element-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
  transform: translateY(20px);
  opacity: 0;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 960px;
}

.card {
  display: flex;
  gap: 16px;
  padding: 16px;
  animation: element-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform: translateY(30px);
  opacity: 0;
  
  ion-icon {
    color: var(--mdui-color-primary);
    flex-shrink: 0;
  }
  
  strong {
    display: block;
    margin-bottom: 4px;
    font-weight: 600;
  }
  
  span {
    color: var(--mdui-color-on-surface-variant);
    font-size: .875rem;
  }
  
  &:nth-child(1) {
    animation-delay: 0.3s;
  }
  &:nth-child(2) {
    animation-delay: 0.4s;
  }
  &:nth-child(3) {
    animation-delay: 0.5s;
  }
}

@keyframes element-enter {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.actions {
  position: absolute;
  bottom: 48px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  mdui-button {
    min-width: 200px;
    animation: element-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform: translateY(30px);
    opacity: 0;
    
    &:nth-child(1) {
      animation-delay: 0.4s;
    }
    &:nth-child(2) {
      animation-delay: 0.5s;
    }
  }
}

.hero {
  text-align: center;
}

.footer-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.footer-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;
  
  .footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  .footer-button {
    min-width: 200px;
    animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    opacity: 0;
    transform: translateY(20px);
  }
}

.footer-sitemap {
  height: 8%;
  display: flex;
  justify-content: space-around;
  padding: 0 24px 80px;
  
  .left-column {
    animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  .right-column {
    animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
    opacity: 0;
    transform: translateY(20px);
  }
}

.sitemap-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  mdui-button {
    justify-content: flex-start;
    color: var(--mdui-color-on-surface);
  }
}

.footer-copyright {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  color: var(--mdui-color-on-surface-variant);
  font-size: 0.875rem;
  animation: fadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@media (min-width: 768px) {
  .page {
    padding-left: 72px;
    padding-bottom: 24px;
    align-items: flex-start;
  }
  
  .hero {
    text-align: left;
  }
  
  .actions {
    position: static;
    flex-direction: row;
    justify-content: flex-start;
    
    mdui-button {
      min-width: auto;
    }
  }
  
  .cards {
    flex-direction: row;
  }
  
  .section-title {
    align-self: flex-start;
  }
  
  .card {
    flex: 1;
    min-width: 0;
  }

  .feature-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    text-align: left;
  }

  .feature-content {
    align-items: flex-start;
    max-width: 45%;
    text-align: left;
  }

  .feature-image {
    max-width: 50%;
    order: 2;
  }

  .footer-page {
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .footer-top {
    position: static;
    width: auto;
    height: auto;
    padding-bottom: 0;
    margin-right: 48px;
    align-items: center;
  }

  .footer-sitemap {
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin-bottom: 0;
    flex-direction: row;
    gap: 48px;
    justify-content: center;
  }

  .sitemap-column {
    flex-direction: column;
    gap: 12px;
  }

  .footer-copyright {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    text-align: center;
  }
}
</style>