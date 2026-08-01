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
        <span @click.prevent="handleTitleClick" v-if="showBackBtn">
          {{ pageTitle || $t('e$back') }}
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
            value="system"
            @click="handleLanguageChange('system')"
          >{{ $t('gui$system') }}</mdui-menu-item>
          <mdui-divider />
          <mdui-menu-item
            value="en-US"
            @click="handleLanguageChange('en-US')"
          >English</mdui-menu-item>
          <mdui-menu-item
            value="zh-CN"
            @click="handleLanguageChange('zh-CN')"
          >简体中文</mdui-menu-item>
          <mdui-menu-item
            value="zh-TW"
            @click="handleLanguageChange('zh-TW')"
          >繁體中文</mdui-menu-item>
          <mdui-menu-item
            value="ko-KR"
            @click="handleLanguageChange('ko-KR')"
          >한국어</mdui-menu-item>
          <mdui-menu-item
            value="ja-JP"
            @click="handleLanguageChange('ja-JP')"
          >日本語</mdui-menu-item>
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
    },
    routeTitleMap() {
      return {
        'Custom': 'custom$title',
        'Download': 'gui$download',
        'EditorHome': 'editor.empty_title',
        'MusicEditor': 'editor.music.music',
        'BgEditor': 'bg$title',
        'SettingsEditor': 'editor.settings.title',
        'PanelEditor': 'editor.panel.title',
        'ThemeEditor': 'theme$title',
        'WordEditor': 'editor.word.screenTitle',
        'FAQ': 'main.faqTitle',
        'Group': 'main.groupChat',
        'Toolbox': 'toolbox.all',
        'CPS': 'toolbox.cps.cpsTest',
        'TextEditor': 'toolbox.editor.untitled',
        'Function': 'toolbox.all',
        'PictureEditor': 'toolbox.image',
        'StopWatch': 'toolbox.all',
        'UA': 'toolbox.all',
        'UintsConversion': 'toolbox.all',
        'UUID': 'uuid.output',
        'NotFound': 'e$title'
      }
    },
    pageTitle() {
      const titleKey = this.routeTitleMap[this.$route.name]
      return titleKey ? this.$t(titleKey) : ''
    }
  },
  data() {
    return {
      showBackBtn: false,
      clickCount: 0,
      clickTimer: null,
      systemDarkTheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
      theme: localStorage.getItem('themeType') || 'auto',
      language: this.getFormattedLanguage() || this.$i18n.locale || 'system'
    }
  },
  methods: {
    handleTitleClick() {
      if (this.clickTimer) {
        clearTimeout(this.clickTimer)
      }
      this.clickCount++;
      if (this.clickCount >= 3) {
        this.executeDebugScript()
        this.resetClickCounter()
        return
      }
      this.clickTimer = setTimeout(() => {
        this.resetClickCounter()
      }, 1500)
    },
    executeDebugScript() {
      if (window.eruda && window.eruda._isInit) return
      const script = document.createElement('script')
      script.src = "https://cdn.jsdelivr.net/npm/eruda"
      document.body.appendChild(script)
      script.onload = () => {
        if (typeof eruda !== 'undefined' && !eruda._isInit) {
          eruda.init()
          eruda._isInit = true
        }
      }
      script.onerror = () => {
        console.error('Eruda failed to load');
        this.resetClickCounter();
      }
    },
    resetClickCounter() {
      this.clickCount = 0
      if (this.clickTimer) {
        clearTimeout(this.clickTimer)
        this.clickTimer = null
      }
    },
    handleLanguageChange(lang) {
      this.language = lang
      if (lang === 'system') {
        localStorage.removeItem('language')
        this.$i18n.locale = this.resolveSystemLocale()
        if ('addEventListener' in window) {
          window.addEventListener('languagechange', this.onSystemLanguageChange)
        }
      } else {
        localStorage.setItem('language', lang)
        this.$i18n.locale = lang
        if ('removeEventListener' in window) {
          window.removeEventListener('languagechange', this.onSystemLanguageChange)
        }
      }
    },
    resolveSystemLocale() {
      const supported = ['zh-CN', 'zh-TW', 'en-US', 'ko-KR', 'ja-JP']
      const raw = (navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || 'en-US']
      ).map(s => String(s).replace('_', '-'))
      for (const candidate of raw) {
        if (supported.includes(candidate)) return candidate
      }
      for (const candidate of raw) {
        const lang = candidate.split('-')[0].toLowerCase()
        if (lang === 'zh') {
          const region = candidate.split('-')[1]?.toUpperCase()
          if (region === 'TW' || region === 'HK' || region === 'MO' || region === 'HANT') {
            return 'zh-TW'
          }
          return 'zh-CN'
        }
        const exact = supported.find(s => s.toLowerCase().startsWith(lang + '-'))
        if (exact) return exact
      }
      return 'en-US'
    },
    handleThemeChange(themeType) {
      this.theme = themeType
      localStorage.setItem('themeType', themeType)
      mdui.setTheme(themeType)
    },
    getFormattedLanguage() {
      const langCode = localStorage.getItem('language')
      if (!langCode) return null
      
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
    },
    onSystemLanguageChange() {
      if (this.language === 'system') {
        this.$i18n.locale = this.resolveSystemLocale()
      }
    },
    updateDocumentTitle() {
      const packName = this.$t('gui$packName')
      const pageTitle = this.pageTitle
      document.title = pageTitle ? `${pageTitle} - ${packName}` : packName
    }
  },
  watch: {
    '$route'() {
      this.showBackBtn = this.$route.meta ? this.$route.meta.i > 1 : false
      this.updateDocumentTitle()
    },
    language() {
      this.updateDocumentTitle()
    }
  },
  mounted() {
    const languageMenu = this.$refs.language
    const themeMenu = this.$refs.theme
    languageMenu.value = this.language
    themeMenu.value = this.theme
    mdui.setTheme(this.theme)
    if (this.language === 'system') {
      this.$i18n.locale = this.resolveSystemLocale()
    } else {
      this.$i18n.locale = this.language
    }

    this.observeMediaChange(window.matchMedia('(prefers-color-scheme: dark)'), e => {
      this.systemDarkTheme = e.matches
    })

    if (this.language === 'system' && 'addEventListener' in window) {
      window.addEventListener('languagechange', this.onSystemLanguageChange)
    }

    this.showBackBtn = this.$route.meta ? this.$route.meta.i > 1 : false
    this.updateDocumentTitle()
  },
  beforeDestroy() {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer)
    }
    if (this.language === 'system' && 'removeEventListener' in window) {
      window.removeEventListener('languagechange', this.onSystemLanguageChange)
    }
  }
}
</script>