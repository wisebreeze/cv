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
        @click="router.push('/faq')"
      >
        <div class="faq-content">
          <div variant="title-large">{{ t('download.faqTitle') }}</div>
          <div variant="body-medium" class="faq-desc">
            {{ t('download.faqDesc') }}
          </div>
          <ion-icon name="help-circle-outline" class="faq-icon"></ion-icon>
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
      
      <transition name="card-fade">
        <mdui-card class="old-version-card" v-if="selectedVersion === 'bedrock'">
          <div class="card-content">
            <div class="text-content">
              <h3 variant="title-large">{{ t('download.oldVersionTitle') }}</h3>
              <p variant="body-medium" class="description">
                {{ t('download.oldVersionDesc') }}
              </p>
            </div>
            <mdui-button variant="tonal" @click="openOldVersion">
              {{ t('download.oldVersionButton') }}
            </mdui-button>
          </div>
        </mdui-card>
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
    link: 'https://www.curseforge.com'
  },
  {
    title: 'download.mcpedl',
    link: 'https://mcpedl.com'
  },
  {
    title: 'download.minebbs',
    link: 'https://www.minebbs.com',
    onlyZH: true
  },
  {
    title: 'download.klpbbs',
    link: 'https://klpbbs.com',
    onlyZH: true
  },
  {
    title: 'download.cloud',
    link: null,
    instructions: 'download.cloud_instructions',
    onlyZH: true
  }
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

const openOldVersion = () => {
  window.open('https://pan.huang1111.cn/s/5XPkgIl', '_blank')
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
    position: relative;
    
    .faq-desc {
      color: var(--mdui-color-on-surface-variant);
      margin-top: 8px;
      opacity: 0.8;
    }
    
    .faq-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      color: rgb(var(--mdui-color-primary));
      opacity: 0.8;
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

.old-version-card {
  background-color: rgba(var(--mdui-color-primary-container), 0.2);
  border-radius: 12px;
  box-shadow: none;
  overflow: hidden;
  transition: all 0.3s var(--mdui-motion-easing-emphasized);
  width: 100%;
  
  &:hover {
    background-color: rgba(var(--mdui-color-primary-container), 0.32);
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    
    @media (min-width: 600px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    
    .text-content {
      flex: 1;
      
      .description {
        color: var(--mdui-color-on-surface-variant);
        margin-top: 8px;
      }
    }
    
    .mdui-button {
      min-width: 120px;
    }
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

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.3s ease;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.card-fade-enter-to,
.card-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
