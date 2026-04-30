<template>
<div>
  <Topbar />
  <div id="content" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <h1 class="ns title">{{ t('faq.title') }}</h1>
    
    <div class="search-container">
      <mdui-text-field 
        class="search"
        :placeholder="t('faq.searchPlaceholder')" 
        variant="filled"
        v-model="searchQuery"
        clearable
      >
        <mdui-icon-search slot="prefix"></mdui-icon-search>
      </mdui-text-field>
    </div>

    <div v-if="filteredQuestions.length === 0" class="no-results">
      {{ t('faq.noResults') }}
    </div>

    <div class="question-list">
      <div 
        v-for="(item, index) in filteredQuestions" 
        :key="index"
        class="question-item"
      >
        <div class="question-header" @click="toggleQuestion(index)">
          <div class="question-text" v-html="highlightText(parseMarkdown(item.q))"></div>
          <ion-icon 
            name="chevron-down" 
            class="arrow"
            :style="{ transform: expandedItems[index] ? 'rotate(180deg)' : 'rotate(0deg)' }"
          ></ion-icon>
        </div>
        <transition name="slide">
          <div v-if="expandedItems[index]" class="answer" v-html="highlightText(parseMarkdown(item.a))"></div>
        </transition>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()

const questions = ref([
  {
    q: t('faq.q1'),
    a: t('faq.a1')
  },
  {
    q: t('faq.q2'),
    a: t('faq.a2')
  },
  {
    q: t('faq.q3'),
    a: t('faq.a3')
  },
  {
    q: t('faq.q4'),
    a: t('faq.a4')
  },
  {
    q: t('faq.q5'),
    a: t('faq.a5')
  },
  {
    q: t('faq.q6'),
    a: t('faq.a6')
  },
  {
    q: t('faq.q7'),
    a: t('faq.a7')
  },
  {
    q: t('faq.q8'),
    a: t('faq.a8')
  },
  {
    q: t('faq.q9'),
    a: t('faq.a9')
  },
  {
    q: t('faq.q10'),
    a: t('faq.a10')
  },
  {
    q: t('faq.q11'),
    a: t('faq.a11')
  },
  {
    q: t('faq.q12'),
    a: t('faq.a12')
  }
])

const searchQuery = ref('')
const expandedItems = ref(questions.value.map(() => false))

const filteredQuestions = computed(() => {
  if (!searchQuery.value) return questions.value
  const query = searchQuery.value.toLowerCase()
  return questions.value.filter(item => 
    item.q.toLowerCase().includes(query) || 
    item.a.toLowerCase().includes(query)
  )
})

watch(searchQuery, (newVal) => {
  if (newVal) {
    expandedItems.value = filteredQuestions.value.map(() => true)
  } else {
    expandedItems.value = filteredQuestions.value.map(() => false)
  }
})

function toggleQuestion(index) {
  expandedItems.value[index] = !expandedItems.value[index]
}

function parseMarkdown(text) {
  let parsed = text.replace(/\\([*_\\[\]])/g, '$1')
  // 链接
  parsed = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  // 粗体
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<em>$1</em>')
  // 斜体
  parsed = parsed.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  // 代码块
  parsed = parsed.replace(/`([^\`]+)`/g, '<code>$1</code>')
  parsed = parsed.replace(/\n/g, '<br>')
  return parsed
}

function highlightText(text) {
  if (!searchQuery.value) return text
  const query = searchQuery.value
  const regex = new RegExp(query, 'gi')
  return text.replace(regex, match => `<strong>${match}</strong>`)
}
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important;
  padding: 16px;
  background: rgb(var(--mdui-color-surface));
  color: rgb(var(--mdui-color-on-surface));
  min-height: 100%;

  .title {
    font-size: 2rem;
    font-weight: 400;
    margin: 24px 0;
    // color: rgb(var(--mdui-color-primary));
  }

  .search-container {
    margin-bottom: 24px;
  }

  .no-results {
    text-align: center;
    padding: 24px;
    color: rgb(var(--mdui-color-on-surface-variant));
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .question-item {
    background: rgb(var(--mdui-color-surface-container));
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }

  .question-text {
    flex: 1;
    font-weight: 500;
    font-size: 1rem;
    word-break: break-word;
  }

  .arrow {
    transition: transform 0.3s ease;
    color: rgb(var(--mdui-color-on-surface-variant));
    min-width: 24px;
  }

  .answer {
    padding: 0 16px 16px 16px;
    color: rgb(var(--mdui-color-on-surface-variant));
    line-height: 1.6;
    white-space: pre-line;
    word-break: break-word;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
    overflow: hidden;
  }

  .slide-enter-from,
  .slide-leave-to {
    max-height: 0;
    opacity: 0;
    padding-bottom: 0;
  }
}

:deep(a[href]) {
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

:deep(strong) {
  font-weight: bold;
}

:deep(em) {
  font-style: italic;
}

:deep(code) {
  font-family: monospace;
  background: rgb(var(--mdui-color-surface-variant));
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>