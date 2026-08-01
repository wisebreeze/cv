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

      <div class="global-color-section">
        <mdui-list-item rounded @click="showGlobalColor = !showGlobalColor">
          <span>{{ t('editor.theme.globalColor') }}</span>
          <div slot="description">{{ t('editor.theme.globalColorDesc') }}</div>
          <div slot="end-icon" style="font-size: 1rem">
            <ion-icon v-if="showGlobalColor" name="chevron-up-outline" />
            <ion-icon v-else name="chevron-down-outline" />
          </div>
        </mdui-list-item>
        <transition name="expanded">
          <div v-if="showGlobalColor" class="global-color-content">
            <div class="color-picker-row">
              <span class="color-label">{{ t('editor.theme.primaryColor') }}</span>
              <div class="color-swatch" :style="primaryColorStyle" @click="openGlobalPicker('primary')" />
            </div>
            <div class="color-picker-row">
              <span class="color-label">{{ t('editor.theme.secondaryColor') }}</span>
              <div class="color-swatch" :style="secondaryColorStyle" @click="openGlobalPicker('secondary')" />
            </div>
            <div class="color-picker-row">
              <span class="color-label">{{ t('editor.theme.alpha') }}</span>
              <mdui-slider :value="globalAlpha" min="0" max="1" step="0.05" @input="globalAlpha = parseFloat($event.target.value)" />
            </div>
            <mdui-button variant="filled" full-width @click="applyGlobalColor" style="margin-top: 12px">
              <ion-icon slot="icon" name="color-wand-outline" />
              {{ t('editor.theme.apply') }}
            </mdui-button>
          </div>
        </transition>
      </div>

      <div class="preview-section">
        <div class="preview-section-title">{{ t('editor.theme.preview') }}</div>
        <div class="preview-card">
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewButton') }}</div>
            <div class="preview-row">
              <div class="preview-btn preview-btn-default">{{ t('editor.theme.stateDefault') }}</div>
              <div class="preview-btn preview-btn-hover">{{ t('editor.theme.stateHover') }}</div>
              <div class="preview-btn preview-btn-pressed">{{ t('editor.theme.statePressed') }}</div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewMainButton') }}</div>
            <div class="preview-row">
              <div class="preview-btn-main preview-btn-main-default">
                <ion-icon name="add-outline" />
                <span>{{ t('editor.theme.stateDefault') }}</span>
              </div>
              <div class="preview-btn-main preview-btn-main-hover">
                <ion-icon name="add-outline" />
                <span>{{ t('editor.theme.stateHover') }}</span>
              </div>
              <div class="preview-btn-main preview-btn-main-pressed">
                <ion-icon name="add-outline" />
                <span>{{ t('editor.theme.statePressed') }}</span>
              </div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewDestructiveButton') }}</div>
            <div class="preview-row">
              <div class="preview-btn-destructive preview-btn-destructive-default">
                <ion-icon name="trash-outline" />
                <span>{{ t('editor.theme.stateDefault') }}</span>
              </div>
              <div class="preview-btn-destructive preview-btn-destructive-hover">
                <ion-icon name="trash-outline" />
                <span>{{ t('editor.theme.stateHover') }}</span>
              </div>
              <div class="preview-btn-destructive preview-btn-destructive-pressed">
                <ion-icon name="trash-outline" />
                <span>{{ t('editor.theme.statePressed') }}</span>
              </div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewLightButton') }}</div>
            <div class="preview-row">
              <div class="preview-btn-light preview-btn-light-default">
                <ion-icon name="settings-outline" />
                <span>{{ t('editor.theme.stateDefault') }}</span>
              </div>
              <div class="preview-btn-light preview-btn-light-hover">
                <ion-icon name="settings-outline" />
                <span>{{ t('editor.theme.stateHover') }}</span>
              </div>
              <div class="preview-btn-light preview-btn-light-pressed">
                <ion-icon name="settings-outline" />
                <span>{{ t('editor.theme.statePressed') }}</span>
              </div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewSwitch') }}</div>
            <div class="preview-row">
              <div class="preview-switch preview-switch-on"><div class="preview-switch-knob" /></div>
              <div class="preview-switch preview-switch-off"><div class="preview-switch-knob" /></div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewSlider') }}</div>
            <div class="preview-slider">
              <div class="preview-slider-track" />
              <div class="preview-slider-fill" />
              <div class="preview-slider-thumb" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewTopbar') }}</div>
            <div class="preview-topbar">
              <ion-icon name="chevron-back-outline" />
              <span>{{ t('editor.theme.previewTopbarTitle') }}</span>
              <div style="flex-grow:1" />
              <ion-icon name="language-outline" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewSegmented') }}</div>
            <div class="preview-segmented">
              <div class="preview-segment preview-segment-active">{{ t('editor.theme.segmentTab1') }}</div>
              <div class="preview-segment">{{ t('editor.theme.segmentTab2') }}</div>
              <div class="preview-segment">{{ t('editor.theme.segmentTab3') }}</div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewInput') }}</div>
            <div class="preview-input">
              <span class="preview-input-placeholder">{{ t('editor.theme.previewInputPlaceholder') }}</span>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewCell') }}</div>
            <div class="preview-cell-row">
              <div class="preview-cell" />
              <div class="preview-cell preview-cell-selected" />
              <div class="preview-cell preview-cell-highlight" />
              <div class="preview-cell" />
              <div class="preview-cell" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewContainer') }}</div>
            <div class="preview-container">
              <div class="preview-container-item" />
              <div class="preview-container-item" />
              <div class="preview-container-item preview-container-item-full" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewScroll') }}</div>
            <div class="preview-scroll">
              <div class="preview-scroll-track" />
              <div class="preview-scroll-thumb" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewProgress') }}</div>
            <div class="preview-progress">
              <div class="preview-progress-track" />
              <div class="preview-progress-fill" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewDropdown') }}</div>
            <div class="preview-dropdown">
              <span>{{ t('editor.theme.previewDropdownLabel') }}</span>
              <ion-icon name="chevron-down-outline" />
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewRadio') }}</div>
            <div class="preview-row">
              <div class="preview-radio preview-radio-on"><div class="preview-radio-dot" /></div>
              <span>{{ t('editor.theme.previewRadioOn') }}</span>
              <div class="preview-radio preview-radio-off" />
              <span>{{ t('editor.theme.previewRadioOff') }}</span>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewSidebar') }}</div>
            <div class="preview-sidebar">
              <div class="preview-sidebar-item preview-sidebar-item-active">{{ t('editor.theme.previewSidebarItem1') }}</div>
              <div class="preview-sidebar-item">{{ t('editor.theme.previewSidebarItem2') }}</div>
              <div class="preview-sidebar-item">{{ t('editor.theme.previewSidebarItem3') }}</div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewUnderline') }}</div>
            <div class="preview-underline" />
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewDivider') }}</div>
            <div class="preview-divider" />
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewTooltip') }}</div>
            <div class="preview-tooltip">{{ t('editor.theme.previewTooltipText') }}</div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewDialog') }}</div>
            <div class="preview-dialog">
              <div class="preview-dialog-header">{{ t('editor.theme.previewDialogTitle') }}</div>
              <div class="preview-dialog-body">{{ t('editor.theme.previewDialogBody') }}</div>
              <div class="preview-dialog-actions">
                <span>{{ t('gui$cancel') }}</span>
                <span class="preview-dialog-confirm">{{ t('gui$confirm') }}</span>
              </div>
            </div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewToast') }}</div>
            <div class="preview-toast">{{ t('editor.theme.previewToastText') }}</div>
          </div>
          <div class="preview-group">
            <div class="preview-group-title">{{ t('editor.theme.previewBadge') }}</div>
            <div class="preview-badge-row">
              <div class="preview-badge">{{ t('editor.theme.previewBadgeText') }}</div>
              <div class="preview-corner">
                <div class="preview-corner-dot" />
              </div>
            </div>
          </div>
        </div>
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
                  <div>{{ getText(option.text) }}</div>
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
                <mdui-list-item rounded v-else-if="option.type === 'float'" @click="expandedColorPicker = expandedColorPicker === option.id ? '' : option.id">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <div slot="end-icon" class="color-preview" :style="alphaPreview(option.value)"/>
                </mdui-list-item>
                <mdui-list-item rounded v-else-if="option.type === 'color'" @click="expandedColorPicker = expandedColorPicker === option.id ? '' : option.id">
                  <div>{{ getText(option.text) }}</div>
                  <div slot="description" v-if="option.desc">{{ option.desc.startsWith(".") ? t("editor.settings" + option.desc) : option.desc }}</div>
                  <div slot="end-icon" class="color-preview" :style="colorPreview(option.previewValue)"/>
                </mdui-list-item>
                <Transition name="expanded">
                  <Palette
                    v-if="(option.type === 'color' || option.type === 'float') && expandedColorPicker === option.id"
                    v-model="option.previewValue"
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

    <Transition name="drawer">
      <div v-if="showCategoryDrawer" class="category-drawer-overlay" @click.self="showCategoryDrawer = false">
        <div class="category-drawer">
          <div class="category-drawer-header">
            <h2>{{ t('theme$title') }}</h2>
            <div class="drawer-header-actions">
              <mdui-button-icon @click="showResetDialog = true">
                <ion-icon name="refresh-outline"></ion-icon>
              </mdui-button-icon>
              <mdui-button-icon @click="showCategoryDrawer = false">
                <ion-icon name="close-outline"></ion-icon>
              </mdui-button-icon>
            </div>
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
      <div v-if="showResetDialog" class="help-dialog-overlay" @click.self="showResetDialog = false">
        <div class="help-dialog reset-dialog">
          <div class="help-dialog-content">
            <h2 class="reset-dialog-title">{{ t('editor.resetThemeTitle') }}</h2>
            <p class="help-dialog-desc">{{ t('editor.resetThemeConfirm') }}</p>
          </div>
          <div class="reset-dialog-actions">
            <mdui-button variant="text" @click="showResetDialog = false">
              {{ t('gui$cancel') }}
            </mdui-button>
            <mdui-button variant="filled" @click="resetToDefaults">
              {{ t('gui$confirm') }}
            </mdui-button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import Topbar from '../components/Topbar.vue'
import Palette from '../components/Palette'
import { inject, ref, onBeforeUnmount, onMounted, computed, watch, nextTick } from 'vue'
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
const showCategoryDrawer = ref(false)
const showResetDialog = ref(false)
const showGlobalColor = ref(false)
const globalPrimaryColor = ref([0.325, 0.427, 0.996])
const globalSecondaryColor = ref([0.549, 0.62, 1])
const globalAlpha = ref(1)
const showGlobalPicker = ref(false)
const globalPickerTarget = ref('primary')

const primaryColorStyle = computed(() => ({
  background: `rgb(${Math.round(globalPrimaryColor.value[0] * 255)}, ${Math.round(globalPrimaryColor.value[1] * 255)}, ${Math.round(globalPrimaryColor.value[2] * 255)})`
}))

const secondaryColorStyle = computed(() => ({
  background: `rgb(${Math.round(globalSecondaryColor.value[0] * 255)}, ${Math.round(globalSecondaryColor.value[1] * 255)}, ${Math.round(globalSecondaryColor.value[2] * 255)})`
}))

const openGlobalPicker = (target) => {
  globalPickerTarget.value = target
  showGlobalPicker.value = true
}

const applyGlobalColor = async () => {
  const primary = globalPrimaryColor.value
  const secondary = globalSecondaryColor.value
  const alpha = globalAlpha.value

  // Derive hover (lighter) and pressed (darker) variants
  const hover = primary.map(c => Math.min(1, c + 0.1))
  const pressed = primary.map(c => Math.max(0, c - 0.1))
  const secHover = secondary.map(c => Math.min(1, c + 0.1))

  const updates = {
    '$cube_main_color': primary,
    '$cube_button_main_default_color': primary,
    '$cube_button_main_hover_color': hover,
    '$cube_button_main_pressed_color': pressed,
    '$cube_button_main_locked_color': [0.91, 0.918, 0.965],
    '$cube_button_destructive_default_color': [0.69, 0, 0.125],
    '$cube_button_destructive_hover_color': [0.776, 0.157, 0.157],
    '$cube_button_destructive_pressed_color': [0.498, 0, 0],
    '$cube_button_light_default_color': [0.8, 0.8, 0.8],
    '$cube_button_light_hover_color': [0.7, 0.7, 0.7],
    '$cube_button_light_pressed_color': [0.7, 0.7, 0.7],
    '$cube_button_transparent_default_color': [0.922, 0.922, 0.922],
    '$cube_button_transparent_hover_color': secHover,
    '$cube_button_transparent_pressed_color': secHover,
    '$cube_toggle_indicator_checked_color': primary,
    '$cube_toggle_indicator_unchecked_color': primary,
    '$cube_slider_progress_default_color': primary,
    '$cube_slider_progress_hover_color': secHover,
    '$cube_cell_selected_color': secHover,
    '$cube_cell_highlight_color': secHover,
    '$cube_container_components_full_color': primary,
    '$cube_progress_full_color': [0.91, 0.918, 0.965],
    '$cube_bar_color': primary,
    '$cube_icon_color': [0.922, 0.922, 0.922],
    '$cube_text_color': [0.922, 0.922, 0.922],
    '$cube_text_title_color': [0.922, 0.922, 0.922],
    '$cube_button_text_color': [0.922, 0.922, 0.922],
    '$cube_button_glyph_default_color': [0.922, 0.922, 0.922],
    '$cube_slider_button_default_color': [0.922, 0.922, 0.922],
    '$cube_corner_master_color': primary,
  }

  // Apply alpha to relevant alpha variables
  const alphaUpdates = {
    '$cube_control_bg_alpha': alpha * 0.45,
    '$cube_light_bg_alpha': alpha * 0.35,
    '$cube_slider_background_alpha': alpha * 0.3,
    '$cube_cell_alpha': alpha * 0.3,
    '$cube_container_components_alpha': alpha * 0.4,
    '$cube_scroll_track_alpha': alpha * 0.3,
    '$cube_scroll_box_alpha': alpha * 0.6,
    '$cube_progress_empty_alpha': alpha * 0.3,
    '$cube_progress_full_alpha': alpha * 0.6,
    '$cube_dropdown_background_alpha': alpha * 0.3,
    '$cube_radio_background_alpha': alpha * 0.3,
    '$cube_sidebar_alpha': alpha * 0.3,
    '$cube_tooltip_background_alpha': alpha * 0.6,
    '$cube_underline_alpha': alpha * 0.3,
    '$cube_divider_alpha': alpha * 0.3,
    '$cube_dialog_overlay_alpha': alpha * 0.15,
    '$cube_dialog_background_alpha': alpha * 0.6,
    '$cube_toast_background_alpha': alpha * 0.6,
    '$cube_corner_master_alpha': alpha * 0.6,
  }

  let file = await fs.value.read("ui/_global_variables.json")
  file = file || {}

  // Apply color updates
  for (const [key, value] of Object.entries(updates)) {
    file[key] = value
  }
  // Apply alpha updates
  for (const [key, value] of Object.entries(alphaUpdates)) {
    file[key] = value
  }

  fs.value.write("ui/_global_variables.json", file)

  // Update parsedConfig option values to reflect changes
  parsedConfig.value.forEach(section => {
    section.options.forEach(option => {
      if (updates[option.id]) {
        option.value = [...updates[option.id]]
      } else if (alphaUpdates[option.id] !== undefined) {
        option.value = alphaUpdates[option.id]
      }
    })
  })

  showGlobalColor.value = false
}

const resetToDefaults = async () => {
  const allIds = []
  parsedConfig.value.forEach(section => {
    section.options.forEach(option => {
      if (option.id && option.default !== undefined) {
        option.value = option.default
        allIds.push(option.id)
      }
    })
  })
  if (allIds.length > 0) {
    await removeVariables(allIds.join(','))
  }
  showResetDialog.value = false
}

const jumpToSection = (index) => {
  showCategoryDrawer.value = false
  searchQuery.value = ''
  expandedSection.value = index
  nextTick(() => {
    setTimeout(() => {
      const el = scrollContainer.value?.querySelector(`[data-section-index="${index}"]`)
      if (el && scrollContainer.value) {
        const searchEl = scrollContainer.value.querySelector('.search-container')
        const headerHeight = searchEl ? searchEl.getBoundingClientRect().height : 80
        const rect = el.getBoundingClientRect()
        const containerRect = scrollContainer.value.getBoundingClientRect()
        const scrollOffset = rect.top - containerRect.top + scrollContainer.value.scrollTop - headerHeight - 8
        scrollContainer.value.scrollTo({ top: scrollOffset, behavior: 'smooth' })
      }
    }, 350)
  })
}
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
  const value = typeof option.previewValue === "object" ? option.previewValue.map((v, i) => i < 3 ? parseFloat((v / 255).toFixed(3)) : v) : option.previewValue
  saveOption(option, value)
}

onMounted(async () => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }

  let variables = await fs.value.read("ui/_global_variables.json")
  variables = variables || {}

  const startMarker = '// ━━━━━━━━━━\n// 主题 | theme\n// ━━━━━━━━━━'
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
        let [keyPart, commentText] = trimmedLine.split('//').map(p => p.trim())
        let [key, value] = keyPart.split(':').map(p => p.trim())
        if (excludeArray.includes(key.slice(1, -1))) continue 
        value = value.replace(/,\s*$/, '')
  
        let valueType
        let valueContent
  
        const valueLower = value.toLowerCase()
        if (valueLower === 'true' || valueLower === 'false') {
          valueType = 'boolean'
          valueContent = valueLower === 'true'
        } else if (value.includes('[') && value.includes(']')) {
          valueType = 'color'
          valueContent = JSON.parse(value)
        } else if (value.includes('.') && !value.includes('"')) {
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
        const target = variables[key.slice(1, -1)] === undefined ? valueContent : variables[key.slice(1, -1)]
        const previewValue = typeof target === 'object' ? target.map((val, i) => 
          i < 3 ? Math.round(val * 255) : val
        ) : target
        const optionEntry = {
          type: valueType,
          default: valueContent,
          previewValue: previewValue,
          value: target,
          id: key.slice(1, -1),
          text: {
            'zh-cn': commentText.replace('[!] ', '').replace('[experiment] ', '').replace('[discarded] ', '').replace('[only china edition] ', ''),
            'en-us': key.slice(1, -1).replace("$cube_theme_","").replace("$cube_","").replaceAll("_", " ")
          }
        }
  
        if (commentText.includes('[!')) optionEntry.desc = '.unfinished'
        if (commentText.includes('[experiment')) optionEntry.desc = '.experiment'
        if (commentText.includes('[discarded')) optionEntry.desc = '.discarded'
        if (commentText.includes('[only china edition')) optionEntry.desc = '.chinaEdition'
  
        currentOptions.push(optionEntry)
      } catch (e) {
        console.error(e)
      }
    }
  }

  parsedConfig.value = parsedConfig.value.slice(1).filter(obj => obj.options.length !== 0)
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

  .drawer-header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
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

.help-dialog-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;

  .help-dialog-desc {
    color: rgb(var(--mdui-color-on-surface-variant));
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0;
  }
}

.reset-dialog {
  max-width: 400px;
  border-radius: 28px;
}

.reset-dialog-title {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: rgb(var(--mdui-color-on-surface));
  line-height: 1.5;
}

.reset-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 1.5rem 1.5rem;
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
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes dialog-leave {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}
@keyframes dialog-overlay-alpha {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dialog-overlay-alpha-leave {
  from { opacity: 1; }
  to { opacity: 0; }
}

.list-container {
  padding: 0.5rem;
}

.global-color-section {
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
}

.global-color-content {
  padding: 1rem;
  background-color: rgba(var(--mdui-color-primary), 0.06);
  border-radius: 12px;
  margin-top: 0.2rem;

  .color-picker-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .color-label {
      font-size: 14px;
      color: var(--mdui-color-on-surface-variant);
      min-width: 80px;
    }

    .color-swatch {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid rgba(var(--mdui-color-outline-variant), 1);
      flex-shrink: 0;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }
    }

    mdui-slider {
      flex: 1;
    }
  }
}

.preview-section {
  padding: 0 0.5rem;
  margin-bottom: 1rem;
}

.preview-section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--mdui-color-on-surface);
  padding: 0.5rem 0;
}

.preview-card {
  background-color: rgba(var(--mdui-color-surface-container), 0.6);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-group {
  .preview-group-title {
    font-size: 12px;
    color: var(--mdui-color-on-surface-variant);
    margin-bottom: 8px;
  }
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-btn {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgb(0.922, 0.922, 0.922);
  border: 1px solid rgba(0.922, 0.922, 0.922, 0.2);

  &.preview-btn-default { background-color: rgba(0, 0, 0, 0.3); }
  &.preview-btn-hover { background-color: rgba(0.5, 0.5, 0.5, 0.3); }
  &.preview-btn-pressed { background-color: rgba(0, 0, 0, 0.5); }
}

.preview-btn-main {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: rgb(0.922, 0.922, 0.922);

  ion-icon { font-size: 16px; }

  &.preview-btn-main-default { background-color: rgb(0.325, 0.427, 0.996); }
  &.preview-btn-main-hover { background-color: rgb(0.425, 0.527, 1); }
  &.preview-btn-main-pressed { background-color: rgb(0.225, 0.327, 0.896); }
}

.preview-btn-destructive {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: rgb(0.922, 0.922, 0.922);

  ion-icon { font-size: 16px; }

  &.preview-btn-destructive-default { background-color: rgb(0.69, 0, 0.125); }
  &.preview-btn-destructive-hover { background-color: rgb(0.776, 0.157, 0.157); }
  &.preview-btn-destructive-pressed { background-color: rgb(0.498, 0, 0); }
}

.preview-btn-light {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: rgb(0.922, 0.922, 0.922);

  ion-icon { font-size: 16px; }

  &.preview-btn-light-default { background-color: rgb(0.8, 0.8, 0.8); color: #222; }
  &.preview-btn-light-hover { background-color: rgb(0.7, 0.7, 0.7); color: #222; }
  &.preview-btn-light-pressed { background-color: rgb(0.7, 0.7, 0.7); color: #222; }
}

.preview-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  position: relative;
  transition: background-color 0.2s;

  &.preview-switch-on { background-color: rgb(0.325, 0.427, 0.996); }
  &.preview-switch-off { background-color: rgba(0.922, 0.922, 0.922, 0.3); }

  .preview-switch-knob {
    position: absolute;
    top: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: rgb(0.922, 0.922, 0.922);
    transition: left 0.2s;
  }

  &.preview-switch-on .preview-switch-knob { left: 23px; }
  &.preview-switch-off .preview-switch-knob { left: 3px; }
}

.preview-slider {
  position: relative;
  height: 24px;
  width: 100%;
  max-width: 200px;

  .preview-slider-track {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 2px;
    background-color: rgba(0.09, 0.09, 0.09, 0.3);
  }

  .preview-slider-fill {
    position: absolute;
    top: 10px;
    left: 0;
    width: 60%;
    height: 4px;
    border-radius: 2px;
    background-color: rgb(0.325, 0.427, 0.996);
  }

  .preview-slider-thumb {
    position: absolute;
    top: 4px;
    left: calc(60% - 10px);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: rgb(0.922, 0.922, 0.922);
  }
}

.preview-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(0.09, 0.09, 0.09, 0.4);
  border-radius: 8px;
  color: rgb(0.922, 0.922, 0.922);
  font-size: 14px;

  ion-icon { font-size: 20px; }
}

.preview-segmented {
  display: flex;
  background-color: rgba(0.09, 0.09, 0.09, 0.3);
  border-radius: 8px;
  overflow: hidden;

  .preview-segment {
    flex: 1;
    padding: 6px 12px;
    text-align: center;
    font-size: 13px;
    color: rgb(0.922, 0.922, 0.922);
    cursor: pointer;

    &.preview-segment-active {
      background-color: rgb(0.325, 0.427, 0.996);
    }
  }
}

.preview-input {
  padding: 10px 12px;
  background-color: rgba(0.09, 0.09, 0.09, 0.3);
  border-radius: 8px;
  border-bottom: 2px solid rgb(0.325, 0.427, 0.996);

  .preview-input-placeholder {
    color: rgba(0.922, 0.922, 0.922, 0.5);
    font-size: 14px;
  }
}

.preview-cell-row {
  display: flex;
  gap: 4px;

  .preview-cell {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background-color: rgba(0.61, 0.61, 0.61, 0.3);

    &.preview-cell-selected { background-color: rgb(0.549, 0.62, 1); }
    &.preview-cell-highlight { background-color: rgba(0.549, 0.62, 1, 0.3); }
  }
}

.preview-container {
  display: flex;
  gap: 4px;

  .preview-container-item {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    background-color: rgba(0.922, 0.922, 0.922, 0.4);

    &.preview-container-item-full { background-color: rgb(0.325, 0.427, 0.996); }
  }
}

.preview-scroll {
  width: 100%;
  max-width: 200px;
  height: 80px;
  background-color: rgba(0.09, 0.09, 0.09, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  .preview-scroll-track {
    position: absolute;
    right: 4px;
    top: 4px;
    bottom: 4px;
    width: 4px;
    border-radius: 2px;
    background-color: rgba(0.09, 0.09, 0.09, 0.3);
  }

  .preview-scroll-thumb {
    position: absolute;
    right: 4px;
    top: 4px;
    width: 4px;
    height: 30px;
    border-radius: 2px;
    background-color: rgba(0.85, 0.85, 0.9, 0.6);
  }
}

.preview-progress {
  width: 100%;
  max-width: 200px;
  height: 8px;
  border-radius: 4px;
  background-color: rgba(0.09, 0.09, 0.09, 0.3);
  overflow: hidden;

  .preview-progress-fill {
    width: 60%;
    height: 100%;
    background-color: rgba(0.91, 0.918, 0.965, 0.6);
  }
}

.preview-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: rgba(0.09, 0.09, 0.09, 0.3);
  border-radius: 8px;
  color: rgb(0.922, 0.922, 0.922);
  font-size: 14px;
  max-width: 200px;

  ion-icon { font-size: 18px; }
}

.preview-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgb(0.325, 0.427, 0.996);
  position: relative;
  flex-shrink: 0;

  &.preview-radio-on {
    .preview-radio-dot {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgb(0.325, 0.427, 0.996);
    }
  }

  &.preview-radio-off {
    border-color: rgba(0.922, 0.922, 0.922, 0.5);
  }
}

.preview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 200px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px;

  .preview-sidebar-item {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: rgb(0.922, 0.922, 0.922);

    &.preview-sidebar-item-active {
      background-color: rgba(0.325, 0.427, 0.996, 0.2);
      color: rgb(0.549, 0.62, 1);
    }
  }
}

.preview-underline {
  width: 100%;
  max-width: 200px;
  height: 2px;
  background-color: rgba(0.09, 0.09, 0.09, 0.3);
}

.preview-divider {
  width: 100%;
  max-width: 200px;
  height: 1px;
  background-color: rgba(0.9, 0.9, 0.9, 0.3);
}

.preview-tooltip {
  display: inline-block;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  color: rgb(0.922, 0.922, 0.922);
  font-size: 13px;
}

.preview-dialog {
  width: 100%;
  max-width: 280px;
  background-color: rgba(0.09, 0.09, 0.09, 0.6);
  border-radius: 16px;
  overflow: hidden;

  .preview-dialog-header {
    padding: 16px 16px 8px;
    font-size: 16px;
    font-weight: 500;
    color: rgb(0.922, 0.922, 0.922);
  }

  .preview-dialog-body {
    padding: 0 16px 16px;
    font-size: 14px;
    color: rgba(0.922, 0.922, 0.922, 0.7);
  }

  .preview-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 16px 12px;

    span {
      font-size: 14px;
      color: rgb(0.549, 0.62, 1);
      cursor: pointer;
    }
  }
}

.preview-toast {
  display: inline-block;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  color: rgb(0.922, 0.922, 0.922);
  font-size: 14px;
}

.preview-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .preview-badge {
    display: inline-block;
    padding: 2px 8px;
    background-color: rgba(0.325, 0.427, 0.996, 0.6);
    border-radius: 8px;
    color: rgb(0.922, 0.922, 0.922);
    font-size: 12px;
  }

  .preview-corner {
    position: relative;
    width: 32px;
    height: 32px;
    background-color: rgba(0.325, 0.427, 0.996, 0.6);
    border-radius: 50%;

    .preview-corner-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(1, 0, 0, 0.8);
    }
  }
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