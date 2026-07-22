<template>
  <div>
    <Topbar v-if="!isDesktop" />
    <div ref="scrollContainer" :id="!isDesktop ? 'content' : ''" class="ns" style="width: 100%;height: var(--window-height);box-sizing: border-box; overflow-y: auto;">
      <div class="search-container" :class="{ 'scrolled': hasScrolled }">
        <mdui-text-field 
          :label="t('editor.settings.search')" 
          :value="searchQuery" 
          @change="searchQuery = $event.target.value" 
          variant="filled" 
          clearable
          class="search-field"
          name="search"
        >
          <ion-icon slot="prefix" name="search-outline" />
        </mdui-text-field>
      </div>
      <div class="list-container">
        <div v-if="showEmptyState" class="empty-state">
          <ion-icon name="search-outline" class="empty-icon" />
          <p>{{ t('editor.settings.empty') }}</p>
        </div>
        <div v-for="(section, sectionIndex) in filteredConfig" :key="sectionIndex">
          <mdui-list-item rounded @click="toggleSection(sectionIndex)">
            <span>{{ getText(section.text) }}</span>
            <span v-if="section.desc" slot="description">{{ getText({ 'zh-cn': section.desc, 'en-us': section.desc }) }}</span>
            <div slot="end-icon" style="font-size: 1rem" v-if="!isSearching">
              <ion-icon v-if="expandedSection === sectionIndex" name="chevron-up-outline" />
              <ion-icon v-else name="chevron-down-outline" />
            </div>
          </mdui-list-item>
          <transition name="expanded">
            <div v-if="expandedSection === sectionIndex || isSearching" class="list">
              <div v-for="(option, optionIndex) in section.options" :key="optionIndex">
                <mdui-divider v-if="option.type === 'line'" />
                <div v-else-if="option.type === 'comment'" class="comment">
                  <div class="comment-text">{{ option.text }}</div>
                </div>
                <mdui-list-item rounded v-else-if="option.type === 'boolean'" @click="toggleBoolean(option)">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc || option.description && option.description['zh-cn']">{{ option.desc ? t("editor.settings" + option.desc) : getText(option.description) }}</div>
                  <mdui-switch slot="end-icon" name="switch" :checked="option.value" @change="toggleBoolean(option)">
                    <span slot="checked-icon"/>
                  </mdui-switch>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'string'">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc || option.description && option.description['zh-cn']">{{ option.desc ? t("editor.settings" + option.desc) : getText(option.description) }}</div>
                  <mdui-text-field slot="end-icon" name="input" class="list-end-element" :value="option.value" type="text" @change="toggleString($event, option)"/>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'number'">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc || option.description && option.description['zh-cn']">{{ option.desc ? t("editor.settings" + option.desc) : getText(option.description) }}</div>
                  <mdui-text-field slot="end-icon" name="input" class="list-end-element" :value="option.value" type="number" @input="fixedFloatInput($event)" @change="toggleNumber($event, option)" />
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'float'" @click="expandedColorPicker = expandedColorPicker === option.id ? '' : option.id">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc || option.description && option.description['zh-cn']">{{ option.desc ? t("editor.settings" + option.desc) : getText(option.description) }}</div>
                  <span slot="end-icon" v-if="option.id?.includes('offset') || option.id?.includes('offset')">{{ Number.parseInt(option.value * 100) }}</span>
                  <div slot="end-icon" v-else class="color-preview" :style="alphaPreview(option.value)"/>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'group'" @click="toggleGroup(option)">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc || option.description && option.description['zh-cn']">{{ option.desc ? t("editor.settings" + option.desc) : getText(option.description) }}</div>
                  <mdui-select slot="end-icon" class="list-end-element" :value="'item-' + option.value" @change="changeGroupValue($event, option)">
                    <mdui-menu-item v-for="(item, i) in option.options" :value="'item-' + i" :key="i">{{ getText(item) }}</mdui-menu-item>
                  </mdui-select>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'color'" @click="expandedColorPicker = expandedColorPicker === option.id ? '' : option.id">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc || option.description && option.description['zh-cn']">{{ option.desc ? t("editor.settings" + option.desc) : getText(option.description) }}</div>
                  <div slot="end-icon" class="color-preview" :style="colorPreview(option.value)"/>
                </mdui-list-item>
                <Transition name="expanded">
                  <Palette
                    v-if="(option.type === 'color' || option.type === 'float') && expandedColorPicker === option.id"
                    v-model="option.value"
                    :use-alpha="option.value[3] !== undefined || option.type === 'float'"
                    :only-alpha="option.type === 'float'"
                    @change="saveColor(option)"
                  />
                </Transition>
              </div>
            </div>
          </transition>
        </div>

        <mdui-list-item rounded v-show="!isSearching" @click="toggleDebug">
          <span>{{ t("editor.settings.debug") }}</span>
          <div slot="end-icon" style="font-size: 1rem">
            <ion-icon v-if="showDebug" name="chevron-up-outline" />
            <ion-icon v-else name="chevron-down-outline" />
          </div>
        </mdui-list-item>
        <transition name="fade">
          <div v-if="showDebug & !isSearching" class="list">
            <pre v-text="formattedParsedConfig"></pre>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import Topbar from '../components/Topbar.vue'
import Palette from '../components/Palette'
import { nextTick, inject, ref, onBeforeUnmount, onMounted, computed, watch } from 'vue'
import configData from '../data/_global_variables.json.txt'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const fs = inject("fs")

const props = defineProps({
  isDesktop: {
    type: Boolean,
    default: false
  },
  isSidebar: {
    type: Boolean,
    default: false
  }
})

const excludeArray = [
  "$cube_theme_bg_photographer", "$cube_theme_bg_seed", "$cube_theme_bg_coordinate", "$cube_theme_bg_addon",
  "$cube_progress_background_custom", "$cube_progress_background_texture", "$cube_progress_background_fill",
  "$cube_container_background_custom", "$cube_container_background_texture", "$cube_container_background_fill", "$cube_container_background_alpha", "$cube_container_background_color",
  "$cube_container_pocket_background_custom", "$cube_container_pocket_background_texture", "$cube_container_pocket_background_fill", "$cube_container_pocket_background_alpha", "$cube_container_pocket_background_color"
]

const hasScrolled = ref(false)
const scrollContainer = ref(null)
const searchQuery = ref('')
const isSearching = computed(() => searchQuery.value.trim() !== '')

const extractedConfig = ref('')
const processedConfig = ref('')
const parsedConfig = ref([])
const expandedSection = ref(-1)
const expandedColorPicker = ref('')
const showDebug = ref(false)

// 文件
const setVariables = async (key, value) => {
  let file = await fs.value.read("ui/_global_variables.json")
  file = file || {}
  file[key] = value
  fs.value.write("ui/_global_variables.json", file)
}

const removeVariables = async str => {
  const file = await fs.value.read("ui/_global_variables.json")
  const propArr = str.split(",").map(prop=>prop.trim())
  const content = Object.keys(file || {})
    .filter(key => !propArr.includes(key))
    .reduce((obj, key) => {
      obj[key] = file[key];
      return obj
    }, {})
  fs.value.write("ui/_global_variables.json", content)
}

const alphaPreview = value => ({
  background: `linear-gradient(rgba(0, 0, 0, ${value}), rgba(0, 0, 0, ${value})) 0 0 / cover,
    linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 12px 12px,
    linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 6px 6px / 12px 12px`
})

const colorPreview = arr => ({
  background: `linear-gradient(rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3] === undefined ? 1 : arr[3]}), rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3] === undefined ? 1 : arr[3]})) 0 0 / cover,
    linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 12px 12px,
    linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 6px 6px / 12px 12px`
})

const saveColor = (option) => {
  const value = typeof option.value === "object" ? option.value.map((v, i) => i < 3 ? parseFloat((v / 255).toFixed(3)) : v) : option.value
  saveOption(option, value)
}

onMounted(async () => {
  nextTick(() => {
    const timeout = setTimeout(() => {
      expandedSection.value = 0
      clearTimeout(timeout)
    }, 800)
  })
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }

  let variables = await fs.value.read("ui/_global_variables.json")
  variables = variables || {}

  const startMarker = '// ━━━━━━━━━━\n// 方窗面板 | cubevisage panel\n// ━━━━━━━━━━'
  const endMarker = '// ━━━━━━━━━━'
  const startIndex = configData.indexOf(startMarker)
  if (startIndex === -1) {
    console.error('Start tag not found for the configuration section')
    return
  }
  const endIndex = configData.indexOf(endMarker, startIndex + startMarker.length)
  if (endIndex === -1) {
    console.error('End tag not found for the configuration section')
    return
  }
  extractedConfig.value = configData.substring(startIndex, endIndex).trim()
  processedConfig.value = extractedConfig.value
    .replace(startMarker, '')
    .trim()

  const lines = processedConfig.value.split('\n')
  let currentSection = null
  let currentOptions = []
  let prevType = ""

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('//') && trimmedLine.endsWith('//')) {
      const title = trimmedLine.replaceAll('//', '').trim()
      const [zhTitle, enTitle] = title.includes('|') ? title.split('|').map(t => t.replace("$","").replace("#","").trim()) : [title, title]
      currentSection = {
        text: {
          'zh-cn': zhTitle,
          'en-us': enTitle
        },
        expanded: false,
        options: []
      }
      prevType = "title"
      parsedConfig.value.push(currentSection)
      currentOptions = currentSection.options
    } else if (trimmedLine.startsWith('//') && !trimmedLine.endsWith('//')) {
      const commentText = trimmedLine.replace('//', '').trim()
      currentOptions.push({
        type: 'comment',
        text: commentText
      })
      prevType = "comment"
    } else if (trimmedLine === '') {
      if (prevType === "line") continue
      currentOptions.push({
        type: 'line'
      })
      prevType = "line"
    } else if (trimmedLine.indexOf('$') !== -1) {
      try {
        let [keyPart, commentPart] = trimmedLine.split('//').map(p => p.trim())
        let [key, ...value] = keyPart.split(':').map(p => p.trim());
        value = value.join(':').replace(/,\s*$/, '')

        let valueType
        let valueContent

        if (commentPart.includes('[') && commentPart.includes(']') && commentPart.includes('-')) {
          const start = commentPart.indexOf('[') + 1
          const end = commentPart.indexOf(']')
          const groupOptionsText = commentPart.substring(start, end)
          const groupOptions = groupOptionsText.split(' ').map(option => {
            const [index, text] = option.split('-').map(part => part.trim())
            const [zh, en] = text.split('/').map(t => t.trim())
            return {
              'zh-cn': zh,
              'en-us': en ? en.replace(/([A-Z])/g, ' $1').trim().toLowerCase() : zh
            }
          })
  
          valueType = 'group'
          valueContent = parseInt(value)
          const commentText = (commentPart || "").includes('|') ? commentPart.split('|').map(t => t.trim()) : [commentPart, commentPart]
          
          const str1 = commentText[0].split(' | ')[0]
          const str2 = commentText[1].split(' | ')[0]
            .replace('[' + groupOptionsText + ']', '') || str1
          const [title1, desc1] = /\((.*?)\)[^()]*$/.test(str1) ? str1.split(/\((.*?)\)[^()]*$/).slice(0, 2) : [str1.trim(), ""];
          const [title2, desc2] = /\((.*?)\)[^()]*$/.test(str2) ? str2.split(/\((.*?)\)[^()]*$/).slice(0, 2) : [str2.trim(), ""];
          const optionEntry = {
            type: valueType,
            default: valueContent,
            value: variables[key.slice(1, -1)] || valueContent,
            expanded: false,
            id: key.slice(1, -1),
            text: {
              'zh-cn': title1,
              'en-us': title2
            },
            description: {
              'zh-cn': desc1,
              'en-us': desc2
            },
            options: groupOptions
          }
  
          currentOptions.push(optionEntry)
        } else {
          const valueLower = value.toLowerCase()
          const commentText = (commentPart || "").includes('|') ? commentPart.split('|').map(t => t.trim()) : [commentPart, commentPart]
          if (valueLower === 'true' || valueLower === 'false') {
            valueType = 'boolean'
            valueContent = valueLower === 'true'
          } else if (value.includes('[') && value.includes(']')) {
            valueType = 'color'
            valueContent = JSON.parse(value).map((val, i) => 
              i < 3 ? Math.round(val * 255) : val
            )
          } else if (key.includes('offset') || key.includes('size') || (value.includes('.') && !value.includes('"'))) {
            valueType = 'float'
            valueContent = parseFloat(value)
          } else if (!isNaN(value)) {
            valueType = 'number'
            valueContent = parseInt(value)
          } else if (value.startsWith('"') && value.endsWith('"')) {
            valueType = 'string'
            valueContent = value.slice(1, -1)
          } else {
            valueType = 'string'
            valueContent = value
          }
    
          prevType = valueType
          const str1 = commentText[0]
            .replace('[!] ', '')
            .replace('[experiment] ', '')
            .replace('[discarded] ', '')
            .replace('[only china edition] ', '')
          const str2 = commentText[1] || str1
          const [title1, desc1] = /\((.*?)\)[^()]*$/.test(str1) ? str1.split(/\((.*?)\)[^()]*$/).slice(0, 2) : [str1.trim(), ""];
          const [title2, desc2] = /\((.*?)\)[^()]*$/.test(str2) ? str2.split(/\((.*?)\)[^()]*$/).slice(0, 2) : [str2.trim(), ""];
          const optionEntry = {
            type: valueType,
            default: valueContent,
            value: variables[key.slice(1, -1)] === undefined ? valueContent : variables[key.slice(1, -1)],
            id: key.slice(1, -1),
            text: {
              'zh-cn': title1,
              'en-us': title2
            },
            description: {
              'zh-cn': desc1,
              'en-us': desc2
            }
          }
    
          if (commentText.includes('[!')) optionEntry.desc = '.unfinished'
          if (commentText.includes('[experiment')) optionEntry.desc = '.experiment'
          if (commentText.includes('[discarded')) optionEntry.desc = '.discarded'
          if (commentText.includes('[only china edition')) optionEntry.desc = '.chinaEdition'
    
          currentOptions.push(optionEntry)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  parsedConfig.value = parsedConfig.value.filter(obj => obj.options.length !== 0)
  parsedConfig.value.map(obj => {
    if (obj.options.length !== 0 && obj.options[obj.options.length - 1].type === "line") {
      obj.options.pop()
    }
    return obj
  })
})

const getText = textObject => {
  if (locale.value.startsWith('zh')) {
    return textObject['zh-cn']
  }
  return textObject['en-us']
}

const fixedFloatInput = event => {
  const root = event.target.shadowRoot
  root.children[0].className = 'container has-value'
  root.children[0].children[4].style.display = 'none'
  if (root.children[1]) root.children[1].textContent = ''
}

const toggleSection = (sectionIndex) => {
  expandedSection.value = expandedSection.value === sectionIndex ? -1 : sectionIndex
}

const saveOption = (option, value) => {
  option.value = value
  if (option.value === option.default) removeVariables(option.id)
  else setVariables(option.id, option.value)
}

const toggleBoolean = (option) => {
  saveOption(option, !option.value)
}

const toggleString = (event, option) => {
  saveOption(option, event.target.value)
}

const toggleNumber = (event, option) => {
  saveOption(option, Number.parseInt(event.target.value))
}

const toggleFloat = (event, option) => {
  saveOption(option, Number.parseFloat(event.target.value))
}

const changeGroupValue = (event, option) => {
  if (!event.target.value) event.target.value = "item-" + option.default
  saveOption(option, Number.parseFloat(event.target.value.replace('item-', '')))
}

const toggleGroup = (option) => {
  option.expanded = !option.expanded
}

const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

const formattedParsedConfig = computed(() => {
  return JSON.stringify(parsedConfig.value, null, 2)
})

// 搜索
const filteredConfig = computed(() => {
  if (!isSearching.value) return parsedConfig.value
  
  const query = searchQuery.value.toLowerCase().trim()
  const results = []
  
  parsedConfig.value.forEach(section => {
    // section
    const sectionTitle = getText(section.text).toLowerCase()
    const sectionMatch = sectionTitle.includes(query)
    
    // section options
    const filteredOptions = []
    section.options.forEach(option => {
      if (option.type === 'line' || option.type === 'comment') return
      
      // title & description
      const optionTitle = getText(option.text).toLowerCase()
      const optionDesc = option.desc ? t("editor.settings" + option.desc).toLowerCase() : ''
      const optionMatch = optionTitle.includes(query) || optionDesc.includes(query)
      
      if (optionMatch) filteredOptions.push(option)
    })
    
    // result
    if (sectionMatch || filteredOptions.length > 0) {
      results.push({
        ...section,
        options: filteredOptions
      })
    }
  })
  
  return results
})

const showEmptyState = computed(() => {
  return isSearching.value && filteredConfig.value.length === 0
})

const handleScroll = () => {
  hasScrolled.value = scrollContainer.value.scrollTop > 0
}

watch(isSearching, searching => {
  if (searching) {
    expandedSection.value = -1
  } else {
    expandedSection.value = -1
  }
})

onBeforeUnmount(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped lang="scss">
#content {
  padding-top: 64px !important;
}

.search-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(var(--mdui-color-surface));
  padding: 0.8rem;
  border-bottom: 1px none rgb(var(--mdui-color-surface));
  box-shadow: none;
  transition: all 0.3s ease-out;
  &.scrolled {
    border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .search-field {
    width: 100%;
  }
}

.list-container {
  padding: 0.5rem;
}

.color-preview {
  width: 32px;
  height: 32px;
  background: black;
  border-radius: 50%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: rgba(var(--mdui-color-on-surface), 0.6);
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: rgba(var(--mdui-color-primary), 0.3);
  }
  p {
    font-size: 18px;
    margin: 0;
  }
}

.list {
  background-color: rgba(var(--mdui-color-primary), 0.06);
  border-radius: 5px;
  margin-top: 0.2rem;
  overflow-y: hidden;
  padding: 10px;
  .comment {
    margin: 5px;
    padding: 5px 10px;
    background-color: rgba(var(--mdui-color-primary), 0.08);
    border-radius: 8px;
    .comment-text {
      font-size: 14px;
    }
  }
  span {
    font-size: 0.8rem;
  }
  .list-end-element {
    line-height: 1rem;
    width: 220px;
    @media (max-width: 767px) {
      width: 145px;
    }
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-family: monospace;
    user-select: auto;
    -ms-user-select: auto;
    -moz-user-select: auto;
    -webkit-user-select: auto;
  }
}

.expanded-enter-active,
.expanded-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
}

.expanded-enter-from,
.expanded-leave-to {
  max-height: 0;
}

.expanded-enter-to,
.expanded-leave-from {
  max-height: 1000px;
}
</style>