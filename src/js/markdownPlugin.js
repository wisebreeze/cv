import { marked } from 'marked'
import frontmatter from 'front-matter'

function generateGitHubHeadingId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateSFC(source) {
  const { body } = frontmatter(source)
  const initialHtml = marked.parse(body)

  const template = `<template>
  <div>
    <Topbar />
    <div id="content">
      <div ref="contentRef" class="markdown-content" v-html="processedContent"></div>
    </div>
  </div>
</template>

<script setup>
import Topbar from '@/js/components/Topbar.vue'
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { locale } = useI18n()
const router = useRouter()
const contentRef = ref(null)
const processedContent = ref('')

function generateGitHubHeadingId(text) {
  return text
    .toLowerCase()
    .replace(/[^\\w\\u4e00-\\u9fa5\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function processHtmlContent(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.forEach(heading => {
    const text = heading.textContent.trim()
    if (text) {
      heading.id = generateGitHubHeadingId(text)
    }
  })

  const links = doc.querySelectorAll('a[href^="#"]')
  links.forEach(link => {
    const href = link.getAttribute('href').substring(1)
    if (href) {
      link.href = \`#\${generateGitHubHeadingId(href)}\`
    }
  })

  return doc.body.innerHTML
}

function smoothScrollToElement(element) {
  if (!element) return

  const topbarHeight = document.querySelector('topbar')?.offsetHeight || 64
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - topbarHeight

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  })
}

const handleAnchorClick = (e) => {
  if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
    e.preventDefault()
    const id = e.target.getAttribute('href').substring(1)
    if (!id) return

    const selector = \`[id="\${id}"]\`
    const targets = contentRef.value?.querySelectorAll(selector) || []

    let closestTarget = null
    let minDistance = Infinity

    targets.forEach(target => {
      const rect = target.getBoundingClientRect()
      if (rect.height > 0) {
        const distance = Math.abs(rect.top)
        if (distance < minDistance) {
          minDistance = distance
          closestTarget = target
        }
      }
    })

    if (closestTarget) {
      smoothScrollToElement(closestTarget)
      history.pushState(null, null, \`#\${id}\`)
    }
  }
}

function initContent() {
  const html = ${JSON.stringify(initialHtml)}
  processedContent.value = processHtmlContent(html)

  if (contentRef.value) {
    contentRef.value.addEventListener('click', handleAnchorClick)
  }

  if (window.location.hash) {
    const id = window.location.hash.substring(1)
    if (id) {
      nextTick(() => {
        const selector = \`[id="\${id}"]\`
        const target = contentRef.value?.querySelector(selector)
        if (target) {
          setTimeout(() => smoothScrollToElement(target), 100)
        }
      })
    }
  }
}

watch(locale, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    router.replace({
      path: router.currentRoute.value.path,
      query: { ...router.currentRoute.value.query, lang: Date.now() }
    })
  }
})

onMounted(() => {
  const routeLang = router.currentRoute.value.query.lang
  if (routeLang) {
    initContent()
  } else {
    initContent()
  }
})

onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('click', handleAnchorClick)
  }
})
</script>

<style scoped lang="scss">
@mixin heading-base {
  position: relative;
  scroll-margin-top: 80px;

  &:hover::after {
    content: '#';
    position: absolute;
    right: 100%;
    margin-right: 8px;
    opacity: 0.5;
    font-size: 0.8em;
  }
}

#content {
  box-sizing: border-box;
  height: var(--window-height);
  max-width: 800px;
  margin: 0 auto;
  overflow-y: auto;
  padding-top: 64px !important;
  padding: 32px;
  color: rgb(var(--mdui-color-on-surface));
  background-color: rgb(var(--mdui-color-surface));
  line-height: 1.6;
}

.markdown-content {
  :deep(h1) {
    font-size: 2.2rem;
    font-weight: 400;
    margin: 2rem 0 1.5rem;
    color: rgb(var(--mdui-color-on-surface));
    border-bottom: 1px solid rgb(var(--mdui-color-outline));
    padding-bottom: 0.5rem;
    @include heading-base;
  }

  :deep(h2) {
    font-size: 1.8rem;
    font-weight: 400;
    margin: 1.8rem 0 1.2rem;
    color: rgb(var(--mdui-color-on-surface));
    @include heading-base;
  }

  :deep(h3) {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 1.5rem 0 1rem;
    color: rgb(var(--mdui-color-on-surface-variant));
    @include heading-base;
  }

  :deep(h4),
  :deep(h5),
  :deep(h6) {
    @include heading-base;
  }

  :deep(p) {
    margin: 1rem 0;
    font-size: 1rem;
  }

  :deep(a) {
    color: rgb(var(--mdui-color-primary));
    text-decoration: none;
    position: relative;
    transition: color 0.2s ease;

    &:hover {
      color: rgb(var(--mdui-color-primary-hover));
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: rgb(var(--mdui-color-primary));
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.2s ease;
    }

    &:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  :deep(hr) {
    border: none;
    height: 1px;
    background-color: rgb(var(--mdui-color-outline));
    margin: 2rem 0;
  }

  :deep(blockquote) {
    border-left: 4px solid rgb(var(--mdui-color-primary));
    margin: 1.5rem 0;
    padding: 0.5rem 1rem;
    background-color: rgb(var(--mdui-color-surface-container-low));
    border-radius: 0 8px 8px 0;
    color: rgb(var(--mdui-color-on-surface-variant));

    p {
      margin: 0.5rem 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 1rem 0;
    padding-left: 2rem;

    li {
      margin: 0.5rem 0;
      padding-left: 0.5rem;
    }
  }

  :deep(ul) {
    list-style-type: none;

    li::before {
      content: "•";
      color: rgb(var(--mdui-color-primary));
      display: inline-block;
      width: 1em;
      margin-left: -1em;
    }
  }

  :deep(ol) {
    counter-reset: list-counter;
    list-style-type: none;

    li {
      counter-increment: list-counter;
      position: relative;

      &::before {
        content: counter(list-counter) ".";
        color: rgb(var(--mdui-color-primary));
        position: absolute;
        left: -1.5em;
        width: 1.5em;
        text-align: right;
      }
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid rgb(var(--mdui-color-outline));
    }

    th {
      background-color: rgb(var(--mdui-color-surface-container));
      color: rgb(var(--mdui-color-on-surface));
      font-weight: 500;
    }

    tr {
      background-color: rgb(var(--mdui-color-surface));

      &:hover {
        background-color: rgb(var(--mdui-color-surface-container-low));
      }
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  :deep(code) {
    font-family: 'Roboto Mono', monospace;
    background-color: rgb(var(--mdui-color-surface-container-highest));
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }

  :deep(pre) {
    background-color: rgb(var(--mdui-color-surface-container-highest));
    border-radius: 12px;
    padding: 1rem;
    overflow-x: auto;
    margin: 1.5rem 0;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }

  :deep(mdui-button),
  :deep(ion-icon) {
    display: inline-block;
  }
}
</style>`

  return template
}

export default function markdownPlugin() {
  let vueTransformHandler = null

  return {
    name: 'cubevisage-markdown',
    enforce: 'pre',
    configResolved(config) {
      const vuePlugin = config.plugins.find(p => p.name === 'vite:vue')
      const t = vuePlugin?.transform
      if (t && typeof t === 'object' && typeof t.handler === 'function') {
        vueTransformHandler = t.handler
      } else if (typeof t === 'function') {
        vueTransformHandler = t
      }
    },
    async transform(source, id) {
      if (!id.endsWith('.md')) return null
      const sfc = generateSFC(source)
      const result = await vueTransformHandler?.call(this, sfc, `${id}.vue`)
      return result
    }
  }
}
