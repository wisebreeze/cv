import { createI18n } from 'vue-i18n'
import en from './texts/en-US.json5'
import zh from './texts/zh-CN.json5'
import zhTW from './texts/zh-TW.json5'
import ko from './texts/ko-KR.json5'
import ja from './texts/ja-JP.json5'

const normalizeLocale = (lang) => {
  return lang.toLowerCase().replace(/_/g, '-')
}

const getExactLocale = () => {
  const browserLocales = navigator.languages || [navigator.language || 'en-US']
  const supportedLocales = ['zh-CN', 'zh-TW', 'en-US', 'ko-KR', 'ja-JP']
  const normalizedBrowserLocales = browserLocales.map(normalizeLocale)
  for (const locale of supportedLocales) {
    const normalizedLocale = normalizeLocale(locale)
    if (normalizedBrowserLocales.includes(normalizedLocale)) {
      return locale
    }
  }
  for (const lang of normalizedBrowserLocales) {
    if (lang.startsWith('zh')) {
      const region = lang.split('-')[1]
      if (region === 'tw' || region === 'hk' || region === 'mo' || region === 'hant') {
        return 'zh-TW'
      }
      return 'zh-CN'
    }
    if (lang.startsWith('ko')) return 'ko-KR'
    if (lang.startsWith('ja')) return 'ja-JP'
  }
  return 'en-US'
}

const i18n = createI18n({
  legacy: false, // use Composition API mode
  locale: getExactLocale(), // Set the initial language automatically
  fallbackLocale: 'en-US', // Fallback language
  messages: {
    'en-US': en,
    'zh-CN': zh,
    'zh-TW': zhTW,
    'ko-KR': ko,
    'ja-JP': ja
  }
})

export default i18n