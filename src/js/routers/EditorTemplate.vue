<template>
  <div>
    <Topbar v-if="!isDesktop" />
    <div :id="!isDesktop ? 'content' : ''" class="ns" style="width: 100%;height: var(--window-height);box-sizing: border-box;overflow-y: auto">
      
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped lang="scss">
#content {
  padding-top: 64px !important;
}
</style>