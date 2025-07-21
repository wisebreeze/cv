<template>
<div>
  <Topbar />
  <div id="content" :style="contentStyle">
    <div class="not-found-content">
      <h1 class="main-text">404</h1>
      <div class="sub-text"> {{ $t("e$title") }} </div>
      <div class="button-container">
        <mdui-button 
          variant="filled" 
          @click="goBack"
          :style="{padding: '0.5rem'}"
        >
          {{ $t("e$back") }}
        </mdui-button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Topbar from '../components/Topbar'

export default {
  components: {
    Topbar
  },
  computed: {
    contentStyle() {
      return {
        '--window-height': `${this.windowHeight}px`,
        '--window-width': `${this.windowWidth}px`,
        '--content-height': `${this.windowHeight - 64}px`
      }
    }
  },
  data() {
    return {
      windowHeight: 0,
      windowWidth: 0
    }
  },
  methods: {
    updateDimensions() {
      this.windowHeight = window.innerHeight
      this.windowWidth = window.innerWidth
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1) // 尝试返回上一页
      } else {
        this.$router.push('/') // 没有历史记录则返回首页
      }
    }
  },
  mounted() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }
}
</script>

<style scoped>
#content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--content-height, calc(100vh - 64px));
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  padding: 20px;
}

.main-text {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
  margin-block-start: 0;
  margin-block-end: 0;
  color: var(--mdui-color-primary);
}

.sub-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--mdui-color-on-surface-variant);
}

.button-container {
  margin-top: 0.2rem;
}

.fade-transition-enter-active,
.fade-transition-leave-active {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-transition-enter-from,
.fade-transition-leave-to {
  opacity: 0;
}

.fade-transition-enter-to,
.fade-transition-leave-from {
  opacity: 1;
}
</style>