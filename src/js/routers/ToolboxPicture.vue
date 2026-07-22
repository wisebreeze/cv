<template>
<div>
  <Topbar />
  <div id="content" class="ns" style="height: var(--window-height);box-sizing: border-box;overflow-y: auto">
    <div class="picture-editor-container">
      <!-- 顶栏 -->
      <div class="editor-header">
        <div class="file-info">
          <div class="file-name">{{ fileName || t('toolbox.picture.untitled') }}</div>
          <div class="file-format" v-if="fileFormat">{{ fileFormat.toUpperCase() }}</div>
        </div>
        
        <div class="header-actions">
          <mdui-tooltip :content="t('toolbox.picture.import')" placement="bottom-middle">
            <mdui-button-icon @click="importImage">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
                <path d="M19,19V5H5V19H19M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z" />
              </svg>
            </mdui-button-icon>
          </mdui-tooltip>
          
          <mdui-tooltip :content="t('toolbox.picture.save')" placement="bottom-end">
            <mdui-button-icon @click="showSaveDialog = true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
                <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
              </svg>
            </mdui-button-icon>
          </mdui-tooltip>
        </div>
      </div>
      
      <!-- 视图 -->
      <div class="editor-content" ref="editorContent"
       @touchstart="handleTouchStart"
       @touchmove="handleTouchMove"
       @touchend="handleTouchEnd"
       @mousedown="handleMouseDown"
       @mousemove="handleMouseMove"
       @mouseup="handleMouseUp"
       @mouseleave="handleMouseUp">
        <div class="image-container" ref="canvasWrapper" 
             :style="{ transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})` }">
          <canvas ref="mainCanvas"></canvas>
        </div>
      </div>
      
      <!-- 工具栏 -->
      <div v-if="activeTool === 'brush'" class="brush-toolbar">
        <div class="toolbar-content">
          <div class="size-control">
            <mdui-slider 
              :value="brushSize" 
              @change="brushSize = $event.target.value || 1"
              style="width: 120px; margin: 0 12px;"
            />
            <span>{{ brushSize }}px</span>
          </div>
          
          <div class="color-preview" :style="{ backgroundColor: `rgba(${selectedColor.join(',')})` }"></div>
        </div>
      </div>
      <div v-if="activeTool === 'eraser'" class="eraser-toolbar">
        <div class="toolbar-content">
          <div class="size-control">
            <mdui-slider 
              :value="eraserSize" 
              @change="eraserSize = $event.target.value || 1"
              style="width: 120px; margin: 0 12px;"
            />
            <span>{{ eraserSize }}px</span>
          </div>
        </div>
      </div>
      <div v-if="activeTool === 'paintBucket'" class="paintbucket-toolbar">
        <div class="toolbar-content">
          <span>{{ t('toolbox.picture.antiAlias') }}</span>
          <mdui-switch 
            :checked="paintBucketAntiAlias" 
            @change="paintBucketAntiAlias = $event.target.checked"
          />
          <div class="color-preview" :style="{ backgroundColor: `rgba(${selectedColor.join(',')})` }"></div>
        </div>
      </div>
      <div v-if="activeTool === 'move'" class="move-toolbar">
        <mdui-button-icon @click="resetPosition">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16M12,3C7.03,3 3,7.03 3,12C3,16.97 7.03,21 12,21C16.97,21 21,16.97 21,12C21,7.03 16.97,3 12,3Z" />
          </svg>
        </mdui-button-icon>
        <mdui-button-icon
          @click="moveImage(-10, 0)"
          @touchstart="startMoving(-10, 0)"
          @touchend="stopMoving"
          @mousedown="startMoving(-10, 0)"
          @mouseup="stopMoving"
          @mouseleave="stopMoving">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
        </mdui-button-icon>
        
        <mdui-button-icon
          @click="moveImage(0, -10)"
          @touchstart="startMoving(0, -10)"
          @touchend="stopMoving"
          @mousedown="startMoving(0, -10)" 
          @mouseup="stopMoving" 
          @mouseleave="stopMoving">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
          </svg>
        </mdui-button-icon>
        
        <mdui-button-icon
          @click="moveImage(0, 10)"
          @touchstart="startMoving(0, 10)"
          @touchend="stopMoving"
          @mousedown="startMoving(0, 10)" 
          @mouseup="stopMoving" 
          @mouseleave="stopMoving">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </mdui-button-icon>
        
        <mdui-button-icon
          @click="moveImage(10, 0)"
          @touchstart="startMoving(10, 0)"
          @touchend="stopMoving"
          @mousedown="startMoving(10, 0)" 
          @mouseup="stopMoving" 
          @mouseleave="stopMoving">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
        </mdui-button-icon>
      </div>
      <div v-if="activeTool === 'zoom'" class="zoom-toolbar">
        <mdui-button-icon
          @touchstart="startZooming(-0.1)"
          @touchend="stopZooming"
          @mousedown="startZooming(-0.1)"
          @mouseup="stopZooming"
          @mouseleave="stopZooming">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M19,13H5V11H19V13Z" />
          </svg>
        </mdui-button-icon>
        
        <mdui-button-icon
          @touchstart="startZooming(0.1)"
          @touchend="stopZooming"
          @mousedown="startZooming(0.1)"
          @mouseup="stopZooming"
          @mouseleave="stopZooming">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
        </mdui-button-icon>
      </div>
      <div class="editor-tools">
        <mdui-tooltip :content="t('toolbox.picture.color')">
          <mdui-button-icon @click="showColorDialog = true" :variant="activeTool === 'color' ? 'tonal' : 'text'">
            <div class="color-icon" :style="{ backgroundColor: `rgb(${selectedColor.join(',')})` }"></div>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.text')">
          <mdui-button-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.brush')">
          <mdui-button-icon @click="setActiveTool('brush')" :variant="activeTool === 'brush' ? 'tonal' : 'text'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.paintBucket')">
          <mdui-button-icon @click="setActiveTool('paintBucket')" :variant="activeTool === 'paintBucket' ? 'tonal' : 'text'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"/>
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.eraser')">
          <mdui-button-icon @click="setActiveTool('eraser')" :variant="activeTool === 'eraser' ? 'tonal' : 'text'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.filter')">
          <mdui-button-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M21,8H3V6H21M9,13H21V11H9M9,18H21V16H9" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.undo')" @click="undo">
          <mdui-button-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.redo')" @click="redo">
          <mdui-button-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.move')">
          <mdui-button-icon @click="setActiveTool('move')" :variant="activeTool === 'move' ? 'tonal' : 'text'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.crop')">
          <mdui-button-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M7,17V1H5V5H1V7H5V17A2,2 0 0,0 7,19H17V23H19V19H23V17M17,15H19V7C19,5.89 18.1,5 17,5H9V7H17V15Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.zoom')">
          <mdui-button-icon @click="setActiveTool('zoom')" :variant="activeTool === 'zoom' ? 'tonal' : 'text'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.history')">
          <mdui-button-icon @click="openHistoryDialog = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.layer')">
          <mdui-button-icon @click="openLayerDialog = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="t('toolbox.picture.shape')">
          <mdui-button-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 24px;height: 24px;">
              <path d="M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z" />
            </svg>
          </mdui-button-icon>
        </mdui-tooltip>
      </div>
      
      <!-- 保存对话框 -->
      <mdui-dialog :open="showSaveDialog" @open="onSaveOpen" @close="showSaveDialog = false">
        <div class="save-dialog">
          <div class="preview-container">
            <img v-if="previewSrc" :src="previewSrc" alt="Preview" />
            <div v-else class="no-preview">{{ t('toolbox.picture.noImage') }}</div>
          </div>
          
          <div class="save-controls">
            <mdui-text-field :label="t('toolbox.picture.fileName')" :value="saveFileName" @input="saveFileName = $event.target.value"></mdui-text-field>
            
            <div class="format-selector">
              <Select 
                :label="t('toolbox.picture.format')"
                :value="saveFormat"
                :options="formatOptions"
                @change="handleFormatChange"
              />
            </div>
            
            <div v-if="saveFormat === 'jpg'" class="quality-slider">
              <div class="slider-label">
                {{ t('toolbox.picture.quality') }}: {{ quality }}%
              </div>
              <mdui-slider :value="quality" @input="quality = $event.target.value" class="slider" />
            </div>
            
            <div class="dialog-actions">
              <mdui-button variant="text" style="margin-right: 0.2rem;" @click="showSaveDialog = false">{{ t('toolbox.picture.cancel') }}</mdui-button>
              <mdui-button @click="saveImage">{{ t('toolbox.picture.save') }}</mdui-button>
            </div>
          </div>
        </div>
      </mdui-dialog>

      <!-- 选择颜色对话框 -->
      <mdui-dialog :open="showColorDialog" @open="previewSrc = mainCanvas ? mainCanvas.toDataURL() : ''" @close="showColorDialog = false">
        <div class="color-dialog">
          <h3 class="dialog-title">{{ t('toolbox.picture.selectColor') }}</h3>
          
          <Palette 
            v-model="tempColor" 
            @change="handleColorChange"
          />
          
          <div class="dialog-actions">
            <mdui-button variant="text" @click="showColorDialog = false">
              {{ t('toolbox.picture.cancel') }}
            </mdui-button>
            <mdui-button @click="confirmColor">
              {{ t('toolbox.picture.confirm') }}
            </mdui-button>
          </div>
        </div>
      </mdui-dialog>

      <!-- 历史记录弹窗 -->
      <mdui-dialog :open="openHistoryDialog" @close="openHistoryDialog = false">
        <div class="history-dialog">
          <h3 class="dialog-title">{{ t('toolbox.picture.history') }}</h3>
          
          <div class="history-list">
            <div 
              v-for="(item, index) in activeLayer?.history || []" 
              :key="index"
              class="history-item"
              :class="{
                active: index === activeLayer?.historyIdx,
                future: index > activeLayer?.historyIdx
              }"
              @click="jumpToHistory(index)"
            >
              <div class="history-action">
                <span class="history-icon">
                  <svg v-if="item.tool === 'brush'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"/>
                  </svg>
                  <svg v-else-if="item.tool === 'eraser'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"/>
                  </svg>
                  <svg v-else-if="item.tool === 'paintBucket'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                </span>
                {{ item.label || t('toolbox.picture.unknownAction') }}
              </div>
              <div class="history-time" v-if="index === 0">
                {{ t('toolbox.picture.initialState') }}
              </div>
            </div>
          </div>
        </div>
        
        <mdui-button slot="action" @click="openHistoryDialog = false">
          {{ t('toolbox.picture.confirm') }}
        </mdui-button>
      </mdui-dialog>

      <!-- 图层弹窗 -->
      <mdui-dialog :open="openLayerDialog" @close="openLayerDialog = false">
        <div class="layer-dialog">
          <h3 class="dialog-title">{{ t('toolbox.picture.layer') }}</h3>
          <div class="layer-sticky-bar">
            <mdui-button-icon @click="addLayer" :title="t('toolbox.picture.addLayer')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </mdui-button-icon>
            <mdui-button-icon 
              @click="moveLayerDown(activeLayerId)"
              :disabled="!canMoveDown"
              :title="t('toolbox.picture.moveUp')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
            </mdui-button-icon>
            <mdui-button-icon 
              @click="moveLayerUp(activeLayerId)"
              :disabled="!canMoveUp"
              :title="t('toolbox.picture.moveDown')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
              </svg>
            </mdui-button-icon>
            <mdui-button-icon 
              @click="duplicateLayer(activeLayerId)"
              :title="t('toolbox.picture.duplicateLayer')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/>
              </svg>
            </mdui-button-icon>
            <mdui-button-icon 
              @click="confirmDeleteLayer(activeLayerId)"
              :disabled="activeLayerId === 0"
              :title="t('toolbox.picture.deleteLayer')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </mdui-button-icon>
          </div>
          <div class="layer-list">
            <div
              v-for="(layer, index) in [...layers].reverse()"
              :key="layer.id"
              class="layer-item"
              :class="{ active: layer.id === activeLayerId }"
            >
              <div class="layer-info" @click="selectLayer(layer.id)">
                <mdui-button-icon 
                  @click.stop="toggleLayerVisibility(layer.id)"
                  class="visibility-icon"
                  :title="layer.visible ? t('toolbox.picture.hideLayer') : t('toolbox.picture.showLayer')"
                >
                  <svg v-if="layer.visible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                </mdui-button-icon>
                
                <mdui-button-icon 
                  @click.stop="toggleLayerLock(layer.id)"
                  class="lock-icon"
                  :title="layer.locked ? t('toolbox.picture.unlockLayer') : t('toolbox.picture.lockLayer')"
                >
                  <svg v-if="layer.locked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                </mdui-button-icon>
                
                <div class="layer-name">{{ layer.name }}</div>
              </div>
              <div class="layer-actions">
                <mdui-button-icon @click.stop="renameLayerPrompt(layer)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentcolor;width: 20px;height: 20px;">
                    <path d="M5,3C3.89,3 3,3.89 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z" />
                  </svg>
                </mdui-button-icon>
              </div>
            </div>
          </div>
        </div>
        <mdui-button slot="action" @click="openLayerDialog = false">{{ t('toolbox.picture.confirm') }}</mdui-button>
      </mdui-dialog>

      <!-- 文件导入输入 -->
      <input type="file" ref="fileInput" @change="handleFileImport" accept="image/*,.cpp" style="display: none" />
    </div>
  </div>
</div>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Topbar from '../components/Topbar'
import Palette from '../components/Palette.vue'
import Select from '../components/Select.vue'

const { t } = useI18n()

// 编辑器状态
const mainCanvas = ref(null)
const ctx = ref(null)
const imageSrc = ref('')
const previewSrc = ref('')
const fileName = ref('')
const fileFormat = ref('')
const zoomLevel = ref(1)
const showSaveDialog = ref(false)
const saveFileName = ref('')
const saveFormat = ref('png')
const quality = ref(80)

// 双指缩放状态
const initialDistance = ref(0)
const initialZoom = ref(1)
const isPinching = ref(false)

// DOM 引用
const fileInput = ref(null)
const editorContent = ref(null)
const canvasWrapper = ref(null)
const imageElement = ref(null)

// 工具
const activeTool = ref(null)
const isDragging = ref(false)
const imagePosition = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })
const currentPosition = ref({ x: 0, y: 0 })
const positionHistory = ref([])
const moveInterval = ref(null)
const zoomInterval = ref(null)
const showColorDialog = ref(false)
const selectedColor = ref([0, 0, 0, 1])
const tempColor = ref([...selectedColor.value])
const openHistoryDialog = ref(false)

const drawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const brushSize = ref(5)
const eraserSize = ref(20)
const pts= ref([])
const THROTTLE= 16
let lastMove=0

const paintBucketAntiAlias = ref(true)

const openLayerDialog = ref(false)
const layers = ref([
  {
    id: 0,
    name: t('toolbox.picture.background'),
    locked: false,
    visible: true,
    canvas: null,
    history: [],
    historyIdx: 0
  }
])
window.layers = layers
const activeLayerId = ref(0)

// 设置活动工具
function setActiveTool(tool) {
  activeTool.value = tool
}

// 提示
function snackbar(text) {
  return mdui.snackbar({
    autoCloseDelay: 3000,
    message: text,
    placement: 'top',
    action: t('toolbox.know'),
    onActionClick: () => {}
  })
}

// 导入图片
function importImage() {
  fileInput.value.click()
}

// 处理文件导入
function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const isImage = validImageTypes.includes(file.type)
  const isCpp = file.name.endsWith('.cpp')
  
  if (!isImage && !isCpp) {
    // 显示错误提示
    snackbar(t('toolbox.picture.invalidFile'))
    return
  }
  
  if (isImage) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageSrc.value = e.target.result
      fileName.value = file.name
      
      // 统一格式处理
      let format = file.type.split('/')[1]
      if (format === 'jpeg') format = 'jpg'
      
      fileFormat.value = format
      
      // 设置保存格式（如果不在选项中则使用png）
      const validFormats = ['png', 'jpg', 'webp']
      saveFormat.value = validFormats.includes(format) ? format : 'png'
      
      saveFileName.value = fileName.value.replace(/\.[^/.]+$/, "") // 移除扩展名
    }
    reader.readAsDataURL(file)
  } else if (isCpp) {
    // 这里应该处理.cpp文件的导入
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target.result)
        if (project.format_version && project.prefix && project.layer) {
          fileName.value = file.name
          fileFormat.value = project.prefix
          saveFormat.value = project.prefix
          saveFileName.value = fileName.value.replace(/\.[^/.]+$/, "")
          
          snackbar(t('toolbox.picture.projectLoaded'))
        } else {
          throw new Error('Invalid project format')
        }
      } catch (error) {
        mdui.snackbar({
          message: t('toolbox.picture.invalidProject'),
          position: 'top'
        })
      }
    }
    reader.readAsText(file)
  }
  
  // 重置文件输入
  event.target.value = null
}

// 处理格式变化
const formatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'webp', label: 'WebP' },
  { value: 'cpp', label: 'CPP Project' }
]

function handleFormatChange(value) {
  saveFormat.value = value
}

// 画布
function loadImageToCanvas() {
  if (!imageSrc.value) return
  const img = new Image()
  img.onload = () => {
    mainCanvas.value.width = img.naturalWidth
    mainCanvas.value.height = img.naturalHeight
    layers.value.forEach(layer => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      if (layer.id === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      layer.canvas = canvas
      layer.history = [{ url: canvas.toDataURL(), label: t('toolbox.picture.initialState') }]
      layer.historyIdx = 0
    })
    compositedCanvas.value = document.createElement('canvas')
    compositedCanvas.value.width = img.naturalWidth
    compositedCanvas.value.height = img.naturalHeight
    compositedCtx.value = compositedCanvas.value.getContext('2d')
    compositedCtx.value.imageSmoothingEnabled = false
    updateCompositedCanvas()
  }
  img.src = imageSrc.value
}

const compositedCanvas = ref(null)
const compositedCtx = ref(null)
function updateCompositedCanvas() {
  if (!mainCanvas.value || layers.value.length === 0) return
  if (!compositedCanvas.value) {
    compositedCanvas.value = document.createElement('canvas')
    compositedCanvas.value.width = mainCanvas.value.width
    compositedCanvas.value.height = mainCanvas.value.height
    compositedCtx.value = compositedCanvas.value.getContext('2d')
    compositedCtx.value.imageSmoothingEnabled = false
  }
  compositedCtx.value.clearRect(0, 0, compositedCanvas.value.width, compositedCanvas.value.height)
  ;[...layers.value].reverse().forEach(layer => {
    if (layer.visible && layer.canvas) {
      compositedCtx.value.drawImage(
        layer.canvas,
        0, 0, layer.canvas.width, layer.canvas.height,
        0, 0, compositedCanvas.value.width, compositedCanvas.value.height
      )
    }
  })
  const ctx = mainCanvas.value.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, mainCanvas.value.width, mainCanvas.value.height)
  ctx.drawImage(compositedCanvas.value, 0, 0)
}

const canvasHistory = ref([])
let historyIdx = ref(0)
let historyLocked = false

function undo() {
  const layer = activeLayer.value
  if (!layer || layer.historyIdx <= 0) return
  layer.historyIdx--
  const img = new Image()
  img.onload = () => {
    const ctx = layer.canvas.getContext('2d') // 每次都获取最新ctx
    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    ctx.drawImage(img, 0, 0)
    updateCompositedCanvas()
  }
  img.src = layer.history[layer.historyIdx].url
}
function redo() {
  const layer = activeLayer.value
  if (!layer || layer.historyIdx >= layer.history.length - 1) return
  layer.historyIdx++
  const img = new Image()
  img.onload = () => {
    const ctx = layer.canvas.getContext('2d') // 每次都获取最新ctx
    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    ctx.drawImage(img, 0, 0)
    updateCompositedCanvas()
  }
  img.src = layer.history[layer.historyIdx].url
}
function jumpToHistory(idx) {
  const layer = activeLayer.value
  if (!layer || idx < 0 || idx >= layer.history.length) return
  layer.historyIdx = idx
  const img = new Image()
  img.onload = () => {
    const ctx = layer.canvas.getContext('2d') // 每次都获取最新ctx
    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    ctx.drawImage(img, 0, 0)
    updateCompositedCanvas()
  }
  img.src = layer.history[idx].url
}

watch(imageSrc, () => {
  if (imageSrc.value) {
    nextTick(() => {
      loadImageToCanvas()
    })
  }
})

// 保存图片
function onSaveOpen() {
  showSaveDialog.value = true
  setTimeout(() => {
    if (compositedCanvas.value) {
      previewSrc.value = compositedCanvas.value.toDataURL()
    }
  }, 0)
}

function saveImage() {
  if (!compositedCanvas.value) {
    snackbar(t('toolbox.picture.nothingToSave'))
    showSaveDialog.value = false
    return
  }
  
  if (saveFormat.value === 'cpp') {
    const project = {
      format_version: 1,
      prefix: fileFormat.value || 'png',
      layer: []
    }
    
    const blob = new Blob([JSON.stringify(project)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${saveFileName.value || 'project'}.cpp`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    const canvas = compositedCanvas.value
    if (!canvas) return

    // 转换为数据URL
    let dataUrl
    if (saveFormat.value === 'jpg') {
      dataUrl = canvas.toDataURL('image/jpeg', quality.value / 100)
    } else if (saveFormat.value === 'webp') {
      dataUrl = canvas.toDataURL('image/webp', 0.9)
    } else {
      dataUrl = canvas.toDataURL('image/png')
    }
    
    // 创建下载链接
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${saveFileName.value || 'image'}.${saveFormat.value}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  showSaveDialog.value = false
  mdui.snackbar(t('toolbox.picture.savedSuccessfully'))
}

// 初始化键盘事件
function initKeyboardEvents() {
  window.addEventListener('keydown', handleKeyDown)
}

// 处理键盘事件
function handleKeyDown(event) {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 's') {
      event.preventDefault()
      showSaveDialog.value = true
    } else if (event.key === 'o') {
      event.preventDefault()
      importImage()
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomLevel.value = Math.min(zoomLevel.value + 0.1, 50)
    } else if (event.key === '-') {
      event.preventDefault()
      zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1)
    } else if (event.key === '0') {
      event.preventDefault()
      zoomLevel.value = 1
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault()
      undo()
    } else if (event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      undo()
    } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
      event.preventDefault()
      redo()
    }
  }

  if (activeTool.value === 'move' && (event.ctrlKey || event.metaKey)) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveImage(-1, 0)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveImage(1, 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveImage(0, -1)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveImage(0, 1)
    }
  }
  if (activeTool.value === 'move' && event.key === '0' && event.ctrlKey) {
    event.preventDefault()
    resetPosition()
  }
}

// 开始
function handleMouseDown(event) {
  if (activeTool.value !== 'move') return
  isDragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY
  }
  event.preventDefault()
}

function handleTouchStart(event) {
  if (event.touches.length === 2) {
    event.preventDefault()
    isPinching.value = true
    
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    initialDistance.value = Math.hypot(
      touch2.pageX - touch1.pageX,
      touch2.pageY - touch1.pageY
    )
    
    initialZoom.value = zoomLevel.value
    return
  }
  if (activeTool.value === 'move') {
    isDragging.value = true
    const touch = event.touches ? event.touches[0] : event
    dragStart.value = {
      x: touch.clientX,
      y: touch.clientY
    }
    updateImageTransform()
  }
}

// 移动
function handleMouseMove(event) {
  if (activeTool.value !== 'move' || !isDragging.value) return
  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y
  imagePosition.value.x += deltaX
  imagePosition.value.y += deltaY
  dragStart.value.x = event.clientX
  dragStart.value.y = event.clientY
  updateImageTransform()
}

function handleTouchMove(event) {
  if (activeTool.value !== 'move' || !isDragging.value) {
    if (isPinching.value && event.touches.length === 2) {
      event.preventDefault()
      
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      const currentDistance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      )
      
      const scaleFactor = currentDistance / initialDistance.value
      zoomLevel.value = Math.min(Math.max(initialZoom.value * scaleFactor, 0.1), 50)
    }
    return
  }
  event.preventDefault()
  const touch = event.touches ? event.touches[0] : event
  const deltaX = touch.clientX - dragStart.value.x
  const deltaY = touch.clientY - dragStart.value.y
  imagePosition.value.x += deltaX
  imagePosition.value.y += deltaY
  dragStart.value.x = touch.clientX
  dragStart.value.y = touch.clientY
  updateImageTransform()
}

// 结束
function handleMouseUp() {
  if (activeTool.value === 'move' && isDragging.value) {
    isDragging.value = false
    positionHistory.value.push({...imagePosition.value})
  }
}

function handleTouchEnd() {
  if (activeTool.value === 'move' && isDragging.value) {
    isDragging.value = false
    positionHistory.value.push({...currentPosition.value})
  } else if (isPinching.value) {
    isPinching.value = false
  }
}

// 缩放
function startZooming(delta) {
  if (zoomInterval.value) clearInterval(zoomInterval.value)
  zoomImage(delta)
  zoomInterval.value = setInterval(() => {
    zoomImage(delta)
  }, 100)
}

function stopZooming() {
  if (zoomInterval.value) {
    clearInterval(zoomInterval.value)
    zoomInterval.value = null
  }
}

function zoomImage(delta) {
  zoomLevel.value = Math.min(Math.max(zoomLevel.value + delta, 0.1), 50)
  updateImageTransform()
}

// 微调图片位置
function moveImage(dx, dy) {
  positionHistory.value.push({...currentPosition.value})
  currentPosition.value.x += dx
  currentPosition.value.y += dy
  updateImageTransform()
}

function startMoving(dx, dy) {
  if (moveInterval.value) clearInterval(moveInterval.value)
  moveImage(dx, dy)
  moveInterval.value = setInterval(() => {
    moveImage(dx, dy)
  }, 100)
}

function stopMoving() {
  if (moveInterval.value) {
    clearInterval(moveInterval.value)
    moveInterval.value = null
  }
}

function updateImageTransform() {
  if (canvasWrapper.value) {
    canvasWrapper.value.style.transform = `
      translate(${imagePosition.value.x}px, ${imagePosition.value.y}px)
      scale(${zoomLevel.value})
    `
  }
}

watch(zoomLevel, () => {
  updateImageTransform()
})

// 重置位置
function resetPosition() {
  imagePosition.value = { x: 0, y: 0 }
  updateImageTransform()
}

// 颜色
function handleColorChange(color) {
  tempColor.value = [...color]
}

function confirmColor() {
  selectedColor.value = [...tempColor.value]
  showColorDialog.value = false
}

// 绘画
function getCoords(e) {
  const r = mainCanvas.value.getBoundingClientRect()
  const x = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) *
            (mainCanvas.value.width  / r.width)
  const y = ((e.touches ? e.touches[0].clientY : e.clientY) - r.top) *
            (mainCanvas.value.height / r.height)
  return { x, y }
}

function startDrawing(e) {
  const layer = activeLayer.value
  if (!layer || layer.locked) return
  if (activeTool.value !== 'brush' && activeTool.value !== 'eraser') return
  drawing.value = true
  lastMove = performance.now()
  const { x, y } = getCoords(e)
  pts.value = [{ x, y }]
  lastX.value = x
  lastY.value = y
}

function draw(e) {
  if (!drawing.value || !activeLayer.value) return
  const now = performance.now()
  if (now - lastMove < THROTTLE) return
  lastMove = now
  const { x, y } = getCoords(e)
  pts.value.push({ x, y })
  const ctx = activeLayer.value.canvas.getContext('2d')
  if (pts.value.length === 2) {
    ctx.beginPath()
    ctx.moveTo(pts.value[0].x, pts.value[0].y)
    ctx.lineTo(pts.value[1].x, pts.value[1].y)
    stroke(ctx)
    pts.value = [{ x, y }]
    updateCompositedCanvas()
  }
}

function stopDrawing() {
  if (!drawing.value || !activeLayer.value) return
  drawing.value = false
  const ctx = activeLayer.value.canvas.getContext('2d')
  if (pts.value.length === 1) {
    ctx.beginPath()
    ctx.arc(
      pts.value[0].x,
      pts.value[0].y,
      activeTool.value === 'brush' ? brushSize.value / 2 : eraserSize.value / 2,
      0,
      Math.PI * 2
    )
    if (activeTool.value === 'brush') {
      ctx.fillStyle = `rgba(${selectedColor.value.join(',')})`
      ctx.fill()
    } else {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
    updateCompositedCanvas()
  }
  pts.value = []
  saveLayerState(activeLayer.value)
}

function stroke(context) {
  context.lineCap = 'round'
  context.lineJoin = 'round'
  if (activeTool.value === 'brush') {
    context.globalCompositeOperation = 'source-over'
    context.strokeStyle = `rgba(${selectedColor.value.join(',')})`
    context.lineWidth = brushSize.value
  } else {
    context.globalCompositeOperation = 'destination-out'
    context.lineWidth = eraserSize.value
  }
  context.stroke()
  context.globalCompositeOperation = 'source-over'
}

function floodFill(startX, startY) {
  const layer = activeLayer.value
  if (!layer || layer.locked) {
    snackbar(t('toolbox.picture.layerLocked'))
    return
  }
  const canvas = layer.canvas
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = paintBucketAntiAlias.value
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixelData = imageData.data
  const targetColor = getPixelColor(imageData, startX, startY)
  const fillColor = new Uint8Array(selectedColor.value.map(c => c * 255))
  if (colorsEqual(targetColor, fillColor)) {
    return
  }
  const pixelsToCheck = [[startX, startY]]
  const width = canvas.width
  const height = canvas.height
  while (pixelsToCheck.length > 0) {
    const [x, y] = pixelsToCheck.pop()
    const pos = (y * width + x) * 4
    if (x < 0 || x >= width || y < 0 || y >= height) continue
    if (!colorsEqual(pixelData.slice(pos, pos + 4), targetColor)) continue
    if (paintBucketAntiAlias.value && isEdgePixel(imageData, x, y, targetColor)) {
      applyAntiAlias(pixelData, pos, targetColor, fillColor)
    } else {
      pixelData.set(fillColor, pos)
    }
    pixelsToCheck.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  ctx.putImageData(imageData, 0, 0)
  updateCompositedCanvas()
  saveLayerState()
  ctx.imageSmoothingEnabled = !pixelMode.value
}

function getPixelColor(imageData, x, y) {
  const pos = (y * imageData.width + x) * 4
  return imageData.data.slice(pos, pos + 4)
}

function isEdgePixel(imageData, x, y, targetColor) {
  const width = imageData.width
  const height = imageData.height
  const pixelPos = (y * width + x) * 4
  const neighbors = [
    [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
  ]
  return neighbors.some(([nx, ny]) => {
    if (nx < 0 || nx >= width || ny < 0 || ny >= height) return false
    const pos = (ny * width + nx) * 4
    return !colorsEqual(imageData.data.slice(pos, pos + 4), targetColor)
  })
}

function applyAntiAlias(pixelData, pos, targetColor, fillColor) {
  const blendFactor = 0.7
  for (let i = 0; i < 3; i++) {
    pixelData[pos + i] = Math.round(
      fillColor[i] * blendFactor + 
      targetColor[i] * (1 - blendFactor))
  }
  pixelData[pos + 3] = 255
}

function colorsEqual(color1, color2) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  )
}

function handleCanvasClick(e) {
  if (activeTool.value === 'paintBucket') {
    const { x, y } = getCoords(e)
    floodFill(Math.floor(x), Math.floor(y))
  }
}

function saveLayerState() {
  if (!activeLayer.value) return
  const layer = activeLayer.value
  const tool = activeTool.value
  let label = ''
  switch (tool) {
    case 'brush':
      label = t('toolbox.picture.drawLine', { size: brushSize.value })
      break
    case 'eraser':
      label = t('toolbox.picture.erase', { size: eraserSize.value })
      break
    case 'paintBucket':
      label = t('toolbox.picture.paintBucket')
      break
    default:
      label = t('toolbox.picture.unknownOp')
  }
  layer.history.splice(layer.historyIdx + 1)
  layer.history.push({
    url: layer.canvas.toDataURL(),
    tool,
    label
  })
  layer.historyIdx = layer.history.length - 1
  if (layer.history.length > 30) {
    layer.history.shift()
    layer.historyIdx--
  }
}

// 图层
function addLayer() {
  const id = Date.now()
  const index = layers.value.length
  const name = `${t('toolbox.picture.layer')} ${index}`
  const canvas = document.createElement('canvas')
  if (mainCanvas.value) {
    canvas.width = mainCanvas.value.width
    canvas.height = mainCanvas.value.height
  }
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  layers.value.unshift({
    id,
    name,
    locked: false,
    visible: true,
    canvas,
    ctx,
    history: [{ url: canvas.toDataURL(), label: t('toolbox.picture.newLayer') }],
    historyIdx: 0
  })
  activeLayerId.value = id
  updateCompositedCanvas()
}
function selectLayer(id) {
  activeLayerId.value = id
  updateCompositedCanvas()
}
function deleteLayer(id) {
  if (layers.value.length <= 1) return
  const index = layers.value.findIndex(layer => layer.id === id)
  if (index !== -1) {
    layers.value.splice(index, 1)
    if (id === activeLayerId.value) {
      activeLayerId.value = layers.value[Math.max(0, index - 1)].id
    }
    updateCompositedCanvas()
  }
}

function toggleLayerVisibility(id) {
  const layer = layers.value.find(layer => layer.id === id)
  if (layer) {
    layer.visible = !layer.visible
    updateCompositedCanvas()
  }
}
function toggleLayerLock(id) {
  const layer = layers.value.find(layer => layer.id === id)
  if (layer) {
    layer.locked = !layer.locked
    if (layer.locked && drawing.value && activeLayerId.value === id) {
      stopDrawing()
    }
  }
}
function renameLayer(id, newName) {
  const layer = layers.value.find(layer => layer.id === id)
  if (layer) {
    layer.name = newName
  }
}
function renameLayerPrompt(layer) {
  const newName = prompt(t('toolbox.picture.renameLayer'), layer.name)
  if (newName && newName.trim()) {
    layer.name = newName.trim()
  }
}

const activeLayer = computed(() => {
  return layers.value.find(layer => layer.id === activeLayerId.value)
})
const activeCanvas = computed(() => {
  return activeLayer.value?.canvas
})
const activeCtx = computed(() => {
  return activeCanvas.value?.getContext('2d')
})

const canMoveUp = computed(() => {
  const index = layers.value.findIndex(l => l.id === activeLayerId.value)
  return index > 1
})
const canMoveDown = computed(() => {
  const index = layers.value.findIndex(l => l.id === activeLayerId.value)
  return index >= 0 && index < layers.value.length - 1
})
function moveLayerUp(id) {
  const arr = [...layers.value]
  const index = arr.findIndex(l => l.id === id)
  if (index > 1) {
    ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
    layers.value = arr
    updateCompositedCanvas()
  }
}
function moveLayerDown(id) {
  const arr = [...layers.value]
  const index = arr.findIndex(l => l.id === id)
  if (index >= 0 && index < arr.length - 1) {
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    layers.value = arr
    updateCompositedCanvas()
  }
}
function duplicateLayer(layerId) {
  const sourceLayer = layers.value.find(l => l.id === layerId)
  if (!sourceLayer) return
  const newCanvas = document.createElement('canvas')
  newCanvas.width = sourceLayer.canvas.width
  newCanvas.height = sourceLayer.canvas.height
  const ctx = newCanvas.getContext('2d')
  ctx.drawImage(sourceLayer.canvas, 0, 0)
  const newHistory = sourceLayer.history.map(item => ({
    ...item,
    url: item.url
  }))
  const newLayer = {
    id: Date.now(),
    name: `${sourceLayer.name} (${t('toolbox.picture.copy')})`,
    locked: false,
    visible: true,
    canvas: newCanvas,
    history: newHistory,
    historyIdx: sourceLayer.historyIdx
  }
  layers.value.unshift(newLayer)
  activeLayerId.value = newLayer.id
  updateCompositedCanvas()
  snackbar(t('toolbox.picture.layerDuplicated'))
}
function confirmDeleteLayer(id) {
  if (id === 0) return
  mdui.confirm({
    headline: t('toolbox.picture.confirmDelete'),
    description: t('toolbox.picture.deleteLayerConfirm'),
    confirmText: t('toolbox.picture.delete'),
    cancelText: t('toolbox.picture.cancel'),
    onConfirm: () => deleteLayer(id)
  })
}

onMounted(() => {
  const canvas = mainCanvas.value
  if (!canvas) return

  mainCanvas.value.width = 1920
  mainCanvas.value.height = 1080

  canvas.addEventListener('mousedown', startDrawing)
  canvas.addEventListener('mousemove', draw)
  canvas.addEventListener('mouseup', stopDrawing)
  canvas.addEventListener('mouseout', stopDrawing)

  canvas.addEventListener('click', handleCanvasClick)
  
  canvas.addEventListener('touchstart', startDrawing)
  canvas.addEventListener('touchmove', draw)
  canvas.addEventListener('touchend', stopDrawing)
})

onUnmounted(() => {
  const canvas = mainCanvas.value
  if (!canvas) return

  canvas.removeEventListener('mousedown', startDrawing)
  canvas.removeEventListener('mousemove', draw)
  canvas.removeEventListener('mouseup', stopDrawing)
  canvas.removeEventListener('mouseout', stopDrawing)

  canvas.removeEventListener('click', handleCanvasClick)

  canvas.removeEventListener('touchstart', startDrawing)
  canvas.removeEventListener('touchmove', draw)
  canvas.removeEventListener('touchend', stopDrawing)
})

onMounted(() => {
  initKeyboardEvents()
  
  // 添加滚轮缩放支持
  editorContent.value.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
      event.preventDefault()
      const delta = Math.sign(event.deltaY) * -0.1
      zoomLevel.value = Math.min(Math.max(zoomLevel.value + delta, 0.1), 50)
    }
  }, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
$md3-breakpoint: 768px;
$md3-radius: 12px;
$md3-gap: 8px;
$md3-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

#content {
  padding-top: 64px !important
}

canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.image-container {
  transform-origin: 0 0;
  will-change: transform;
}

.picture-editor-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
  background: 
    linear-gradient(45deg, var(--mdui-color-surface-container-highest) 25%, transparent 25%), 
    linear-gradient(-45deg, var(--mdui-color-surface-container-highest) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--mdui-color-surface-container-highest) 75%),
    linear-gradient(-45deg, transparent 75%, var(--mdui-color-surface-container-highest) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--mdui-color-surface-container);
  border-bottom: 1px solid var(--mdui-color-outline-variant);
  z-index: 10;
  height: 60px;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--mdui-color-on-surface);
}

.file-format {
  font-size: 0.85rem;
  color: var(--mdui-color-on-surface-variant);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.editor-content {
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  margin-bottom: -64px;
  justify-content: center;
  align-items: center;
  touch-action: none;
}

.image-container {
  transform-origin: center center;
  transition: transform 0.1s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  margin-top: -64px;
  max-width: 90%;
  max-height: 90%;
  will-change: transform;
  
  canvas {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    touch-action: none;
    background-image:
      linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
      linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
      linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  }
}

.editor-tools {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  overflow-x: auto;
  padding: 12px 16px;
  background: rgba(var(--mdui-color-surface-container), 0.75);
  backdrop-filter: blur(2px);
  border-top: 1px solid rgba(var(--mdui-color-outline-variant), 0.25);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
}

.tool-group {
  display: flex;
  > *:first-child {
    margin-right: 12px;
  }
}

.save-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}

.preview-container {
  max-height: 40vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(var(--mdui-color-surface-container-highest));
  border-radius: 12px;
  padding: 16px;
  
  img {
    max-width: 100%;
    max-height: 35vh;
    object-fit: contain;
  }
}

.no-preview {
  padding: 40px;
  text-align: center;
  color: var(--mdui-color-on-surface-variant);
}

.save-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.format-selector {
  margin-top: 0.5rem;
}

.quality-slider {
  margin-top: 12px;
}

.slider-label {
  font-size: 0.9rem;
  color: var(--mdui-color-on-surface-variant);
  margin-bottom: 8px;
}

.slider {
  outline: none;
}

.brush-toolbar,
.eraser-toolbar,
.paintbucket-toolbar,
.move-toolbar,
.zoom-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $md3-gap;
  position: fixed;
  top: 72px;
  left: $md3-gap * 2;
  right: $md3-gap * 2;
  padding: 8px 12px;
  background: var(--mdui-color-surface-container);
  border-radius: $md3-radius;
  box-shadow: $md3-shadow;
  z-index: 25;
}

.zoom-toolbar {
  padding: 10px 16px;
}

.brush-toolbar, .eraser-toolbar, .paintbucket-toolbar {
  .toolbar-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .size-control {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    color: var(--mdui-color-on-surface);
  }
  
  .color-preview {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid rgba(var(--mdui-color-on-surface), 0.2);
  }
}

.color-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(var(--mdui-color-on-surface), 0.2);
}

.color-dialog {
  .dialog-title {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 1.25rem;
    color: rgb(var(--mdui-color-on-surface));
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
}

.history-dialog {
  .dialog-title { margin: 0 0 12px 0; font-size: 1.25rem; }
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 300px;
    overflow-y: auto;
  }
  .history-item {
    padding: 6px 8px;
    border-radius: 4px;
    transition: background .2s;
    &:hover { background: rgba(var(--mdui-color-primary), .08); }
    &.active {
      font-weight: 600;
      color: rgb(var(--mdui-color-primary));
    }
    &.future {
      opacity: .5;
    }
  }
}

.layer-dialog {
  .dialog-title { margin: 0 0 12px 0; font-size: 1.25rem; }
  .layer-sticky-bar {
    display: flex;
    gap: 4px;
    padding: 8px;
    background: rgb(var(--mdui-color-surface-container));
    border-radius: 6px;
    margin-bottom: 8px;
    position: sticky;
    top: 0;
    z-index: 2;
    svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
  }
  .layer-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
  }
  .layer-item {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-radius: 6px;
    transition: background .2s;
    background: var(--mdui-color-surface-container-highest);
    
    &:hover { 
      background: var(--mdui-color-surface-container-highest-hover);
    }
    
    &.active {
      font-weight: 600;
      color: rgb(var(--mdui-color-primary));
      background: rgba(var(--mdui-color-primary), .12);
      border-left: 3px solid rgb(var(--mdui-color-primary));
    }
    
    .layer-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    
    .layer-actions {
      display: flex;
      gap: 4px;
    }
    
    .layer-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    
    .visibility-icon,
    .lock-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 1;
      }
      
      svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
    }
  }
}

@media (min-width: $md3-breakpoint) {
  .editor-header {
    margin: 0 $md3-gap;
    border-radius: 0 0 $md3-radius $md3-radius;
  }

  .editor-tools {
    position: fixed;
    top: 128px;
    left: $md3-gap;
    width: 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: $md3-gap;
    background: rgba(var(--mdui-color-surface-container), 0.75);
    border-radius: $md3-radius;
    box-shadow: $md3-shadow;
    overflow-y: auto;
    max-height: calc(100vh - 60px - #{$md3-gap} * 2);
  }

  .brush-toolbar,
  .eraser-toolbar,
  .paintbucket-toolbar,
  .move-toolbar,
  .zoom-toolbar {
    top: 60px + 60px + $md3-gap;
    left: 56px + $md3-gap * 2;
    width: auto;
    min-width: 200px;
    max-width: 260px;
    background: rgba(var(--mdui-color-surface-container), 0.75);
    backdrop-filter: blur(2px);
    border-radius: $md3-radius;
    box-shadow: $md3-shadow;
  }
}

@media (max-width: #{$md3-breakpoint - 1}) {
  .file-name {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .editor-tools {
    display: grid;
    grid-template-rows: 40px 40px;
    grid-auto-flow: column;
    gap: $md3-gap;
    padding: $md3-gap $md3-gap * 2;
    position: fixed;
    z-index: 20;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: 96px;
  }

  .brush-toolbar,
  .eraser-toolbar,
  .paintbucket-toolbar,
  .move-toolbar,
  .zoom-toolbar {
    position: fixed;
    top: calc(100% - 88px - 90px + $md3-gap);
    left: $md3-gap * 2;
    right: $md3-gap * 2;
    padding: 8px 12px;
    background: rgba(var(--mdui-color-surface-container), 0.75);
    backdrop-filter: blur(2px);
    border-radius: $md3-radius;
    box-shadow: $md3-shadow;
    z-index: 25;
  }
}
</style>