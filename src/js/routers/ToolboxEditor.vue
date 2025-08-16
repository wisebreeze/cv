<template>
<div>
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
        <textarea
          v-if="isFullSelectMode"
          ref="fullSelectTextarea"
          class="full-select-textarea"
          :value="mergedContent"
          @blur="exitFullSelectMode"
        ></textarea>
        <div 
          ref="editorContent"
          class="editor-content"
          contenteditable="true"
          @input="handleContentInput"
          @keydown="handleContentKeydown"
          @compositionstart="isComposing = true"
          @compositionend="handleCompositionEnd"
          @mousedown="startSelection"
          @mouseup="endSelection"
          @touchstart="startSelection"
          @touchend="endSelection"
          @focus="updateCurrentLine"
          @keyup="updateCurrentLine"
          @click="updateCurrentLine"
        >{{ mergedContent }}</div>
      </div>
    </div>
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

const isUserSelecting = ref(false)
const lastSelectionRange = ref(null)
const isFullSelectMode = ref(false)
const fullSelectTextarea = ref(null)
const mergedContent = computed(() => lines.value.join('\n'))

const lineNumbers = computed(() => {
  return Array.from({length: lines.value.length}, (_, i) => i + 1)
})

const lineNumbersWidth = computed(() => {
  const digits = String(lineNumbers.value.length).length
  return Math.max(30, digits * 10 + 10)
})

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

function startSelection(index) {
  const selection = window.getSelection()
  if (selection.toString().length > 0) {
    enterFullSelectMode()
    return
  }
  selectionStart.value = index
  selectedLines.value = [index + 1]
}

function endSelection() {
  if (selectionStart.value === -1) return

  if (isFullSelectMode.value) return
  
  const selection = window.getSelection()
  const selectedText = selection.toString()
  
  if (selectedText.includes('\n')) {
    enterFullSelectMode()
    return
  }
  
  if (!selection.toString()) {
    selectionStart.value = -1
    return
  }
  
  const endLine = lineElements.value.findIndex(el => el.contains(selection.anchorNode))
  
  if (endLine !== -1) {
    const start = Math.min(selectionStart.value, endLine)
    const end = Math.max(selectionStart.value, endLine)
    selectedLines.value = Array.from({length: end - start + 1}, (_, i) => start + i + 1)
  }
  
  selectionStart.value = -1
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

function handleSelectAll(e) {
  e.preventDefault()
  enterFullSelectMode()
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

function handleSelectStart(e) {
  isUserSelecting.value = true
}

function handleSelectionChange() {
  const selection = window.getSelection()
  
  if (!isUserSelecting.value) return
  
  if (selection.toString().length > 0) {
    if (selection.toString().includes('\n')) {
      enterSelectMode(selection)
    }
  } else {
    exitSelectMode()
  }
}

function enterSelectMode(selection) {
  lastSelectionRange.value = selection.getRangeAt(0).cloneRange()
  const tempDiv = document.createElement('div')
  tempDiv.style.whiteSpace = 'pre'
  tempDiv.style.visibility = 'hidden'
  tempDiv.style.position = 'absolute'
  tempDiv.textContent = lines.value.join('\n')
  document.body.appendChild(tempDiv)
  const range = selection.getRangeAt(0)
  const startOffset = range.startOffset
  const endOffset = range.endOffset
  lastSelectionRange.value = {
    start: startOffset,
    end: endOffset,
    text: range.toString()
  }
  document.body.removeChild(tempDiv)
  isFullSelectMode.value = true
  nextTick(() => {
    const textarea = fullSelectTextarea.value
    textarea.focus()
    textarea.setSelectionRange(startOffset, endOffset)
  })
}

function exitSelectMode() {
  if (isFullSelectMode.value) {
    const newContent = fullSelectTextarea.value.value
    lines.value = newContent.split('\n')
    isFullSelectMode.value = false
    saveToHistory([...lines.value])
  }
  isUserSelecting.value = false
}

onMounted(() => {
  initEditor()
  document.addEventListener('click', closeMenu)
  document.addEventListener('selectall', handleSelectAll)
  document.addEventListener('selectstart', handleSelectStart)
  document.addEventListener('selectionchange', handleSelectionChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('selectall', handleSelectAll)
  document.removeEventListener('selectstart', handleSelectAll)
  document.removeEventListener('selectionchange', handleSelectionChange)
})

function enterFullSelectMode() {
  isFullSelectMode.value = true
  nextTick(() => {
    fullSelectTextarea.value.select()
  })
}

function updateCurrentLine() {
  if (!editorContent.value || isFullSelectMode.value) return
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

function handleContentInput(e) {
  if (isComposing.value) return
  const content = e.target.innerText
  lines.value = content.split('\n')
  saveToHistory(lines.value)
  updateCurrentLine()
}

function handleContentKeydown(e) {
  if (e.key === 'Backspace') {
    const sel = window.getSelection()
    if (sel.rangeCount === 0) return
    
    const range = sel.getRangeAt(0)
    const content = editorContent.value
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(content)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    
    const text = preCaretRange.toString()
    const lines = text.split('\n')
    const lineNum = lines.length
    const posInLine = lines[lines.length-1].length
    
    if (posInLine === 0 && lineNum > 1) {
      e.preventDefault()
      const newLines = [...lines.value]
      newLines[lineNum-2] += newLines[lineNum-1]
      newLines.splice(lineNum-1, 1)
      lines.value = newLines
      saveToHistory(newLines)
      nextTick(() => {
        const newPos = newLines[lineNum-2].length
        setCursorPosition(lineNum-2, newPos)
      })
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    document.execCommand('insertLineBreak')
    updateCurrentLine()
  } 
  else if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSelectAll(e)
  }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    setTimeout(updateCurrentLine, 0)
  }
}

function exitFullSelectMode() {
  if (isFullSelectMode.value) {
    const newContent = fullSelectTextarea.value.value
    lines.value = newContent.split('\n')
    isFullSelectMode.value = false
    saveToHistory([...lines.value])
    nextTick(updateCurrentLine)
  }
}
</script>

<style lang="scss" scoped>
#content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
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
  width: v-bind(lineNumbersWidth + 'px');
  padding: 0;
  background-color: rgba(var(--mdui-color-surface-container), 1);
  text-align: right;
  user-select: none;
  font-family: monospace;
  color: rgba(var(--mdui-color-on-surface-variant), 1);
  line-height: 1.5;
  overflow-x: hidden;
  position: absolute;
  z-index: 2;
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
    
    &.selected {
      background-color: rgba(var(--mdui-color-primary-container), 1);
    }
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5em;
    background-color: rgba(var(--mdui-color-primary-container), 0.2);
    z-index: -1;
    transform: translateY(calc((var(--current-line) - 1) * 1.5em));
    transition: transform 0.1s ease;
  }
}

.editor-content {
  white-space: pre;
  font-family: monospace;
  color: rgba(var(--mdui-color-on-surface), 1);
  margin-left: calc(-1 * v-bind(lineNumbersWidth + 'px'));
  padding-left: v-bind(lineNumbersWidth + 'px');
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
  flex: 1;
  height: 100%;
  overflow: auto;
  padding-left: v-bind(lineNumbersWidth + 'px');
  position: relative;
  background-color: rgba(var(--mdui-color-surface), 1);
  user-select: text;
  -webkit-user-select: text;
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

.full-select-textarea {
  position: absolute;
  width: calc(100% - v-bind(lineNumbersWidth + 'px'));
  left: v-bind(lineNumbersWidth + 'px');
  border: none;
  outline: none;
  resize: none;
  font-family: monospace;
  line-height: 1.5;
  white-space: pre;
  background-color: rgba(var(--mdui-color-surface), 1);
  color: rgba(var(--mdui-color-on-surface), 1);
  padding: 10px;
  box-sizing: border-box;
}
</style>