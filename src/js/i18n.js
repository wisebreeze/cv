import { createI18n } from 'vue-i18n'
import en from './texts/en-US.json'
import zh from './texts/zh-CN.json'
import ko from './texts/ko-KR.json'

const normalizeLocale = (lang) => {
  return lang.toLowerCase().replace(/_/g, '-')
}

const getExactLocale = () => {
  const browserLocales = navigator.languages || [navigator.language || 'en-US']
  const supportedLocales = ['zh-CN', 'en-US', 'ko-KR']
  const normalizedBrowserLocales = browserLocales.map(normalizeLocale)
  for (const locale of supportedLocales) {
    const normalizedLocale = normalizeLocale(locale)
    if (normalizedBrowserLocales.includes(normalizedLocale)) {
      return locale
    }
  }
  const hasChinese = normalizedBrowserLocales.some(lang => lang.startsWith('zh'))
  const hasKorean = normalizedBrowserLocales.some(lang => lang.startsWith('ko'))
  if (hasChinese) return 'zh-CN'
  if (hasKorean) return 'ko-KR'
  return 'en-US'
}

const i18n = createI18n({
  legacy: false, // use Composition API mode
  locale: getExactLocale(), // Set the initial language automatically
  fallbackLocale: 'en-US', // Fallback language
  messages: {
    'en-US': en,
    'zh-CN': zh,
    'ko-KR': ko
  }
})

export default i18n