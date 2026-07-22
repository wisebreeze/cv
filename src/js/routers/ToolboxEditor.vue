<template>
<div :style="cssVars">
  <Topbar />
  <div id="content">
    <div class="custom-toolbar">
      <div class="toolbar-left">
        <div class="file-info">
          <div class="filename">{{ fileName }}</div>
          <div class="file-description">{{ fileDescription }}</div>
        </div>
      </div>
      
      <div class="toolbar-right">
        <mdui-button-icon @click="undo">
          <ion-icon name="arrow-undo"></ion-icon>
        </mdui-button-icon>
        <mdui-button-icon @click="redo">
          <ion-icon name="arrow-redo"></ion-icon>
        </mdui-button-icon>
        <mdui-button-icon @click.stop="toggleMenu($event)">
          <ion-icon name="ellipsis-vertical"></ion-icon>
        </mdui-button-icon>
        <transition name="menu">
          <div 
            v-if="showMenu" 
            class="custom-menu"
            ref="menuRef"
            :style="{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`
            }"
            @click.stop
          >
            <div class="menu-item" @click.stop="handleMenuItemClick(downloadFile)">{{ t('toolbox.editor.download') }}</div>
            <div class="menu-item" @click.stop="handleMenuItemClick(newFile)">{{ t('toolbox.editor.new') }}</div>
            <div class="menu-item" @click.stop="handleMenuItemClick(importFile)">{{ t('toolbox.editor.import') }}</div>
            <div class="menu-item" @click.stop="handleMenuItemClick(toggleSearch)">{{ t('toolbox.editor.search') }}</div>
            <div class="menu-item" @click.stop="handleMenuItemClick(showTextStats)">{{ t('toolbox.editor.stats.menu') }}</div>
          </div>
        </transition>
      </div>
    </div>
    
    <div class="editor-wrapper">
      <div class="line-numbers" ref="lineNumbersRef" @scroll="syncScroll($event, true)">
        <div 
          v-for="n in lineNumbers" 
          :key="n" 
          :class="['line-number', { selected: selectedLines.includes(n), 'current-line': currentLineNumber === n }]"
        >{{ n }}</div>
      </div>
      <div 
        ref="editor"
        class="editor-lines"
        @click="handleEditorClick"
        @scroll="syncScroll($event, false)"
      >
        <div 
          ref="editorContent"
          class="editor-content"
          contenteditable="true"
          @input="handleContentInput"
          @keydown="handleContentKeydown"
          @compositionstart="isComposing = true"
          @compositionend="handleCompositionEnd"
          @focus="updateCurrentLine"
          @keyup="updateCurrentLine"
          @click="updateCurrentLine"
        >
          <div 
            v-for="(line, index) in lines" 
            :key="index"
            class="editor-line"
            :data-line="index"
          >{{ line }}</div>
          <div v-if="lines.length === 0" class="editor-line" data-line="0">&nbsp;</div>
        </div>
        <div class="line-highlights">
          <div 
            v-for="n in lineNumbers" 
            :key="'highlight-'+n"
            class="highlight-line"
            :class="{ 
              selected: selectedLines.includes(n), 
              'current-line': currentLineNumber === n 
            }"
            :style="{ top: `${(n-1) * 1.5}em` }"
        /></div>
      </div>
    </div>

    <transition name="alpha">
      <div v-if="showSearch" class="search-container">
        <div class="search-controls">
          <div class="search-left-buttons">
            <mdui-button-icon @click="closeSearch">
              <ion-icon name="close"></ion-icon>
            </mdui-button-icon>
            <mdui-button-icon @click="toggleReplace">
              <ion-icon name="swap-horizontal"></ion-icon>
            </mdui-button-icon>
            <mdui-button-icon @click="toggleRegex">
              <ion-icon name="code-slash"></ion-icon>
            </mdui-button-icon>
          </div>
          <div class="search-right-buttons">
            <mdui-button-icon @click="findPrev">
              <ion-icon name="chevron-up"></ion-icon>
            </mdui-button-icon>
            <mdui-button-icon @click="findNext">
              <ion-icon name="chevron-down"></ion-icon>
            </mdui-button-icon>
          </div>
        </div>
        <textarea
          v-model="searchQuery"
          class="search-input"
          placeholder="Search"
          rows="1"
          @keydown.enter="handleSearchEnter"
        ></textarea>
        <transition name="alpha">
          <textarea
            v-if="showReplace"
            v-model="replaceQuery"
            class="replace-input"
            placeholder="Replace"
            rows="1"
          ></textarea>
        </transition>
      </div>
    </transition>

    <mdui-dialog :open="showStatsDialog" @close="showStatsDialog = false">
      <div class="stats-dialog">
        <h3>{{ t('toolbox.editor.stats.title') }}</h3>
        <div class="stats-grid">
          <div>{{ t('toolbox.editor.stats.characters') }}</div>
          <div>{{ stats.characters }}</div>
          
          <div>{{ t('toolbox.editor.stats.words') }}</div>
          <div>{{ stats.words }}</div>
          
          <div>{{ t('toolbox.editor.stats.lines') }}</div>
          <div>{{ stats.lines }}</div>
          
          <div>{{ t('toolbox.editor.stats.symbols') }}</div>
          <div>{{ stats.symbols }}</div>
        </div>
      </div>
      <mdui-button slot="action" @click="showStatsDialog = false">
        {{ t('toolbox.editor.stats.close') }}
      </mdui-button>
    </mdui-dialog>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'

const { t } = useI18n()

const fileName = ref(`${t('toolbox.editor.untitled')}.txt`)
const fileDescription = ref('UTF-8')
const editor = ref(null)
const toolbarRight = ref(null)
const lineElements = ref([])
const isComposing = ref(false)
const selectedLines = ref([])
const contentHistory = ref([])
const historyIndex = ref(-1)
const lines = ref([''])
const selectionStart = ref(-1)
const menuPosition = ref({ x: 0, y: 0 })
const showMenu = ref(false)
const menuRef = ref(null)
const lineNumbersRef = ref(null)

const editorContent = ref(null)
const currentLineNumber = ref(1)
const cursorPosition = ref({line: 0, ch: 0})

const showSearch = ref(false)
const searchQuery = ref('')
const replaceQuery = ref('')
const showReplace = ref(false)
const useRegex = ref(false)
const showToast = ref(false)
const lastMatchIndex = ref(-1)
const currentMatch = ref(null)
const matches = ref([])
const currentMatchIndex = ref(-1)
const toastMessage = ref('')

const showStatsDialog = ref(false)
const stats = ref({
  characters: 0,
  words: 0,
  lines: 0,
  symbols: 0
})

const mergedContent = computed(() => lines.value.join('\n'))

const lineNumbers = computed(() => {
  return Array.from({length: lines.value.length}, (_, i) => i + 1)
})

const lineNumbersWidth = computed(() => {
  const digits = String(lineNumbers.value.length).length
  return `${Math.max(30, digits * 10 + 10)}px`
})

const cssVars = computed(() => ({
  '--line-numbers-width': lineNumbersWidth.value
}))

function toggleMenu(e) {
  if (showMenu.value) {
    closeMenu()
    return
  }
  const clickX = e.clientX
  const clickY = e.clientY
  showMenu.value = true
  nextTick(() => {
    if (!menuRef.value) return 
    const menuWidth = menuRef.value.offsetWidth
    const menuHeight = menuRef.value.offsetHeight
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    let finalX = clickX
    let finalY = clickY
    if (clickX + menuWidth > windowWidth) {
      finalX = windowWidth - menuWidth - 5
    }
    if (clickY + menuHeight > windowHeight) {
      finalY = windowHeight - menuHeight - 5
    }
    menuPosition.value = {
      x: Math.max(5, finalX),
      y: Math.max(5, finalY)
    }
  })
  e.stopPropagation()
}

function handleMenuItemClick(action) {
  action()
  closeMenu()
}

function closeMenu() {
  showMenu.value = false
}

function showTextStats() {
  const content = mergedContent.value
  stats.value = {
    characters: content.length,
    words: content.trim() ? content.split(/\s+/).length : 0,
    lines: lines.value.length,
    symbols: (content.match(/[^\w\s]/g) || []).length
  }
  showStatsDialog.value = true
}

function initEditor() {
  lines.value = ['']
  contentHistory.value = [['']]
  historyIndex.value = 0
}

function handleCompositionEnd() {
  isComposing.value = false
  saveToHistory([...lines.value])
}

function saveToHistory(newLines) {
  if (historyIndex.value < contentHistory.value.length - 1) {
    contentHistory.value = contentHistory.value.slice(0, historyIndex.value + 1)
  }
  contentHistory.value.push([...newLines])
  historyIndex.value++
}

function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    restoreContent()
  }
}

function redo() {
  if (historyIndex.value < contentHistory.value.length - 1) {
    historyIndex.value++
    restoreContent()
  }
}

function restoreContent() {
  lines.value = [...contentHistory.value[historyIndex.value]]
  selectedLines.value = []
}

function newFile() {
  fileName.value = `${t('toolbox.editor.untitled')}.txt`
  initEditor()
}

function downloadFile() {
  const content = lines.value.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.value
  a.click()
  URL.revokeObjectURL(url)
}

function importFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'text/plain'
  input.onchange = e => {
    const file = e.target.files[0]
    if (file) {
      fileName.value = file.name
      const reader = new FileReader()
      reader.onload = event => {
        const content = event.target.result
        lines.value = content.split('\n')
        contentHistory.value = [lines.value]
        historyIndex.value = 0
        selectedLines.value = []
        nextTick(updateCurrentLine)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function syncScroll(e, isLineNumber) {
  if (!isLineNumber) {
    lineNumbersRef.value.scrollTop = e.target.scrollTop
    lineNumbersRef.value.scrollLeft = e.target.scrollLeft
  } else {
    editor.value.scrollTop = e.target.scrollTop
    editor.value.scrollLeft = e.target.scrollLeft
  }
}

function handleEditorClick(e) {
  if (e.target === editor.value) {
    const lastLineIndex = lines.value.length - 1
    const lastLine = lineElements.value[lastLineIndex]
    if (lastLine) {
      nextTick(() => {
        focusLine(lastLineIndex, lastLine.innerText.length)
      })
    }
  }
}

onMounted(() => {
  initEditor()
  document.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
})

function updateCurrentLine() {
  if (!editorContent.value) return
  const sel = window.getSelection()
  if (!sel.rangeCount) return
  
  const range = sel.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(editorContent.value)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  
  const content = editorContent.value.textContent || ""
  const text = preCaretRange.toString()
  const lines = content.substr(0, text.length).split('\n')
  currentLineNumber.value = lines.length
}

function handleContentInput() {
  if (isComposing.value) return
  
  const children = Array.from(editorContent.value.children)
    .filter(el => el.classList.contains('editor-line'))
  
  const newLines = children.map(el => {
    return el.textContent === '\u00A0' ? '' : el.textContent
  })
  
  if (JSON.stringify(newLines) !== JSON.stringify(lines.value)) {
    lines.value = newLines
    saveToHistory(newLines)
  }
}

function handleContentKeydown(e) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    
    const sel = window.getSelection()
    if (!sel.rangeCount) return
    
    const range = sel.getRangeAt(0)
    const lineElement = range.startContainer.parentElement.closest('.editor-line')
    if (!lineElement) return
    
    const lineIdx = parseInt(lineElement.dataset.line)
    const offset = getCaretOffsetInLine(range, lineElement)
    
    if (!range.collapsed) {
      deleteSelectedText(range)
      return
    }
    
    if (e.key === 'Delete') {
      handleDeleteKey(lineIdx, offset)
    } 
    else if (e.key === 'Backspace') {
      handleBackspaceKey(lineIdx, offset)
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    
    const sel = window.getSelection()
    if (!sel.rangeCount) return
    
    const range = sel.getRangeAt(0)
    const lineElement = range.startContainer.parentElement.closest('.editor-line')
    if (!lineElement) return
    
    const lineIdx = parseInt(lineElement.dataset.line)
    
    let currentLine = lineElement.textContent || ''
    if (currentLine === '\u00A0') currentLine = ''
    
    const preRange = document.createRange()
    preRange.selectNodeContents(lineElement)
    preRange.setEnd(range.startContainer, range.startOffset)
    const offset = preRange.toString().length
    
    const left = currentLine.slice(0, offset)
    const right = currentLine.slice(offset)
    
    const newLines = [
      ...lines.value.slice(0, lineIdx),
      left,
      right,
      ...lines.value.slice(lineIdx + 1)
    ]
    lines.value = newLines
    
    nextTick(() => {
      const newLineElement = editorContent.value.children[lineIdx + 1]
      if (newLineElement) {
        setCaretPosition(newLineElement, 0)
        if (newLineElement.textContent === '') {
          newLineElement.innerHTML = '&nbsp'
        }
      }
    })
    
    saveToHistory(newLines)
  } else if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(editorContent.value)
    sel.removeAllRanges()
    sel.addRange(range)
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    setTimeout(updateCurrentLine, 0)
  }
}

function ensureNotEmpty() {
  if (editorContent.value.children.length === 0) {
    const emptyLine = document.createElement('div')
    emptyLine.className = 'editor-line'
    emptyLine.dataset.line = '0'
    emptyLine.innerHTML = '&nbsp;'
    editorContent.value.appendChild(emptyLine)
    return true
  }
  return false
}

function deleteSelectedText(range) {
  const startLineElement = range.startContainer.parentElement.closest('.editor-line')
  const endLineElement = range.endContainer.parentElement.closest('.editor-line')
  
  if (!startLineElement || !endLineElement) return
  
  const startLineIdx = parseInt(startLineElement.dataset.line)
  const endLineIdx = parseInt(endLineElement.dataset.line)
  const startOffset = getCaretOffsetInLine(range, startLineElement)
  const endOffset = getCaretOffsetInLine(range, endLineElement)
  
  if (startLineIdx === endLineIdx) {
    const line = lines.value[startLineIdx]
    const newLine = line.slice(0, startOffset) + line.slice(endOffset)
    
    const newLines = [...lines.value]
    newLines[startLineIdx] = newLine
    lines.value = newLines
    
    nextTick(() => {
      const lineElement = editorContent.value.children[startLineIdx]
      setCaretPosition(lineElement, startOffset)
    })
  } else {
    const startLine = lines.value[startLineIdx]
    const endLine = lines.value[endLineIdx]
    const newLine = startLine.slice(0, startOffset) + endLine.slice(endOffset)
    
    const newLines = [
      ...lines.value.slice(0, startLineIdx),
      newLine,
      ...lines.value.slice(endLineIdx + 1)
    ]
    lines.value = newLines
    
    nextTick(() => {
      const lineElement = editorContent.value.children[startLineIdx]
      setCaretPosition(lineElement, startOffset)
    })
  }
  
  saveToHistory(lines.value)
}

function handleDeleteKey(lineIdx, offset) {
  const line = lines.value[lineIdx]
  
  if (offset === line.length && lineIdx < lines.value.length - 1) {
    const newLines = [...lines.value]
    newLines[lineIdx] += newLines[lineIdx + 1]
    newLines.splice(lineIdx + 1, 1)
    
    lines.value = newLines
    
    nextTick(() => {
      const lineElement = editorContent.value.children[lineIdx]
      setCaretPosition(lineElement, offset)
    })
  } 
  else if (offset < line.length) {
    const newLines = [...lines.value]
    newLines[lineIdx] = line.slice(0, offset) + line.slice(offset + 1)
    lines.value = newLines
    
    nextTick(() => {
      const lineElement = editorContent.value.children[lineIdx]
      setCaretPosition(lineElement, offset)
    })
  }
  
  saveToHistory(lines.value)
}

function handleBackspaceKey(lineIdx, offset) {
  const line = lines.value[lineIdx]
  
  if (offset === 0 && lineIdx > 0) {
    const prevLineIdx = lineIdx - 1
    const prevLineLength = lines.value[prevLineIdx].length
    
    const newLines = [...lines.value]
    newLines[prevLineIdx] += line
    newLines.splice(lineIdx, 1)
    
    lines.value = newLines
    
    nextTick(() => {
      const lineElement = editorContent.value.children[prevLineIdx]
      setCaretPosition(lineElement, prevLineLength)
    })
  } 
  else if (offset > 0) {
    const newLines = [...lines.value]
    newLines[lineIdx] = line.slice(0, offset - 1) + line.slice(offset)
    lines.value = newLines
    
    nextTick(() => {
      const lineElement = editorContent.value.children[lineIdx]
      setCaretPosition(lineElement, offset - 1)
    })
  }
  
  saveToHistory(lines.value)
}

function getCaretOffsetInLine(range, lineElement) {
  const preRange = document.createRange()
  preRange.selectNodeContents(lineElement)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length
}

function getCurrentLineIndex(range, container) {
  const node = range.startContainer
  const lineElement = node.nodeType === 3 ? node.parentElement : node
  const children = Array.from(container.children)
  return children.indexOf(lineElement)
}

function getPositionInLine(range, container) {
  const node = range.startContainer
  const lineElement = node.nodeType === 3 ? node.parentElement : node
  const lineText = lineElement.textContent || ''
  const preRange = range.cloneRange()
  preRange.selectNodeContents(lineElement)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length
}

function getAbsoluteCaretPos(range, container) {
  const pre = range.cloneRange()
  pre.selectNodeContents(container)
  pre.setEnd(range.startContainer, range.startOffset)
  return pre.toString().length
}

function setCaretPosition(element, offset) {
  const range = document.createRange()
  const sel = window.getSelection()
  
  if (element.firstChild) {
    range.setStart(element.firstChild, offset)
  } else {
    range.setStart(element, 0)
  }
  
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

function setCursorPosition(lineIdx, ch) {
  nextTick(() => {
    const contentNode = editorContent.value
    if (!contentNode) return

    const walker = document.createTreeWalker(
      contentNode,
      NodeFilter.SHOW_TEXT,
      null
    )

    let currentLine = 0
    let offset = 0
    let node = null
    let found = null

    while ((node = walker.nextNode())) {
      const nodeText = node.textContent
      const linesInNode = nodeText.split('\n')

      for (let i = 0; i < linesInNode.length; i++) {
        if (currentLine === lineIdx) {
          found = { node, offset: offset + Math.min(ch, linesInNode[i].length) }
          break
        }
        offset += linesInNode[i].length
        if (i < linesInNode.length - 1) {
          currentLine++
          offset++
        }
      }
      if (found) break
    }
    if (found) {
      const range = new Range()
      range.setStart(found.node, found.offset)
      range.collapse(true)

      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  })
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    clearSelection()
  }
}

function closeSearch() {
  showSearch.value = false
  clearSelection()
}

function clearSelection() {
  const sel = window.getSelection()
  sel.removeAllRanges()
  lastMatchIndex.value = -1
  currentMatch.value = null
}

function toggleReplace() {
  showReplace.value = !showReplace.value
}

function toggleRegex() {
  useRegex.value = !useRegex.value
  showToastMessage(useRegex.value ? 'Regex enabled' : 'Regex disabled')
}

function findNext() {
  if (matches.value.length === 0) {
    findMatches()
  }

  if (matches.value.length === 0) {
    showToastMessage('No matches found')
    return
  }

  currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length
  highlightCurrentMatch()
}

function findPrev() {
  if (matches.value.length === 0) {
    findMatches()
  }

  if (matches.value.length === 0) {
    showToastMessage('No matches found')
    return
  }

  currentMatchIndex.value = (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length
  highlightCurrentMatch()
}

function showToastMessage(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

function findMatches() {
  if (!searchQuery.value) {
    matches.value = []
    return
  }

  try {
    const content = mergedContent.value
    matches.value = []
    currentMatchIndex.value = -1
    lastMatchIndex.value = -1

    if (useRegex.value) {
      const regex = new RegExp(searchQuery.value, 'g')
      let match
      while ((match = regex.exec(content)) !== null) {
        matches.value.push({
          text: match[0],
          index: match.index,
          length: match[0].length
        })
      }
    } else {
      let pos = 0
      while ((pos = content.indexOf(searchQuery.value, pos)) >= 0) {
        matches.value.push({
          text: searchQuery.value,
          index: pos,
          length: searchQuery.value.length
        })
        pos += searchQuery.value.length
      }
    }
  } catch (e) {
    showToastMessage('Invalid search pattern')
    matches.value = []
  }
}

function highlightCurrentMatch() {
  const match = matches.value[currentMatchIndex.value]
  if (!match) return

  const editorNode = editorContent.value
  if (!editorNode) return

  const range = document.createRange()
  const walker = document.createTreeWalker(editorNode, NodeFilter.SHOW_TEXT)

  let currentPos = 0
  let startNode = null
  let endNode = null
  let startOffset = 0
  let endOffset = 0

  while (walker.nextNode()) {
    const node = walker.currentNode
    const textLength = node.textContent.length

    if (!startNode && currentPos + textLength > match.index) {
      startNode = node
      startOffset = match.index - currentPos
    }

    if (!endNode && currentPos + textLength >= match.index + match.length) {
      endNode = node
      endOffset = match.index + match.length - currentPos
      break
    }

    currentPos += textLength
  }

  if (startNode && endNode) {
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)

    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    // 滚动到可见区域但不聚焦
    const rect = range.getBoundingClientRect()
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      range.startContainer.parentElement.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      })
    }
  }
  lastMatchIndex.value = match.index
  currentMatch.value = match
}

function handleSearchEnter(e) {
  e.preventDefault()
  findNext()
  return false
}
</script>

<style lang="scss" scoped>
#content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
  padding-top: 64px !important;
}

.custom-toolbar {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(var(--mdui-color-surface), 1);
  z-index: 10;
  
  .toolbar-left {
    .file-info {
      display: flex;
      flex-direction: column;
      
      .filename {
        font-weight: bold;
        font-size: 1rem;
      }
      
      .file-description {
        opacity: 0.7;
        font-size: 0.8rem;
      }
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
  }
}

.custom-menu {
  position: fixed;
  background-color: rgba(var(--mdui-color-surface-container), 1);
  border-radius: 4px;
  min-width: 120px;
  z-index: 20;
  transform-origin: top right;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  
  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(var(--mdui-color-surface-variant), 1);
    }
  }
}

.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease;
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.editor-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100% - 56px);
}

.line-numbers {
  width: var(--line-numbers-width);
  padding: 0;
  background-color: rgba(var(--mdui-color-surface-container), 1);
  text-align: right;
  user-select: none;
  font-family: monospace;
  color: rgba(var(--mdui-color-on-surface-variant), 1);
  line-height: 1.5;
  overflow-x: hidden;
  position: absolute;
  z-index: 8;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
  
  .line-number {
    min-height: 1.5em;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    position: relative;
    
    &.selected {
      background-color: rgba(var(--mdui-color-primary-container), 1);
    }
  }
}

.editor-content {
  position: relative;
  z-index: 2;
  white-space: pre;
  font-family: monospace;
  color: rgba(var(--mdui-color-on-surface), 1);
  margin-left: calc(-1 * var(--line-numbers-width) + var(--line-numbers-width) / 2);
  min-height: 100%;
  outline: none;
  padding: 0 10px;
  line-height: 1.5;
}

.line-number.current-line {
  background-color: rgba(var(--mdui-color-primary-container), 1);
  color: rgba(var(--mdui-color-on-primary-container), 1);
  font-weight: bold;
  z-index: 1;
}

.editor-lines {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: auto;
  padding-left: var(--line-numbers-width);
  background-color: rgba(var(--mdui-color-surface), 1);
  user-select: text;
  -webkit-user-select: text;
}

.editor-line {
  min-height: 1.5em;
  line-height: 1.5;
  white-space: pre;
  outline: none;
  
  &:empty::after {
    content: ' ';
    display: inline-block;
    width: 1px;
  }
}

.line-highlights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 1;
  
  .highlight-line {
    position: absolute;
    width: 100%;
    height: 1.5em;
    pointer-events: none;
    
    &.current-line {
      background-color: rgba(var(--mdui-color-primary-container), 0.2);
    }
    
    &.selected {
      background-color: rgba(var(--mdui-color-primary-container), 0.5);
    }
  }
}

.editor-line {
  min-height: 1.5em;
  padding: 0 10px;
  line-height: 1.5;
  font-family: monospace;
  color: rgba(var(--mdui-color-on-surface), 1);
  white-space: pre;
  outline: none;
  display: flex;
  align-items: center;
  
  &[contenteditable] {
    user-select: text;
  }
  
  &:focus {
    background-color: rgba(var(--mdui-color-surface-container), 1);
  }
  
  &.selected {
    background-color: rgba(var(--mdui-color-primary-container), 0.5);
  }
}

.stats-dialog {
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
    
    div:nth-child(odd) {
      font-weight: bold;
    }
  }
}

.alpha-enter-active,
.alpha-leave-active {
  transition: opacity 0.2s ease;
}

.alpha-enter-from,
.alpha-leave-to {
  opacity: 0;
}

.search-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background-color: rgba(var(--mdui-color-surface), 1);
  border-top: 1px solid rgba(var(--mdui-color-outline), 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input,
.replace-input {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(var(--mdui-color-outline), 0.2);
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
  resize: none;
  font-family: monospace;
  background-color: rgba(var(--mdui-color-surface-container), 1);
  color: rgba(var(--mdui-color-on-surface), 1);
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background-color: rgba(var(--mdui-color-inverse-surface), 1);
  color: rgba(var(--mdui-color-inverse-on-surface), 1);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 101;
}
</style>