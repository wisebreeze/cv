<template>
  <div>
    <Topbar v-if="!isDesktop" />
    <div ref="scrollContainer" :id="!isDesktop ? 'content' : ''" class="ns" style="width: 100%;height: var(--window-height);box-sizing: border-box; overflow-y: auto;">
      <div class="search-container" :class="{ 'scrolled': hasScrolled }">
        <mdui-button-icon class="category-menu-btn" @click="showCategoryDrawer = true">
          <ion-icon name="menu-outline"></ion-icon>
        </mdui-button-icon>
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
        <div v-for="(section, sectionIndex) in filteredConfig" :key="sectionIndex" :data-section-index="sectionIndex">
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
                  <div class="option-content">
                    <div class="option-title-row">
                      <span>{{ getText(option.text) }}</span>
                      <ion-icon
                        v-if="getHelpConfig(option.id)"
                        name="help-circle-outline"
                        class="help-icon"
                        @click.stop="openHelp(option.id)"
                      ></ion-icon>
                    </div>
                    <div class="option-help-desc" v-if="getHelpConfig(option.id)">
                      {{ t(getHelpConfig(option.id).desc) }}
                    </div>
                  </div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <mdui-switch slot="end-icon" name="switch" :checked="option.value" @change="toggleBoolean(option)">
                    <span slot="checked-icon"/>
                  </mdui-switch>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'string'">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <mdui-text-field slot="end-icon" name="input" class="list-end-element" :value="option.value" type="text" @change="toggleString($event, option)"/>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'number'">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <mdui-text-field slot="end-icon" name="input" class="list-end-element" :value="option.value" type="number" @input="fixedFloatInput($event)" @change="toggleNumber($event, option)" />
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'float'">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <mdui-text-field slot="end-icon" name="input" class="list-end-element" :value="option.value" type="number" @input="fixedFloatInput($event)" @change="toggleFloat($event, option)" />
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'group'" @click="toggleGroup(option)">
                  <div class="option-content">
                    <div class="option-title-row">
                      <span>{{ getText(option.text) }}</span>
                      <ion-icon
                        v-if="getHelpConfig(option.id)"
                        name="help-circle-outline"
                        class="help-icon"
                        @click.stop="openHelp(option.id)"
                      ></ion-icon>
                    </div>
                    <div class="option-help-desc" v-if="getHelpConfig(option.id)">
                      {{ t(getHelpConfig(option.id).desc) }}
                    </div>
                  </div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <mdui-select slot="end-icon" class="list-end-element" :value="'item-' + option.value" @change="changeGroupValue($event, option)">
                    <mdui-menu-item v-for="(item, i) in option.options" :value="'item-' + i" :key="i">{{ getText(item) }}</mdui-menu-item>
                  </mdui-select>
                </mdui-list-item>
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

    <Transition name="drawer">
      <div v-if="showCategoryDrawer" class="category-drawer-overlay" @click.self="showCategoryDrawer = false">
        <div class="category-drawer">
          <div class="category-drawer-header">
            <h2>{{ t('editor.settings.title') }}</h2>
            <mdui-button-icon @click="showCategoryDrawer = false">
              <ion-icon name="close-outline"></ion-icon>
            </mdui-button-icon>
          </div>
          <div class="category-drawer-content">
            <mdui-list-item
              v-for="(section, index) in parsedConfig"
              :key="index"
              rounded
              :active="expandedSection === index"
              @click="jumpToSection(index)"
            >
              {{ getText(section.text) }}
            </mdui-list-item>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="dialog">
      <div v-if="showHelpDialog" class="help-dialog-overlay" @click.self="closeHelp">
        <div class="help-dialog">
          <div class="help-dialog-header">
            <h2 class="help-dialog-title">{{ t(currentHelp.title) }}</h2>
            <mdui-button-icon @click="closeHelp">
              <ion-icon name="close-outline"></ion-icon>
            </mdui-button-icon>
          </div>
          <div class="help-dialog-content">
            <p class="help-dialog-desc">{{ t(currentHelp.desc) }}</p>
            <div class="help-images">
              <div class="help-image-item" v-for="(img, i) in currentHelp.images" :key="i">
                <img :src="img.src" :alt="t(img.label)" class="help-image" />
                <span class="help-image-label">{{ t(img.label) }}</span>
              </div>
            </div>
          </div>
          <div class="help-dialog-footer">
            <mdui-button variant="filled" full-width @click="closeHelp">
              {{ t('gui$know') }}
            </mdui-button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import Topbar from '../components/Topbar.vue'
import { inject, ref, onBeforeUnmount, onMounted, computed, watch, nextTick } from 'vue'
import configData from '../data/_global_variables.json.txt'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const fs = inject("fs")

const helpConfig = {
  '$cube_set_ec875b4d': {
    title: 'editor.settings.textShadowTitle',
    desc: 'editor.settings.textShadowDesc',
    images: [
      { src: require('../../image/text_shadows.jpg'), label: 'editor.settings.textShadowsLabel' },
      { src: require('../../image/text_no_shadows.jpg'), label: 'editor.settings.textNoShadowsLabel' }
    ]
  },
  '$cube_set_bac1d62e': {
    title: 'editor.settings.foldEnchantTitle',
    desc: 'editor.settings.foldEnchantDesc',
    images: [
      { src: require('../../image/enchant_default.jpg'), label: 'editor.settings.enchantDefaultLabel' },
      { src: require('../../image/enchant_no_text.jpg'), label: 'editor.settings.enchantNoTextLabel' }
    ]
  },
  '$cube_set_abe4bb75': {
    title: 'editor.settings.hudToolboxTitle',
    desc: 'editor.settings.hudToolboxDesc',
    images: [
      { src: require('../../image/hud_toolbox.jpg'), label: 'editor.settings.hudToolboxLabel' }
    ]
  },
  '$cube_set_262e4ae6': {
    title: 'editor.settings.edgeGlossTitle',
    desc: 'editor.settings.edgeGlossDesc',
    images: [
      { src: require('../../image/gloss.jpg'), label: 'editor.settings.edgeGlossLabel' }
    ]
  },
  '$cube_set_e615756d': {
    title: 'editor.settings.gridHoverTitle',
    desc: 'editor.settings.gridHoverDesc',
    images: [
      { src: require('../../image/gloss.jpg'), label: 'editor.settings.gridHoverLabel' }
    ]
  },
  '$cube_set_a29ab0a9': {
    title: 'editor.settings.noteblockTitle',
    desc: 'editor.settings.noteblockDesc',
    images: [
      { src: require('../../image/noteblock.jpg'), label: 'editor.settings.noteblockLabel' }
    ]
  },
  '$cube_set_6a7a531e': {
    title: 'editor.settings.tradeLayoutTitle',
    desc: 'editor.settings.tradeLayoutDesc',
    images: [
      { src: require('../../image/trade.jpg'), label: 'editor.settings.tradeLayoutLabel' }
    ]
  },
  '$cube_set_41ee3e72': {
    title: 'editor.settings.chatToolboxTitle',
    desc: 'editor.settings.chatToolboxDesc',
    images: [
      { src: require('../../image/chat.jpg'), label: 'editor.settings.chatToolboxLabel' }
    ]
  },
  '$cube_set_78f78dea': {
    title: 'editor.settings.chestToolboxTitle',
    desc: 'editor.settings.chestToolboxDesc',
    images: [
      { src: require('../../image/chest.jpg'), label: 'editor.settings.chestToolboxLabel' }
    ]
  },
  '$cube_set_7b00d0c8': {
    title: 'editor.settings.switchLabelTitle',
    desc: 'editor.settings.switchLabelDesc',
    images: []
  },
  '$cube_set_f51d10b7': {
    title: 'editor.settings.hotbarRoundTitle',
    desc: 'editor.settings.hotbarRoundDesc',
    images: []
  },
  '$cube_set_2b2c8eeb': {
    title: 'editor.settings.hotbarOffsetTitle',
    desc: 'editor.settings.hotbarOffsetDesc',
    images: []
  },
  '$cube_set_8989cd21': {
    title: 'editor.settings.tabToolboxTitle',
    desc: 'editor.settings.tabToolboxDesc',
    images: []
  },
  '$cube_set_9ae6a2ef': {
    title: 'editor.settings.dataOverviewTitle',
    desc: 'editor.settings.dataOverviewDesc',
    images: []
  },
  '$cube_set_5226c632': {
    title: 'editor.settings.bottomMessageTitle',
    desc: 'editor.settings.bottomMessageDesc',
    images: []
  },
  '$cube_set_4a0d69b6': {
    title: 'editor.settings.equalMessageTitle',
    desc: 'editor.settings.equalMessageDesc',
    images: []
  },
  '$cube_set_83f6db8f': {
    title: 'editor.settings.infoPositionTitle',
    desc: 'editor.settings.infoPositionDesc',
    images: []
  },
  '$cube_set_fb27fdf6': {
    title: 'editor.settings.durabilityStyleTitle',
    desc: 'editor.settings.durabilityStyleDesc',
    images: []
  },
  '$cube_set_fe8e132d': {
    title: 'editor.settings.oreDistTitle',
    desc: 'editor.settings.oreDistDesc',
    images: []
  },
  '$cube_set_c70c72bb': {
    title: 'editor.settings.axisTitle',
    desc: 'editor.settings.axisDesc',
    images: []
  },
  '$cube_set_8b88022e': {
    title: 'editor.settings.structurePreviewTitle',
    desc: 'editor.settings.structurePreviewDesc',
    images: []
  },
  '$cube_set_089fd192': {
    title: 'editor.settings.assistCrosshairTitle',
    desc: 'editor.settings.assistCrosshairDesc',
    images: []
  },
  '$cube_set_78743dd4': {
    title: 'editor.settings.unconditionalDisplayTitle',
    desc: 'editor.settings.unconditionalDisplayDesc',
    images: []
  },
  '$cube_set_baf2497a': {
    title: 'editor.settings.nonTouchModeTitle',
    desc: 'editor.settings.nonTouchModeDesc',
    images: []
  },
  '$cube_set_e453c46f': {
    title: 'editor.settings.operationAllTitle',
    desc: 'editor.settings.operationAllDesc',
    images: []
  },
  '$cube_set_da5b81f2': {
    title: 'editor.settings.toolboxSidebarTitle',
    desc: 'editor.settings.toolboxSidebarDesc',
    images: []
  },
  '$cube_set_f4f8111b': {
    title: 'editor.settings.hoverTextTitle',
    desc: 'editor.settings.hoverTextDesc',
    images: []
  },
  '$cube_set_c809c91a': {
    title: 'editor.settings.touchHoverPosTitle',
    desc: 'editor.settings.touchHoverPosDesc',
    images: []
  },
  '$cube_set_bedae7de': {
    title: 'editor.settings.gridSpacingTitle',
    desc: 'editor.settings.gridSpacingDesc',
    images: []
  },
  '$cube_set_6959b919': {
    title: 'editor.settings.scaleTitle',
    desc: 'editor.settings.scaleDesc',
    images: []
  },
  '$cube_set_70a9fab5': {
    title: 'editor.settings.chainMoveTitle',
    desc: 'editor.settings.chainMoveDesc',
    images: []
  },
  '$cube_set_2a0f5a84': {
    title: 'editor.settings.redstoneEnergyTitle',
    desc: 'editor.settings.redstoneEnergyDesc',
    images: []
  },
  '$cube_set_1e2ff19a': {
    title: 'editor.settings.betaDebugTextTitle',
    desc: 'editor.settings.betaDebugTextDesc',
    images: []
  },
  '$cube_set_20ccca31': {
    title: 'editor.settings.progressPercentTitle',
    desc: 'editor.settings.progressPercentDesc',
    images: []
  },
  '$cube_set_c1f8e213': {
    title: 'editor.settings.quickAccessTitle',
    desc: 'editor.settings.quickAccessDesc',
    images: []
  },
  '$cube_set_2abe3412': {
    title: 'editor.settings.worldAdvancedTitle',
    desc: 'editor.settings.worldAdvancedDesc',
    images: []
  },
  '$cube_set_7431c828': {
    title: 'editor.settings.forceSpectatorTitle',
    desc: 'editor.settings.forceSpectatorDesc',
    images: []
  },
  '$cube_set_c4c8702e': {
    title: 'editor.settings.viewPathTitle',
    desc: 'editor.settings.viewPathDesc',
    images: []
  },
  '$cube_set_84b37071': {
    title: 'editor.settings.oldWorldTitle',
    desc: 'editor.settings.oldWorldDesc',
    images: []
  },
  '$cube_set_e1ed717a': {
    title: 'editor.settings.fluencyTitle',
    desc: 'editor.settings.fluencyDesc',
    images: []
  },
  '$cube_set_567cb601': {
    title: 'editor.settings.moreDropdownTitle',
    desc: 'editor.settings.moreDropdownDesc',
    images: []
  },
  '$cube_set_b9a8724e': {
    title: 'editor.settings.enhancedCmdTitle',
    desc: 'editor.settings.enhancedCmdDesc',
    images: []
  },
  '$cube_set_f3c82728': {
    title: 'editor.settings.vanillaBgTitle',
    desc: 'editor.settings.vanillaBgDesc',
    images: []
  },
  '$cube_set_c1919f11': {
    title: 'editor.settings.imageSliceTitle',
    desc: 'editor.settings.imageSliceDesc',
    images: []
  },
  '$cube_set_0de84bac': {
    title: 'editor.settings.featuredServersTitle',
    desc: 'editor.settings.featuredServersDesc',
    images: []
  },
  '$cube_set_c9107c08': {
    title: 'editor.settings.enchantedOnlyTitle',
    desc: 'editor.settings.enchantedOnlyDesc',
    images: []
  },
  '$cube_set_b04cb703': {
    title: 'editor.settings.scrollableCmdTitle',
    desc: 'editor.settings.scrollableCmdDesc',
    images: []
  },
  '$cube_set_557fbdd9': {
    title: 'editor.settings.noteblockOnLoadTitle',
    desc: 'editor.settings.noteblockOnLoadDesc',
    images: []
  },
  '$cube_set_d755287c': {
    title: 'editor.settings.serverFormCoreTitle',
    desc: 'editor.settings.serverFormCoreDesc',
    images: []
  },
  '$cube_set_ff9ae346': {
    title: 'editor.settings.largeSandboxTitle',
    desc: 'editor.settings.largeSandboxDesc',
    images: []
  }
}

const showHelpDialog = ref(false)
const currentHelp = ref({ title: '', desc: '', images: [] })

const getHelpConfig = (id) => helpConfig[id] || null

const openHelp = (id) => {
  const config = helpConfig[id]
  if (!config) return
  currentHelp.value = config
  showHelpDialog.value = true
}

const closeHelp = () => {
  showHelpDialog.value = false
}

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

const hasScrolled = ref(false)
const scrollContainer = ref(null)
const searchQuery = ref('')
const isSearching = computed(() => searchQuery.value.trim() !== '')

const extractedConfig = ref('')
const processedConfig = ref('')
const parsedConfig = ref([])
const expandedSection = ref(-1)
const showDebug = ref(false)
const showCategoryDrawer = ref(false)

const jumpToSection = (index) => {
  showCategoryDrawer.value = false
  searchQuery.value = ''
  expandedSection.value = index
  nextTick(() => {
    setTimeout(() => {
      const el = scrollContainer.value?.querySelector(`[data-section-index="${index}"]`)
      if (el && scrollContainer.value) {
        const rect = el.getBoundingClientRect()
        const containerRect = scrollContainer.value.getBoundingClientRect()
        const scrollOffset = rect.top - containerRect.top + scrollContainer.value.scrollTop - 70
        scrollContainer.value.scrollTo({ top: scrollOffset, behavior: 'smooth' })
      }
    }, 50)
  })
}

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

onMounted(async () => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }

  let variables = await fs.value.read("ui/_global_variables.json")
  variables = variables || {}

  const startMarker = '// ━━━━━━━━━━\n// 配置 | config\n// ━━━━━━━━━━'
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

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('//') && trimmedLine.endsWith('//')) {
      const title = trimmedLine.replaceAll('//', '').trim()
      const [zhTitle, enTitle] = title.includes('|') ? title.split('|').map(t => t.trim()) : [title, title]
      currentSection = {
        text: {
          'zh-cn': zhTitle,
          'en-us': enTitle
        },
        expanded: false,
        options: []
      }
      parsedConfig.value.push(currentSection)
      currentOptions = currentSection.options
    } else if (trimmedLine.startsWith('//') && !trimmedLine.endsWith('//')) {
      const commentText = trimmedLine.replace('//', '').trim()
      currentOptions.push({
        type: 'comment',
        text: commentText
      })
    } else if (trimmedLine === '') {
      currentOptions.push({
        type: 'line'
      })
    } else if (trimmedLine.indexOf('$') !== -1) {
      let [keyPart, commentPart] = trimmedLine.split('//').map(p => p.trim())
      let [key, value] = keyPart.split(':').map(p => p.trim())
      value = value.replace(/,\s*$/, '')
      
      let valueType
      let valueContent
      const commentText = commentPart.includes('|') ? commentPart.split('|').map(t => t.trim()) : [commentPart, commentPart]

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
        
        const optionEntry = {
          type: valueType,
          default: valueContent,
          value: variables[key.slice(1, -1)] || valueContent,
          expanded: false,
          id: key.slice(1, -1),
          text: {
            'zh-cn': commentText[0].split(' | ')[0],
            'en-us': commentText[1].split(' | ')[0].replace('[' + groupOptionsText + ']', '')
          },
          options: groupOptions
        }

        currentOptions.push(optionEntry)
      } else {
        const valueLower = value.toLowerCase()
        if (valueLower === 'true' || valueLower === 'false') {
          valueType = 'boolean'
          valueContent = valueLower === 'true'
        } else if (value.includes('.')) {
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

        const optionEntry = {
          type: valueType,
          default: valueContent,
          value: variables[key.slice(1, -1)] === undefined ? valueContent : variables[key.slice(1, -1)],
          id: key.slice(1, -1),
          text: {
            'zh-cn': commentText[0].replace('[!] ', '').replace('[experiment] ', '').replace('[discarded] ', '').replace('[Only China Edition] ', ''),
            'en-us': commentText[1]
          }
        }

        if (commentPart.includes('[!')) optionEntry.desc = '.unfinished'
        if (commentPart.includes('[experiment')) optionEntry.desc = '.experiment'
        if (commentPart.includes('[discarded')) optionEntry.desc = '.discarded'
        if (commentPart.includes('[Only China Edition')) optionEntry.desc = '.chinaEdition'

        currentOptions.push(optionEntry)
      }
    }
  }

  parsedConfig.value.map(obj => {
    if (obj.options[obj.options.length - 1].type === "line") {
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
  display: flex;
  align-items: center;
  gap: 8px;
  &.scrolled {
    border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .category-menu-btn {
    flex-shrink: 0;
    --mdui-color-on-surface: var(--mdui-color-on-surface-variant);
  }
  .search-field {
    flex: 1;
    width: 100%;
  }
}

.category-drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  z-index: 2002;
}

.category-drawer {
  background-color: rgb(var(--mdui-color-surface));
  width: 300px;
  max-width: 85vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: left center;
  will-change: transform, opacity;
}

.category-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 1);

  h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: rgb(var(--mdui-color-on-surface));
  }
}

.category-drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.drawer-enter-active {
  animation: drawer-overlay-fade 0.3s cubic-bezier(0.05, 0.7, 0.1, 1);
  .category-drawer {
    animation: drawer-slide-in 0.3s cubic-bezier(0.05, 0.7, 0.1, 1);
  }
}
.drawer-leave-active {
  animation: drawer-overlay-fade-leave 0.25s cubic-bezier(0.3, 0, 0.8, 0.15);
  .category-drawer {
    animation: drawer-slide-out 0.25s cubic-bezier(0.3, 0, 0.8, 0.15);
  }
}

@keyframes drawer-slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@keyframes drawer-slide-out {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes drawer-overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes drawer-overlay-fade-leave {
  from { opacity: 1; }
  to { opacity: 0; }
}

.list-container {
  padding: 0.5rem;
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

.option-content {
  flex: 1;
  min-width: 0;

  .option-title-row {
    display: flex;
    align-items: center;
    gap: 6px;

    .help-icon {
      font-size: 18px;
      color: var(--mdui-color-on-surface-variant);
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        color: var(--mdui-color-primary);
      }
    }
  }

  .option-help-desc {
    font-size: 12px;
    color: var(--mdui-color-on-surface-variant);
    margin-top: 2px;
    line-height: 1.4;
  }
}

.help-dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2002;
  padding: 1rem;
}

.help-dialog {
  background-color: rgb(var(--mdui-color-surface));
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: center;
  will-change: transform, opacity;
}

.help-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 1);

  .help-dialog-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: rgb(var(--mdui-color-on-surface));
  }
}

.help-dialog-content {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;

  .help-dialog-desc {
    color: rgb(var(--mdui-color-on-surface-variant));
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }

  .help-images {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .help-image-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .help-image {
        width: 100%;
        border-radius: 8px;
        border: 1px solid rgba(var(--mdui-color-outline-variant), 1);
      }

      .help-image-label {
        text-align: center;
        font-size: 0.8125rem;
        color: rgb(var(--mdui-color-on-surface-variant));
      }
    }
  }
}

.help-dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(var(--mdui-color-outline-variant), 1);
}

.dialog-enter-active {
  animation: dialog-overlay-alpha 0.3s cubic-bezier(0.05, 0.7, 0.1, 1);
  .help-dialog {
    animation: dialog-enter 0.3s cubic-bezier(0.05, 0.7, 0.1, 1);
  }
}
.dialog-leave-active {
  animation: dialog-overlay-alpha-leave 0.2s cubic-bezier(0.3, 0, 0.8, 0.15);
  .help-dialog {
    animation: dialog-leave 0.2s cubic-bezier(0.3, 0, 0.8, 0.15);
  }
}

@keyframes dialog-enter {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dialog-leave {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

@keyframes dialog-overlay-alpha {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialog-overlay-alpha-leave {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>