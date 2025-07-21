<template>
  <div class="ns">
    <mdui-top-app-bar scroll-behavior="elevate" scroll-target="#content">
      <mdui-button-icon v-if="showBackBtn" @click="goBack">
        <ion-icon name="chevron-back-outline"/>
      </mdui-button-icon>
      <mdui-top-app-bar-title style="margin-left:8px">
        <router-link v-if="!showBackBtn" to="/" :style="{color: 'inherit','text-decoration': 'none'}">
          {{ title || $t('gui$packName') }}
        </router-link>
        <span v-if="showBackBtn">
          {{ $t('e$back') }}
        </span>
      </mdui-top-app-bar-title>
      
      <div style="flex-grow:1"/>
      
      <!-- 语言选择 -->
      <mdui-dropdown>
        <mdui-button-icon slot="trigger">
          <ion-icon name="language-outline"/>
        </mdui-button-icon>
        
        <mdui-menu ref="language" selects="single">
          <mdui-menu-item 
            value="en-US"
            @click="handleLanguageChange('en-US')"
          >English</mdui-menu-item>
          <mdui-menu-item
            value="zh-CN"
            @click="handleLanguageChange('zh-CN')"
          >简体中文</mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>

      <!-- 主题切换 -->
      <mdui-dropdown>
        <mdui-button-icon slot="trigger">
          <ion-icon :name="themeIcon"/>
        </mdui-button-icon>
        
        <mdui-menu ref="theme" selects="single">
          <mdui-menu-item 
            value="light"
            @click="handleThemeChange('light')"
          >{{ $t('gui$light') }}</mdui-menu-item>
          <mdui-menu-item
            value="dark"
            @click="handleThemeChange('dark')"
          >{{ $t('gui$dark') }}</mdui-menu-item>
          <mdui-divider />
          <mdui-menu-item
            value="auto"
            @click="handleThemeChange('auto')"
          >{{ $t('gui$system') }}</mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>
    </mdui-top-app-bar>
  </div>
</template>

<script>
export default {
  props: {
    title: String
  },
  computed: {
    themeIcon() {
      return this.theme === 'dark' || this.theme === 'auto' && this.systemDarkTheme ? 'moon-outline' : 'sunny-outline'
    }
  },
  data() {
    return {
      showBackBtn: false,
      systemDarkTheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
      theme: localStorage.getItem('themeType') || 'auto',
      language: this.getFormattedLanguage() || this.$i18n.locale || 'zh-CN'
    }
  },
  methods: {
    handleLanguageChange(lang) {
      this.language = lang
      localStorage.setItem('language', lang)
      this.$i18n.locale = lang
    },
    handleThemeChange(themeType) {
      this.theme = themeType
      localStorage.setItem('themeType', themeType)
      mdui.setTheme(themeType)
    },
    getFormattedLanguage() {
      const langCode = localStorage.getItem('language') || 'zh-CN'
      const parts = langCode.split('-')
      if (parts.length === 2) {
        parts[1] = parts[1].toUpperCase()
        return parts.join('-')
      }
      return langCode
    },
    observeMediaChange(mqList, listener) {
      let callback = () => {}
      if (mqList.addEventListener && mqList.removeEventListener) {
        mqList.addEventListener('change', listener)
        callback = () => {
          mqList.removeEventListener('change', listener)
        }
      } else if (mqList.addListener && mqList.removeListener) {
        mqList.addListener(listener)
        callback = () => {
          mqList.removeListener(listener)
        }
      }
      return callback
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    }
  },
  mounted() {
    const languageMenu = this.$refs.language
    const themeMenu = this.$refs.theme
    languageMenu.value = this.language
    themeMenu.value = this.theme
    mdui.setTheme(this.theme)
    this.$i18n.locale = this.language
    
    var mqList = window.matchMedia('(prefers-color-scheme: dark)');
    this.observeMediaChange(mqList, e => {
      this.systemDarkTheme = e.matches
    })

    this.showBackBtn = this.$route.meta ? this.$route.meta.i > 1 : false
  }
}
</script>