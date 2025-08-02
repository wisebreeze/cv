<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <mdui-layout-main-content>
      <div class="community-container">
        <mdui-card class="community-card" v-for="(community, index) in communities" :key="community.id" 
                   :style="{ '--delay': index * 0.1 + 's' }"
                   @click="handleCommunityClick(community)">
          <div class="card-content">
            <div class="icon-wrapper" v-html="community.icon"></div>
            <div class="text-content">
              <div class="title">
                {{ t(community.name) }}
                <mdui-badge v-if="community.full" class="full-badge">{{ t('full') }}</mdui-badge>
              </div>
              <div class="description">{{ t(community.description) }}</div>
            </div>
            <ion-icon name="chevron-forward-outline" class="arrow"></ion-icon>
          </div>
        </mdui-card>
      </div>
    </mdui-layout-main-content>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar'

const { t } = useI18n()
const router = useRouter()

const communities = ref([
  {
    id: 'discord',
    name: 'discord',
    description: 'discord_desc',
    icon: discordIcon,
    link: 'https://discord.gg/zYWvyhXsAq',
    full: false
  },
  {
    id: 'qq_channel',
    name: 'qq_channel',
    description: 'qq_channel_desc',
    icon: qqChannelIcon,
    link: 'https://pd.qq.com/s/233egiixi',
    full: false
  },
  {
    id: 'qq_group4',
    name: 'qq_group4',
    description: 'qq_group4_desc',
    icon: qqIcon,
    link: 'https://qm.qq.com/q/1039970716',
    full: false
  },
  {
    id: 'qq_group3',
    name: 'qq_group3',
    description: 'qq_group3_desc',
    icon: qqIcon,
    link: '#',
    full: true
  },
  {
    id: 'qq_group2',
    name: 'qq_group2',
    description: 'qq_group2_desc',
    icon: qqIcon,
    link: '#',
    full: true
  },
  {
    id: 'qq_group1',
    name: 'qq_group1',
    description: 'qq_group1_desc',
    icon: qqIcon,
    link: '#',
    full: true
  }
])

const discordIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36">
  <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
</svg>`

const qqIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#12B7F5" d="M3.18,13.54C3.76,12.16 4.57,11.14 5.17,10.92C5.16,10.12 5.31,9.62 5.56,9.22C5.56,9.19 5.5,8.86 5.72,8.45C5.87,4.85 8.21,2 12,2C15.79,2 18.13,4.85 18.28,8.45C18.5,8.86 18.44,9.19 18.44,9.22C18.69,9.62 18.84,10.12 18.83,10.92C19.43,11.14 20.24,12.16 20.82,13.55C21.57,15.31 21.69,17 21.09,17.3C20.68,17.5 20.03,17 19.42,16.12C19.18,17.1 18.58,18 17.73,18.71C18.63,19.04 19.21,19.58 19.21,20.19C19.21,21.19 17.63,22 15.69,22C13.93,22 12.5,21.34 12.21,20.5H11.79C11.5,21.34 10.07,22 8.31,22C6.37,22 4.79,21.19 4.79,20.19C4.79,19.58 5.37,19.04 6.27,18.71C5.42,18 4.82,17.1 4.58,16.12C3.97,17 3.32,17.5 2.91,17.3C2.31,17 2.43,15.31 3.18,13.54Z" />
</svg>`

const qqChannelIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#12B7F5" d="M3.18,13.54C3.76,12.16 4.57,11.14 5.17,10.92C5.16,10.12 5.31,9.62 5.56,9.22C5.56,9.19 5.5,8.86 5.72,8.45C5.87,4.85 8.21,2 12,2C15.79,2 18.13,4.85 18.28,8.45C18.5,8.86 18.44,9.19 18.44,9.22C18.69,9.62 18.84,10.12 18.83,10.92C19.43,11.14 20.24,12.16 20.82,13.55C21.57,15.31 21.69,17 21.09,17.3C20.68,17.5 20.03,17 19.42,16.12C19.18,17.1 18.58,18 17.73,18.71C18.63,19.04 19.21,19.58 19.21,20.19C19.21,21.19 17.63,22 15.69,22C13.93,22 12.5,21.34 12.21,20.5H11.79C11.5,21.34 10.07,22 8.31,22C6.37,22 4.79,21.19 4.79,20.19C4.79,19.58 5.37,19.04 6.27,18.71C5.42,18 4.82,17.1 4.58,16.12C3.97,17 3.32,17.5 2.91,17.3C2.31,17 2.43,15.31 3.18,13.54Z" />
</svg>`

const handleCommunityClick = (community) => {
  if (!community.full && community.link && community.link !== '#') {
    window.open(community.link, '_blank')
  }
}
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important;
  background-color: var(--mdui-color-surface-container-lowest);
}

.community-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px 80px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 600px) {
    padding: 32px 24px;
    gap: 20px;
  }
}

.community-card {
  border-radius: 12px;
  transition: all 0.3s var(--mdui-motion-easing-emphasized);
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.5s var(--mdui-motion-easing-emphasized) forwards;
  animation-delay: var(--delay);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--mdui-elevation-level3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  cursor: pointer;
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--mdui-color-surface-container);
    flex-shrink: 0;
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
  
  .text-content {
    flex: 1;
    min-width: 0;
    
    .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--mdui-color-on-surface);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .description {
      font-size: 14px;
      color: var(--mdui-color-on-surface-variant);
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .arrow {
    color: var(--mdui-color-on-surface-variant);
    flex-shrink: 0;
    font-size: 20px;
  }
}

.full-badge {
  background-color: var(--mdui-color-secondary-container);
  color: var(--mdui-color-on-secondary-container);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
}

@keyframes fadeInUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>