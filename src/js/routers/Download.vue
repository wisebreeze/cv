<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div class="download-container">
      <mdui-tabs class="version-tabs" :value="selectedVersion" @change="handleTabChange">
        <mdui-tab value="bedrock">{{ t('download.bedrock') }}</mdui-tab>
        <mdui-tab value="java">{{ t('download.java') }}</mdui-tab>
      </mdui-tabs>
      
      <mdui-card 
        class="faq-card"
        clickable
        @click="router.push('/faq')"
      >
        <div class="faq-content">
          <ion-icon name="help-circle-outline" class="faq-icon"></ion-icon>
          <div class="faq-text">
            <div variant="title-large">{{ t('download.faqTitle') }}</div>
            <div variant="body-medium" class="faq-desc">
              {{ t('download.faqDesc') }}
            </div>
          </div>
        </div>
      </mdui-card>
      
      <transition name="fade" mode="out-in">
        <mdui-list class="download-list" v-if="selectedVersion === 'bedrock'">
          <mdui-list-item rounded @click="router.push('/group')">
            <div class="item-content">
              <div class="text-content">
                <div variant="title-large">{{ t('main.groupChat') }}</div>
              </div>
              <ion-icon name="chatbubbles-outline" class="chat-icon"></ion-icon>
            </div>
          </mdui-list-item>
          
          <mdui-list-item rounded v-for="(item, index) in bedrockDownloads" :key="index" 
            @click="toggleExpand(item)"
            :class="{ 'has-expand': !item.link }">
            <div class="item-content">
              <div class="text-content">
                <div variant="title-large">{{ t(item.title) }}</div>
              </div>
              <ion-icon v-if="item.link" name="open-outline" class="open-icon"></ion-icon>
              <ion-icon v-else 
                name="chevron-down-outline" 
                class="expand-icon"
                :style="{ transform: expandedItems.includes(item.title) ? 'rotate(180deg)' : 'rotate(0deg)' }"></ion-icon>
            </div>
            
            <transition name="expand">
              <div v-if="!item.link && expandedItems.includes(item.title)" class="expand-content">
                <div variant="body-medium" class="instructions">
                  {{ t(item.instructions) }}
                </div>
              </div>
            </transition>
          </mdui-list-item>
        </mdui-list>
        
        <mdui-list class="download-list" v-else>
          <mdui-list-item rounded @click="router.push('/group')">
            <div class="item-content">
              <div class="text-content">
                <div variant="title-large">{{ t('main.groupChat') }}</div>
              </div>
              <ion-icon name="chatbubbles-outline" class="chat-icon"></ion-icon>
            </div>
          </mdui-list-item>
          <mdui-list-item rounded v-for="(item, index) in javaDownloads" :key="index" 
            @click="window.open(item.link, '_blank')">
            <div class="item-content">
              <div class="text-content">
                <div variant="title-large">{{ t(item.title) }}</div>
              </div>
              <ion-icon name="open-outline" class="open-icon"></ion-icon>
            </div>
          </mdui-list-item>
        </mdui-list>
      </transition>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar'

const { t, locale } = useI18n()
const router = useRouter()
const selectedVersion = ref('bedrock')
const expandedItems = ref([])

const bedrockItems = [
  {
    title: 'download.feijipan',
    link: 'https://share.feijipan.com/s/5RVuwjho',
    onlyZH: true
  },
  {
    title: 'download.mediafire',
    link: 'https://www.mediafire.com/folder/gfnv21hd4yzzs/CubeVisage+UI'
  },
  {
    title: 'download.curseforge',
    link: 'https://www.curseforge.com/minecraft-bedrock/texture-packs/cubevisage-ui'
  },
  {
    title: 'download.mcpedl',
    link: 'https://mcpedl.com/cubevisage-ui/'
  },
  {
    title: 'download.minebbs',
    link: 'https://www.minebbs.com/resources/ui.17313',
    onlyZH: true
  },
  {
    title: 'download.klpbbs',
    link: 'https://klpbbs.com/forum.php?mod=viewthread&tid=18896&page=1',
    onlyZH: true
  }
  /*{
    title: 'title',
    link: null,
    instructions: 'description',
    onlyZH: true
  }*/
]

const javaItems = [
  {
    title: 'download.curseforge',
    link: 'https://www.curseforge.com'
  },
  {
    title: 'download.modrinth',
    link: 'https://modrinth.com'
  }
]

const bedrockDownloads = computed(() => {
  return bedrockItems.filter(item => locale.value === 'zh-CN' || !item.onlyZH)
})

const javaDownloads = computed(() => {
  return javaItems
})

const handleTabChange = (e) => {
  selectedVersion.value = e.target.value
  expandedItems.value = []
}

const toggleExpand = (item) => {
  if (item.link) {
    window.open(item.link, '_blank')
  } else {
    const index = expandedItems.value.indexOf(item.title)
    if (index > -1) {
      expandedItems.value.splice(index, 1)
    } else {
      expandedItems.value.push(item.title)
    }
  }
}
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important;
  background-color: var(--mdui-color-surface-container-lowest);
}

.download-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
  
  @media (min-width: 600px) {
    padding: 32px 24px;
  }
}

.version-tabs {
  margin: 0 auto 24px;
  max-width: 300px;
}

.faq-card {
  border-radius: 12px;
  box-shadow: none;
  box-sizing: border-box;
  overflow: hidden;
  background-color: rgba(var(--mdui-color-primary-container), 0.2);
  transition: all 0.3s var(--mdui-motion-easing-emphasized);
  width: 100%;
  
  &:hover {
    background-color: rgba(var(--mdui-color-primary-container), 0.32);
  }
  
  .faq-content {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;

    .faq-icon {
      flex-shrink: 0;
      font-size: 28px;
      color: rgb(var(--mdui-color-primary));
      opacity: 0.8;
    }

    .faq-text {
      flex: 1;
      min-width: 0;

      .faq-desc {
        color: var(--mdui-color-on-surface-variant);
        margin-top: 8px;
        opacity: 0.8;
      }
    }
  }
}

.download-list {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  .expand-icon {
    font-size: 20px;
    transition: transform 0.3s var(--mdui-motion-easing-emphasized);
  }
}

.mdui-list-item {
  padding: 0;
  transition: background-color 0.2s var(--mdui-motion-easing-emphasized);
}

.item-content {
  display: flex;
  align-items: center;
  padding: 8px;
  width: 100%;
  
  .text-content {
    flex: 1;
    min-width: 0;
  }
  
  .open-icon,
  .chat-icon,
  .expand-icon {
    color: var(--mdui-color-on-surface-variant);
    font-size: 20px;
  }
}

.expand-content {
  padding: 0 8px 8px;
  
  .instructions {
    color: var(--mdui-color-on-surface-variant);
    padding: 8px;
    background-color: var(--mdui-color-surface-container-highest);
    border-radius: 12px;
    margin: 0 16px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}
</style>