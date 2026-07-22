import { createRouter, createWebHistory } from 'vue-router'
import i18n from '../i18n'

const routes = [
  {
    path: '/main',
    name: 'Main',
    redirect: '/'
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('./Home'),
    meta: { i: 1 }
  },
  {
    path: '/custom',
    name: 'Custom',
    component: () => import('./Custom'),
    meta: { i: 2 }
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('./Download'),
    meta: { i: 2 }
  },
  {
    path: '/editor',
    name: "Editor",
    redirect: "/editor/home",
    component: () => import('./Editor'),
    children: [
      { path: "home", name: "EditorHome", component: () => import('./EditorSidebar'), meta: { i: 4 } },
      { path: "music", name: "MusicEditor", component: () => import('./EditorMusic'), meta: { i: 5 } },
      { path: "bg", name: "BgEditor", component: () => import('./EditorBg'), meta: { i: 5 } },
      { path: "settings", name: "SettingsEditor", component: () => import('./EditorSettings'), meta: { i: 5 } },
      { path: "panel", name: "PanelEditor", component: () => import('./EditorPanel'), meta: { i: 5 } },
      { path: "theme", name: "ThemeEditor", component: () => import('./EditorTheme'), meta: { i: 5 } },
      { path: "word", name: "WordEditor", component: () => import('./EditorWord'), meta: { i: 5 } }
    ],
    meta: { i: 3 }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('./FAQ'),
    meta: { i: 5 }
  },
  {
    path: '/group',
    name: 'Group',
    component: () => import('./Group'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/cps',
    name: 'CPS',
    component: () => import('./ToolboxCPS'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/editor',
    name: 'TextEditor',
    component: () => import('./ToolboxEditor'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/function',
    name: 'Function',
    component: () => import('./ToolboxFunction'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/picture',
    name: 'PictureEditor',
    component: () => import('./ToolboxPicture'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/stopwatch',
    name: 'StopWatch',
    component: () => import('./ToolboxStopWatch'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/ua',
    name: 'UA',
    component: () => import('./ToolboxUA'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/units',
    name: 'UintsConversion',
    component: () => import('./ToolboxUnits'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox/uuid',
    name: 'UUID',
    component: () => import('./ToolboxUUID'),
    meta: { i: 4 }
  },
  {
    path: '/toolbox',
    name: 'Toolbox',
    component: () => import('./Toolbox'),
    meta: { i: 3 }
  }
]

const markdownFiles = require.context(
  '@markdown',
  true,
  /\.md$/
)

markdownFiles.keys().forEach(filePath => {
  const fileName = filePath.replace(/^\.\/(.*)\.md$/, '$1')
  routes.push({
    path: `/${fileName}`,
    name: fileName.replace(/\//g, '-'),
    component: () => import(`@markdown/${fileName}.md`),
    meta: { i: 5 }
  })
})

routes.push({
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('./NotFound'),
  meta: { i: 0 }
})

const getBasePath = () => {
  return window.location.href.startsWith("https://wisebreeze.github.io") ? "/cv" : "/"
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const langCode = localStorage.getItem('language') || navigator.language || 'en-US'
  const parts = langCode.split('-')
  let currentLocale = langCode
  if (parts.length === 2) {
    parts[1] = parts[1].toUpperCase()
    currentLocale = parts.join('-')
  }
  // Map locales without dedicated markdown to an available markdown locale
  const markdownLocaleMap = {
    'zh-TW': 'zh-CN',
    'ko-KR': 'en-US'
  }
  const markdownLocale = markdownLocaleMap[currentLocale] || currentLocale
  const pathLangMatch = to.path.match(/^\/([a-z]{2}-[A-Z]{2})(\/|$)/)
  const pathLang = pathLangMatch ? pathLangMatch[1] : null
  const rawPath = pathLang ? to.path.replace(`/${pathLang}`, '') : to.path
  if (pathLang && pathLang !== currentLocale) {
    const newPath = `/${currentLocale}${rawPath}`
    console.log(`Redirecting from ${to.path} to ${newPath}`)
    return next(newPath)
  }
  const fallbackLocale = i18n.global.fallbackLocale.value
  const path = to.path.slice(1)
  let targetMarkdown = markdownFiles.keys().find(e => {
    const mdPath = e.substring(1).replace('.md', '')
    const filePath = path.replace(/^\/[a-z]{2}-[A-Z]{2}\//, '')
    return markdownLocale ? mdPath === '/'+markdownLocale+'/'+filePath : mdPath === '/'+fallbackLocale+'/'+filePath
  })
  targetMarkdown = targetMarkdown ? targetMarkdown.substring(1).replace('.md', '') : targetMarkdown
  if (targetMarkdown) {
    return router.push(targetMarkdown)
  }
  next()
})

export default router