import 'mdui/mdui.css'
import "../css/style.scss"
import "../css/simpleCrop.scss"

import icon from "../image/icon.png"
document.querySelector("link[rel='icon']").href=icon
document.querySelector("link[rel='shortcut icon']").href=icon
document.querySelectorAll("meta[name='apple-touch-icon-precomposed']").forEach(e=>e.href=icon)

import { createApp } from 'vue'
import App from './routers/App'
import i18n from './i18n'
import router from './routers/index'
import * as mdui from 'mdui'
window.mdui = mdui

const app = createApp(App);
app.use(i18n).use(router).mount('#app');

// Prefetch route chunks on idle so the first navigation to each route is
// instant (chunks are already cached by the browser).
// Priority-based: routes related to the current page are prefetched first,
// then the rest in the background.
const routeModules = import.meta.glob(['./routers/*.vue', '!./routers/App.vue'])

// Map: current route prefix -> related route component paths to prefetch first.
// Derived from the actual navigation structure (Home -> Download/Custom/Group,
// Editor sidebar -> editor sub-pages, Toolbox -> toolbox sub-pages, etc.)
const priorityMap = {
  '/':            ['./routers/Download.vue', './routers/Custom.vue', './routers/Group.vue', './routers/FAQ.vue'],
  '/download':    ['./routers/Group.vue', './routers/FAQ.vue', './routers/Custom.vue', './routers/Home.vue'],
  '/custom':      ['./routers/Download.vue', './routers/Home.vue'],
  '/editor':      ['./routers/EditorMusic.vue', './routers/EditorBg.vue', './routers/EditorSettings.vue', './routers/EditorTheme.vue', './routers/EditorPanel.vue', './routers/EditorWord.vue', './routers/EditorSidebar.vue'],
  '/toolbox':     ['./routers/ToolboxUUID.vue', './routers/ToolboxEditor.vue', './routers/ToolboxPicture.vue', './routers/ToolboxCPS.vue', './routers/ToolboxStopWatch.vue', './routers/ToolboxUA.vue', './routers/ToolboxUnits.vue', './routers/ToolboxFunction.vue']
}

const prefetchByPriority = () => {
  const currentPath = router.currentRoute.value.path
  // Find the matching priority key (longest prefix match)
  const matchedKey = Object.keys(priorityMap)
    .filter(k => currentPath === k || currentPath.startsWith(k + '/') || (k === '/' && currentPath === '/'))
    .sort((a, b) => b.length - a.length)[0]

  const prioritized = matchedKey ? priorityMap[matchedKey] : []
  const prefetched = new Set()

  // Phase 1: prefetch priority routes immediately
  prioritized.forEach(path => {
    if (routeModules[path]) {
      prefetched.add(path)
      routeModules[path]().catch(() => {})
    }
  })

  // Phase 2: prefetch the rest after priority ones are kicked off
  Object.entries(routeModules).forEach(([path, load]) => {
    if (!prefetched.has(path)) {
      load().catch(() => {})
    }
  })
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(prefetchByPriority, { timeout: 4000 })
} else {
  setTimeout(prefetchByPriority, 2000)
}

// Re-evaluate priority when the route changes, so entering /editor or
// /toolbox triggers prefetching of their sub-pages ahead of idle time.
router.afterEach(() => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const currentPath = router.currentRoute.value.path
      const matchedKey = Object.keys(priorityMap)
        .filter(k => currentPath === k || currentPath.startsWith(k + '/') || (k === '/' && currentPath === '/'))
        .sort((a, b) => b.length - a.length)[0]
      if (matchedKey) {
        priorityMap[matchedKey].forEach(path => {
          if (routeModules[path]) routeModules[path]().catch(() => {})
        })
      }
    })
  }
})