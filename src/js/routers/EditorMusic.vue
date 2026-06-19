<template>
  <div>
    <Topbar v-if="!isDesktop" />
    <div :id="!isDesktop ? 'content' : ''" class="ns" style="width: 100%;height: var(--window-height);box-sizing: border-box;overflow-y: auto">
      <div class="music-container-wrapper">
        <!-- 专辑列表 -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="!currentAlbum" key="albums" class="music-container">
            <div v-if="isDesktop" class="toolbar">
              <mdui-button class="add-album-button" @click="showAddAlbumDialog = true">
                <ion-icon slot="icon" name="add" />
                {{ t('editor.music.addAlbum') }}
              </mdui-button>
            </div>
            <Transition name="fade">
              <div v-if="albums && albums.length === 0" key="empty-albums" class="empty-state">
                <ion-icon name="musical-note-outline" class="empty-icon"></ion-icon>
                <div class="empty-text">{{ t('editor.music.empty') }}</div>
              </div>
            </Transition>
            <mdui-list class="scrollable-content">
              <TransitionGroup name="list-item" tag="div">
                <mdui-list-item
                  v-for="(album, index) in albums"
                  :key="index"
                >
                  <img
                    v-if="album.cover"
                    @click="currentAlbum = album"
                    :src="album.cover"
                    slot="icon"
                    class="album-cover"
                  />
                  <div @click="currentAlbum = album">
                    <div>
                      <div class="album-name">{{ album.name }}</div>
                      <div class="album-artist">{{ album.artist }}</div>
                    </div>
                  </div>
                  <mdui-dropdown slot="end-icon" style="line-height:normal;">
                    <mdui-button-icon slot="trigger" @click.stop>
                      <ion-icon name="ellipsis-vertical" />
                    </mdui-button-icon>
                    <mdui-menu dense>
                      <mdui-menu-item @click="deleteAlbum(index)">
                        {{ t('editor.music.deleteAlbum') }}
                      </mdui-menu-item>
                      <mdui-menu-item @click="editAlbum(index)">
                        {{ t('editor.music.editAlbum') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="album.cover !== false" @click="showRemoveCover('album', index)">
                        {{ t('editor.music.removeCover.title') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="index > 0" @click="moveUp('album', index)">
                        {{ t('editor.music.moveUp') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="index < albums.length - 1" @click="moveDown('album', index)">
                        {{ t('editor.music.moveDown') }}
                      </mdui-menu-item>
                    </mdui-menu>
                  </mdui-dropdown>
                </mdui-list-item>
              </TransitionGroup>
            </mdui-list>
          </div>
        </Transition>

        <!-- 专辑音乐列表 -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentAlbum" key="songs" class="music-container">
            <div class="toolbar">
              <mdui-button-icon @click="currentAlbum = null">
                <ion-icon name="arrow-back-outline"></ion-icon>
              </mdui-button-icon>
              <div class="breadcrumb album-name">
                <span>{{ t('editor.music.music') }} > {{ currentAlbum.name }}</span>
              </div>
              <mdui-button-icon style="margin-right: 0.2rem;" @click="handleBatchAddFiles">
                <ion-icon name="duplicate-outline" />
              </mdui-button-icon>
              <mdui-button v-if="isDesktop" class="add-song-button" @click="showAddSongDialog = true">
                <ion-icon slot="icon" name="add" />
                {{ t('editor.music.addSong') }}
              </mdui-button>
            </div>
            <Transition name="fade">
              <div v-if="currentAlbum.songs && currentAlbum.songs.length === 0" key="empty-songs" class="empty-state">
                <ion-icon name="musical-notes-outline" class="empty-icon"></ion-icon>
                <div class="empty-text">{{ t('editor.music.empty') }}</div>
              </div>
            </Transition>
            <mdui-list class="scrollable-content music-content">
              <TransitionGroup name="list-item" tag="div">
                <mdui-list-item
                  v-for="(song, index) in currentAlbum.songs"
                  :key="index"
                  @click="togglePlaySong(index, $event)"
                  @mousedown="handleSongMouseDown(index, $event)"
                  @mousemove="handleSongMouseMove(index, $event)"
                  @mouseup="handleSongMouseUp(index)"
                  @mouseleave="handleSongMouseLeave(index)"
                  @touchstart="handleSongTouchStart(index, $event)"
                  @touchmove="handleSongTouchMove(index, $event)"
                  @touchend="handleSongTouchEnd(index, $event)"
                >
                  <img
                    v-if="song.cover"
                    :src="song.cover"
                    slot="icon"
                    class="song-cover"
                  />
                  <div class="song-title">{{ song.title }}</div>
                  <div class="song-info">{{ (player.loading && player.index === index ? t('editor.music.loading') + '... ' : ((player.isDragging && player.index === index ? player.dragProgressText : (player.progressText && player.index === index ? player.progressText : '')))) + song.duration + (song.artist ? ' | ' + song.artist : '') }}</div>
                  <mdui-dropdown slot="end-icon" style="line-height:normal;">
                    <mdui-button-icon slot="trigger" @click.stop>
                      <ion-icon name="ellipsis-vertical" />
                    </mdui-button-icon>
                    <mdui-menu dense>
                      <mdui-menu-item v-if="player && player.index === index && !player.pause" @click="pauseSong()">
                        {{ t('editor.music.pauseSong') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="player && player.index === index && player.pause" @click="resumeSong()">
                        {{ t('editor.music.resumeSong') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="!player || player.index !== index" @click="playSong(index)">
                        {{ t('editor.music.playSong') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="player && player.index === index" @click="stopSong()">
                        {{ t('editor.music.stopSong') }}
                      </mdui-menu-item>
                      <mdui-menu-item @click="deleteSong(index)">
                        {{ t('editor.music.deleteSong') }}
                      </mdui-menu-item>
                      <mdui-menu-item @click="editSong(index)">
                        {{ t('editor.music.editSong') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="song.cover" @click="showRemoveCover('song', index)">
                        {{ t('editor.music.removeCover.title') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="index > 0" @click="moveUp('song', index)">
                        {{ t('editor.music.moveUp') }}
                      </mdui-menu-item>
                      <mdui-menu-item v-if="index < currentAlbum.songs.length - 1" @click="moveDown('song', index)">
                        {{ t('editor.music.moveDown') }}
                      </mdui-menu-item>
                    </mdui-menu>
                  </mdui-dropdown>
                  <div
                    :style="{ width: (player.isDragging && player.index === index ? player.dragProgress : player.progress) + '%' }"
                    v-if="player && player.index === index && !player.loading"
                    class="song-progress"
                  />
                </mdui-list-item>
              </TransitionGroup>
            </mdui-list>
          </div>
        </Transition>

        <input
          type="file"
          accept="audio/*"
          ref="multiSelectFileInput"
          style="display: none"
          multiple
          @change="handleBatchAddFilesChange"
        />
      </div>

      <!-- 添加专辑弹窗 -->
      <mdui-dialog :open="showAddAlbumDialog" @close="showAddAlbumDialog = false">
        <h2 class="dialog-title">{{ t(currentEditAlbumIndex !== -1 ? 'editor.music.editAlbum' : 'editor.music.addAlbum') }}</h2>
        <div class="dialog-content">
          <!-- 封面上传 -->
          <div class="cover-upload">
            <mdui-avatar class="cover-preview" v-if="newAlbumCoverPreview" @click="triggerFileInput">
              <img :src="newAlbumCoverPreview" />
            </mdui-avatar>
            <div v-else class="add-cover" @click="triggerFileInput">
              <ion-icon name="add"></ion-icon>
            </div>
            <input
              type="file"
              accept="image/*"
              ref="coverFileInput"
              style="display: none"
              @change="handleCoverFileChange"
            />
          </div>
      
          <mdui-text-field
            name="newAlbumName"
            style="margin-bottom: 0.5rem"
            :label="t('editor.music.albumName')"
            :value="newAlbumName"
            @change="newAlbumName = $event.target.value"
          />
          <mdui-text-field
            name="newAlbumArtist"
            :label="t('editor.music.albumArtist')"
            :value="newAlbumArtist"
            @change="newAlbumArtist = $event.target.value"
          />
        </div>
        <div class="dialog-actions">
          <mdui-button style="margin-right: 0.2rem;" variant="text" @click="resetAddAlbumFields(); showAddAlbumDialog = false">{{ t('gui$cancel') }}</mdui-button>
          <mdui-button
            variant="filled"
            :disabled="!newAlbumName || !newAlbumArtist"
            @click="addAlbum"
          >
            {{ t(currentEditAlbumIndex !== -1 ? 'editor.music.edit' : 'gui$new') }}
          </mdui-button>
        </div>
      </mdui-dialog>

      <!-- 添加/编辑音乐弹窗 -->
      <mdui-dialog :open="showAddSongDialog" @close="showAddSongDialog = false">
        <h2 class="dialog-title">{{ t(currentEditSongIndex !== -1 ? 'editor.music.editSong' : 'editor.music.addSong') }}</h2>
        <div class="dialog-content">
          <!-- 音乐封面上传 -->
          <div class="cover-upload">
            <mdui-avatar class="cover-preview" v-if="newSongCoverPreview" @click="triggerSongCoverFileInput">
              <img :src="newSongCoverPreview" />
            </mdui-avatar>
            <div v-else class="add-cover" @click="triggerSongCoverFileInput">
              <ion-icon name="add"></ion-icon>
            </div>
            <input
              type="file"
              accept="image/*"
              ref="songCoverFileInput"
              style="display: none"
              @change="handleSongCoverFileChange"
            />
          </div>
      
          <mdui-text-field
            name="newSongTitle"
            style="margin-bottom: 0.5rem"
            :label="t('editor.music.songTitle')"
            :value="newSongTitle"
            @change="newSongTitle = $event.target.value"
          />
          <mdui-text-field
            name="newSongArtist"
            style="margin-bottom: 0.5rem"
            :label="t('editor.music.songArtist')"
            :value="newSongArtist"
            @change="newSongArtist = $event.target.value"
          />
          <mdui-text-field
            name="newSongDuration"
            :label="t('editor.music.songDuration')"
            :value="newSongDuration"
            @change="newSongDuration = $event.target.value"
          />
          <div class="audio-upload">
            <div 
              class="upload-area"
              @click="triggerAudioFileInput"
              @dragover.prevent
              @drop.prevent="handleAudioDrop"
            >
              <input
                type="file"
                ref="audioFileInput"
                style="display: none"
                @change="handleAudioFileChange"
              />
              <div v-if="!audioFileNamePreview" class="upload-prompt">
                <ion-icon name="cloud-upload-outline"></ion-icon>
                <div>{{ t('editor.music.uploadAudio') }}</div>
              </div>
              <div v-else class="file-name">{{ audioFileNamePreview }}</div>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <mdui-button style="margin-right: 0.2rem;" variant="text" @click="resetAddSongFields(); showAddSongDialog = false">{{ t('gui$cancel') }}</mdui-button>
          <mdui-button
            variant="filled"
            :disabled="!newSongTitle || !newSongDuration || audioFileInputEmpty"
            @click="addSong"
          >
            {{ t(currentEditSongIndex !== -1 ? 'editor.music.edit' : 'gui$new') }}
          </mdui-button>
        </div>
      </mdui-dialog>

      <!-- 格式转换弹窗  -->
      <mdui-dialog :open="fileConversion.dialog" @close="fileConversion.dialog = false">
        <div class="dialog-content progress-dialog">
          <div class="progress-info">
            <div class="file-name">{{ fileConversion.currentFileName }}</div>
            <div class="progress-text">{{ fileConversion.progressText }}</div>
          </div>
          <mdui-linear-progress mode="determinate" :value="fileConversion.progressCurrent" />
          <div class="conversion-details">{{ fileConversion.details }}</div>
          <mdui-linear-progress mode="determinate" :value="fileConversion.progressTotal" />
        </div>
      </mdui-dialog>

      <!-- 移除封面弹窗 -->
      <mdui-dialog :open="showRemoveCoverDialog" @close="cancelRemoveCover">
        <h2 class="dialog-title">{{ t('editor.music.removeCover.title') }}</h2>
        <div class="dialog-content">
          <p>{{ t('editor.music.removeCover.message') }}</p>
        </div>
        <div class="dialog-actions">
          <mdui-button variant="text" @click="cancelRemoveCover">{{ t('editor.music.removeCover.cancel') }}</mdui-button>
          <mdui-button variant="filled" @click="confirmRemoveCover">{{ t('editor.music.removeCover.confirm') }}</mdui-button>
        </div>
      </mdui-dialog>

      <!-- 添加专辑或音乐的浮动按钮 -->
      <mdui-fab
        class="add-fab"
        variant="primary"
        v-if="!isDesktop"
        @click="handleAddFabClick"
      >
        <ion-icon slot="icon" name="add-outline" />
      </mdui-fab>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import Topbar from '../components/Topbar'
import { useI18n } from 'vue-i18n'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import * as simplecrop from "../simpleCrop"

const props = defineProps({
  isDesktop: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const ffmpeg = new FFmpeg()
const error = inject("error")
const fs = inject("fs")

const showAddAlbumDialog = ref(false)
const showAddSongDialog = ref(false)
const coverFileInput = ref(null)
const songCoverFileInput = ref(null)
const newAlbumCover = ref(null)
const newAlbumCoverPreview = ref(null)
const newAlbumName = ref('')
const newAlbumArtist = ref('')
const newSongCover = ref(null)
const newSongCoverPreview = ref(null)
const newSongTitle = ref('')
const newSongDuration = ref('')
const newSongArtist = ref('')

const currentAlbum = ref(null)
const currentEditAlbumIndex = ref(-1)
const currentEditSongIndex = ref(-1)

const showRemoveCoverDialog = ref(false)
const currentRemoveCoverType = ref('')
const currentRemoveCoverIndex = ref(-1)

const audioFile = ref(null)
const audioFileInput = ref(null)
const audioFileInputEmpty = ref(true)
const audioFileNamePreview = ref('')

const randomString = (length=8) => {
  const firstChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const otherChars = firstChar + '0123456789';
  let result = firstChar[Math.floor(Math.random() * firstChar.length)];
  for (let i = 1; i < length; i++) result += otherChars[Math.floor(Math.random() * otherChars.length)];
  return result;
}
function parseTime(str) {
  const regex = /(\d+)[\s:．:](\d+)/;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let result = str.match(regex);
  if (result) {
    minutes = parseInt(result[1], 10);
    seconds = parseInt(result[2], 10);
    if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
    }
    if (minutes >= 60) {
      hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    if (hours > 0) {
      minutes += hours * 60;
    }
    return [minutes, seconds];
  } else {
    const singleNumber = parseInt(str, 10);
    if (!isNaN(singleNumber)) {
      if (singleNumber >= 60) {
        minutes = Math.floor(singleNumber / 60);
        seconds = singleNumber % 60;
      } else {
        minutes = 0;
        seconds = singleNumber;
      }
      return [minutes, seconds];
    } else {
      return [0, 0];
    }
  }
}

const albums = ref([
  /*{
    cover: false,
    name: 'Sample Album',
    artist: 'Sample Artist',
    id: randomString(),
    songs: [
      { title: 'Song 1', duration: '3:45' },
      { title: 'Song 2', duration: '4:20' }
    ]
  }*/
])
const player = ref({
  audio: null,
  index: -1,
  interval: null,
  pause: false,
  progress: 0,
  progressText: '',
  loading: false,
  isDragging: false,
  dragProgress: 0,
  dragProgressText: ''
})
// 拖动相关状态
const longPressTimer = ref(null)
const dragStartX = ref(0)
const dragSongElement = ref(null)
const fileConversion = ref({
  dialog: false,
  currentFileName: '',
  details: '',
  isReady: false,
  progressText: '',
  progressCurrent: 0,
  progressTotal: 0
})

const repairSettings = obj => {
  if (!obj) obj = {}
  if (!obj.music_album || !obj.music_album.modifications) 
    obj.music_album = {
      modifications: [
        {
          array_name: "controls",
          operation: "insert_back",
          value: []
        }
      ]
    }
  if (!obj.music_sidebar_content || !obj.music_sidebar_content.modifications) 
    obj.music_sidebar_content = {
      modifications: [
        {
          array_name: "controls",
          operation: "insert_back",
          value: []
        }
      ]
    }
  if (!obj.music_content || !obj.music_content.modifications) 
    obj.music_content = {
      modifications: [
        {
          array_name: "controls",
          operation: "insert_back",
          value: []
        }
      ]
    }
  return obj
}
const addAlbum = async () => {
  try {
    if (newAlbumName.value && newAlbumArtist.value) {
      let settings = await fs.value.read('ui/_setting.json')
      const sounds = await fs.value.read('sounds/sound_definitions.json')
      settings = repairSettings(settings)
      if (currentEditAlbumIndex.value >= 0) {
        // 编辑专辑
        const albumToUpdate = albums.value[currentEditAlbumIndex.value]
        albumToUpdate.name = newAlbumName.value
        albumToUpdate.artist = newAlbumArtist.value
        if (newAlbumCover.value) {
          albumToUpdate.cover = newAlbumCover.value instanceof Blob 
            ? URL.createObjectURL(newAlbumCover.value) 
            : newAlbumCover.value
        }
  
        if (await fs.value.exist('ui/_setting.json')) {
          const id = albumToUpdate.id
          newAlbumCover.value && fs.value.write('textures/cube/cover/album/'+id+'.png', newAlbumCover.value)
  
          const albumData = settings.music_album.modifications[0].value.find(obj => Object.keys(obj)[0] === id + "_album@cn80b37451.album")
          const albumSidebarData = settings.music_sidebar_content.modifications[0].value.find(obj => Object.keys(obj)[0] === id + "_navigation_tab@cube_sidebar.tab_panel")
          // const albumContent = settings.music_content.modifications[0].value.find(obj => Object.keys(obj)[0] === id + "_content@cube_music.content")
          albumData[Object.keys(albumData)[0]].$album_name = newAlbumName.value
          albumSidebarData[Object.keys(albumSidebarData)[0]].$control_text = newAlbumName.value
          settings[id + "Album@cn80b37451.f"].$album_describe = newAlbumArtist.value
          settings[id + "Album@cn80b37451.f"].$album_name = newAlbumName.value
        }
      } else {
        const id = randomString()
        // 添加专辑
        albums.value.push({
          cover: newAlbumCover.value ? URL.createObjectURL(newAlbumCover.value) : false,
          name: newAlbumName.value,
          artist: newAlbumArtist.value,
          id,
          songs: []
        })
        if (await fs.value.exist('ui/_setting.json')) {
          newAlbumCover.value && fs.value.write('textures/cube/cover/album/'+id+'.png', newAlbumCover.value)
  
          const albumData = {}
          const albumSidebarData = {}
          const albumContent = {}
          albumData[id + "_album@cn80b37451.album"] = {
            "$album_id": id,
            "$album_name": newAlbumName.value,
            "$album_cover": newAlbumCover.value ? '($cube_path_base+\'cover/album/' + id + '.png\')' : '($cube_path_icons+custom)',
            "$album_cover_size": ["100%y","85%"],
            "$toggle_group_index": 5 + settings.music_album.modifications[0].value.length
          }
          albumSidebarData[id + "_navigation_tab@cube_sidebar.tab_panel"] = {
            "$tab_name": id + "_tab",
            "$sub_tab_name": id + "albumToggle",
            "$toggle_group_index": 5 + settings.music_album.modifications[0].value.length,
            "$control_text": newAlbumName.value,
            "$control_icon_base": newAlbumCover.value ? '($cube_path_base+\'cover/album/' + id + '.png\')' : '($cube_path_icons+custom)',
          }
          albumContent[id + "_content@cube_music.content"] = {
            "$content_panel": "cube_setting." + id + "Album",
            "$visible_bind_source_control": id + "_tab"
          }
          settings.music_album.modifications[0].value.push(albumData)
          settings.music_sidebar_content.modifications[0].value.push(albumSidebarData)
          settings.music_content.modifications[0].value.push(albumContent)
          settings[id + "Album@cn80b37451.f"] = {
            "$album_cover": newAlbumCover.value ? '($cube_path_base+\'cover/album/' + id + '.png\')' : '($cube_path_icons+custom)',
            "$album_describe": newAlbumArtist.value,
            "$album_name": newAlbumName.value,
            "$album_id": "cube.music." + id,
            "$listContent": []
          }
          sounds["cube.music." + id] = {
            category: "ui",
            sounds: []
          }
        }
      }
  
      fs.value.write('ui/_setting.json', settings)
      fs.value.write('sounds/sound_definitions.json', sounds)
      resetAddAlbumFields()
    }
  } catch (e) {
    error.value(e)
  }
}

const addSong = async () => {
  try {
    if (newSongTitle.value && newSongDuration.value) {
      const settings = await fs.value.read('ui/_setting.json')
      const sounds = await fs.value.read('sounds/sound_definitions.json')
  
      if (currentEditSongIndex.value >= 0 && currentAlbum.value) {
        // 编辑音乐
        const songToUpdate = currentAlbum.value.songs[currentEditSongIndex.value]
        const id = songToUpdate.id
        const dataControl = settings[currentAlbum.value.id + "Album@cn80b37451.f"].$listContent[currentEditSongIndex.value]
        const data = dataControl[Object.keys(dataControl)[0]]
        const [minutes, seconds] = parseTime(newSongDuration.value)
        songToUpdate.title = newSongTitle.value
        songToUpdate.duration = newSongDuration.value
        songToUpdate.artist = newSongArtist.value
        songToUpdate.file = audioFile.value
        songToUpdate.fileName = audioFileNamePreview.value
        data.$music_name = newSongTitle.value
        data.$music_author = newSongArtist.value
        data.$music_minute = minutes
        data.$music_second = seconds
        if (newSongCover.value) {
          songToUpdate.cover = newSongCover.value instanceof Blob 
            ? URL.createObjectURL(newSongCover.value) 
            : newSongCover.value
          fs.value.write('textures/cube/cover/song/'+id+'.png', newSongCover.value)
        }
        if (audioFile.value && audioFileNamePreview.value) {
          if (player.value.audio) stopSong()
          batchConvertFile([{buffer: audioFile.value, fileName: audioFileNamePreview.value, id, index: currentEditSongIndex.value}])
        }
      } else if (currentAlbum.value) {
        // 添加音乐
        const id = randomString()
        currentAlbum.value.songs.push({
          title: newSongTitle.value,
          duration: newSongDuration.value,
          artist: newSongArtist.value,
          cover: newSongCover.value ? URL.createObjectURL(newSongCover.value) : false,
          file: audioFile.value,
          fileName: audioFileNamePreview.value,
          id
        })
  
        const songDetails = {}
        const [minutes, seconds] = parseTime(newSongDuration.value)
        newSongCover.value && fs.value.write('textures/cube/cover/song/'+id+'.png', newSongCover.value)
        songDetails[id + "@cn80b37451.m"] = {
          $music_name: newSongTitle.value,
          $music_author: newSongArtist.value,
          $music_id: "cube.song." + id,
          $music_cover: newSongCover.value ? '($cube_path_base+\'cover/song/' + id + '.png\')' : '',
          $music_minute: minutes,
          $music_second: seconds
        }
        sounds["cube.song." + id] = {
          category: "ui",
          sounds: [
            {
              name: 'sounds/album/' + currentAlbum.value.id + '/' + id,
              stream: true,
              volume: 0.5
            }
          ]
        }
        if (!sounds["cube.music." + currentAlbum.value.id]) sounds["cube.music." + currentAlbum.value.id] = {
          category: "ui",
          sounds: []
        }
        sounds["cube.music." + currentAlbum.value.id].sounds.push({
          name: 'sounds/album/' + currentAlbum.value.id + '/' + id,
          stream: true,
          volume: 0.5
        })
        settings[currentAlbum.value.id + "Album@cn80b37451.f"].$listContent.push(songDetails)
  
        if (audioFileNamePreview.value) batchConvertFile([{buffer: audioFile.value, fileName: audioFileNamePreview.value, id, index: currentAlbum.value.songs.length - 1}])
      }
  
      fs.value.write('ui/_setting.json', settings)
      fs.value.write('sounds/sound_definitions.json', sounds)
      resetAddSongFields();
    }
  } catch (e) {
    error.value(e)
  }
}

const handleAddFabClick = () => {
  if (currentAlbum.value) showAddSongDialog.value = true
  else showAddAlbumDialog.value = true
}

const deleteAlbum = async index => {
  try {
    let settings = await fs.value.read('ui/_setting.json')
    const sounds = await fs.value.read('sounds/sound_definitions.json')
    const id = albums.value[index].id
    settings = repairSettings(settings)
  
    const albumData = settings.music_album.modifications[0].value.find(obj => Object.keys(obj)[0] === id + "_album@cn80b37451.album")
    if (albumData) {
      const textures = albumData[Object.keys(albumData)[0]].$album_cover
      if (textures !== ('($cube_path_icons+custom)')) fs.value.remove('textures/cube/cover/album/' + id + '.png')
  
      const albumIndex = settings.music_album.modifications[0].value.findIndex(obj => Object.keys(obj)[0] === id + "_album@cn80b37451.album")
      const albumSidebarIndex = settings.music_sidebar_content.modifications[0].value.findIndex(obj => Object.keys(obj)[0] === id + "_navigation_tab@cube_sidebar.tab_panel")
      const albumContentIndex = settings.music_content.modifications[0].value.findIndex(obj => Object.keys(obj)[0] === id + "_content@cube_music.content")
      delete settings.music_album.modifications[0].value[albumIndex]
      delete settings.music_sidebar_content.modifications[0].value[albumSidebarIndex]
      delete settings.music_content.modifications[0].value[albumContentIndex]
      delete settings[id + "Album@cn80b37451.f"]
      delete sounds["cube.music." + id]
    }
  
    fs.value.write('ui/_setting.json', settings)
    fs.value.write('sounds/sound_definitions.json', sounds)
  
    albums.value.splice(index, 1);
    if (albums.value.length === 0) currentAlbum.value = null;
  } catch (e) {
    error.value(e)
  }
}

const deleteSong = async index => {
  if (currentAlbum.value) {
    if (player.value.index === index) stopSong()
    let settings = await fs.value.read('ui/_setting.json')
    const sounds = await fs.value.read('sounds/sound_definitions.json')
    settings = repairSettings(settings)

    const albumID = currentAlbum.value.id
    const songDataTemp = settings[albumID + "Album@cn80b37451.f"].$listContent[index]
    const songData = songDataTemp[Object.keys(songDataTemp)[0]]
    const id = songData.$music_id.replace("cube.song.", "")

    if (songData) {
      const textures = songData.$music_cover
      if (textures !== '') fs.value.remove('textures/cube/cover/song/' + id + '.png')
  
      delete settings[albumID + 'Album@cn80b37451.f'].$listContent[index]
      delete sounds['cube.song.' + id]
      delete sounds['cube.music.' + albumID].sounds[index]
    }

    fs.value.write('ui/_setting.json', settings)
    fs.value.write('sounds/sound_definitions.json', sounds)
    currentAlbum.value.songs.splice(index, 1)
  }
}

const triggerFileInput = () => {
  coverFileInput.value.click();
}
const triggerSongCoverFileInput = () => {
  songCoverFileInput.value.click();
}

const handleCoverFileChange = e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      newAlbumCoverPreview.value = event.target.result;
      newAlbumCover.value = file;
      const img = new Image();
      img.onload = () => {
        new simplecrop({
          src: img.src,
          cropSizePercent: 0.8,
          size: {
            width: Math.min(img.width, img.height),
            height: Math.min(img.width, img.height)
          },
          cropCallback: function(result) {
            const blob = dataURLtoBlob(result.toDataURL("image/png"));
            newAlbumCover.value = blob;
            newAlbumCoverPreview.value = URL.createObjectURL(blob);
          }
        });
      };
      img.src = URL.createObjectURL(file);
    };
    reader.readAsDataURL(file);
  }
}
const handleSongCoverFileChange = e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      newSongCoverPreview.value = event.target.result;
      newSongCover.value = file;

      const img = new Image();
      img.onload = () => {
        new simplecrop({
          src: img.src,
          cropSizePercent: 0.8,
          size: {
            width: Math.min(img.width, img.height),
            height: Math.min(img.width, img.height)
          },
          cropCallback: function(result) {
            const blob = dataURLtoBlob(result.toDataURL("image/png"));
            newSongCover.value = blob;
            newSongCoverPreview.value = URL.createObjectURL(blob);
          }
        });
      };
      img.src = URL.createObjectURL(file);
    };
    reader.readAsDataURL(file);
  }
}

const dataURLtoBlob = dataurl => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const resetAddAlbumFields = () => {
  newAlbumName.value = '';
  newAlbumArtist.value = '';
  newAlbumCover.value = null;
  newAlbumCoverPreview.value = null;
  showAddAlbumDialog.value = false;
  currentEditAlbumIndex.value = -1;
}
const resetAddSongFields = () => {
  audioFile.value = null;
  audioFileInputEmpty.value = false;
  audioFileNamePreview.value = '';
  newSongTitle.value = '';
  newSongDuration.value = '';
  newSongArtist.value = '';
  newSongCover.value = null;
  newSongCoverPreview.value = null;
  showAddSongDialog.value = false;
  currentEditSongIndex.value = -1;
}

const editAlbum = index => {
  const album = albums.value[index];
  newAlbumName.value = album.name;
  newAlbumArtist.value = album.artist;
  newAlbumCoverPreview.value = album.cover;
  currentEditAlbumIndex.value = index;
  showAddAlbumDialog.value = true;
}
const editSong = async index => {
  const song = currentAlbum.value.songs[index]
  
  // 如果文件还没加载，先加载以便编辑
  if (!song.file) {
    try {
      const albumId = currentAlbum.value.id
      const songBlob = await fs.value.read('sounds/album/' + albumId + '/' + song.id + '.ogg')
      song.file = songBlob
    } catch (e) {
      console.error('Failed to load audio file for editing:', e)
    }
  }
  
  audioFile.value = song.file
  audioFileNamePreview.value = song.fileName
  newSongTitle.value = song.title
  newSongDuration.value = song.duration
  newSongArtist.value = song.artist
  newSongCoverPreview.value = song.cover
  currentEditSongIndex.value = index
  audioFileInputEmpty.value = false
  showAddSongDialog.value = true
}

const showRemoveCover = (type, index) => {
  currentRemoveCoverType.value = type;
  currentRemoveCoverIndex.value = index;
  showRemoveCoverDialog.value = true;
}
const confirmRemoveCover = async () => {
  const settings = await fs.value.read('ui/_setting.json')
  if (currentRemoveCoverType.value === 'album') {
    const id = albums.value[currentRemoveCoverIndex.value].id
    const index = settings.music_album.modifications[0].value.findIndex(obj => Object.keys(obj)[0] === id + "_album@cn80b37451.album")
    if (index !== -1) {
      settings.music_album.modifications[0].value[index].$album_cover = '($cube_path_icons+custom)'
      settings.music_sidebar_content.modifications[0].value[index].$control_icon_base = '($cube_path_icons+custom)'
      settings[id + "Album@cn80b37451.f"].$album_cover = '($cube_path_icons+custom)'
      fs.value.remove('textures/cube/cover/album/' + id + '.png')
    }

    albums.value[currentRemoveCoverIndex.value].cover = false;
  } else if (currentRemoveCoverType.value === 'song' && currentAlbum.value) {
    const id = currentAlbum.value.id
    const songDataTemp = settings[id + "Album@cn80b37451.f"].$listContent[currentRemoveCoverIndex.value]
    const songData = songDataTemp[Object.keys(songDataTemp)[0]]
    if (songData) {
      songData.$music_cover = ""
      fs.value.remove('textures/cube/cover/song/' + songData.$music_id.replace("cube.song.", "") + '.png')
    }
    currentAlbum.value.songs[currentRemoveCoverIndex.value].cover = false;
  }
  fs.value.write('ui/_setting.json', settings)
  showRemoveCoverDialog.value = false;
}
const cancelRemoveCover = () => {
  showRemoveCoverDialog.value = false;
}

function moveElement(arr, currentIndex, targetIndex) {
  const [removedElement] = arr.splice(currentIndex, 1);
  arr.splice(targetIndex, 0, removedElement);
}
const moveUp = async (type, index) => {
  let settings = await fs.value.read('ui/_setting.json')
  const sounds = await fs.value.read('sounds/sound_definitions.json')
  if (type === 'album' && index > 0) {
    settings = repairSettings(settings)
    const album = albums.value[index]
    const id = album.id
    const i = settings.music_album.modifications[0].value.findIndex(obj => Object.keys(obj)[0] === id + "_album@cn80b37451.album")

    moveElement(settings.music_album.modifications[0].value, i, i - 1)
    moveElement(settings.music_sidebar_content.modifications[0].value, i, i - 1)
    moveElement(settings.music_content.modifications[0].value, i, i - 1)
    moveElement(albums.value, index, index - 1)
  } else if (type === 'song' && currentAlbum.value && index > 0) {
    const id = currentAlbum.value.id

    moveElement(settings[id + "Album@cn80b37451.f"].$listContent, index, index - 1)
    moveElement(sounds["cube.music." + id].sounds, index, index - 1)
    if (player.value.index === index) player.value.index = index - 1
    const song = currentAlbum.value.songs[index]
    moveElement(currentAlbum.value.songs, index, index - 1)
  }
  fs.value.write('ui/_setting.json', settings)
  fs.value.write('sounds/sound_definitions.json', sounds)
}
const moveDown = async (type, index) => {
  let settings = await fs.value.read('ui/_setting.json')
  const sounds = await fs.value.read('sounds/sound_definitions.json')
  if (type === 'album' && index < albums.value.length + 1) {
    settings = repairSettings(settings)
    const album = albums.value[index]
    const id = album.id
    const i = settings.music_album.modifications[0].value.findIndex(obj => Object.keys(obj)[0] === id + "_album@cn80b37451.album")

    moveElement(settings.music_album.modifications[0].value, i, i + 1)
    moveElement(settings.music_sidebar_content.modifications[0].value, i, i + 1)
    moveElement(settings.music_content.modifications[0].value, i, i + 1)
    moveElement(albums.value, index, index + 1)
  } else if (type === 'song' && currentAlbum.value && index < currentAlbum.value.songs.length - 1) {
    const id = currentAlbum.value.id

    moveElement(settings[id + "Album@cn80b37451.f"].$listContent, index, index + 1)
    moveElement(sounds["cube.music." + id].sounds, index, index + 1)
    if (player.value.index === index) player.value.index = index + 1
    const song = currentAlbum.value.songs[index]
    moveElement(currentAlbum.value.songs, index, index + 1)
  }
  fs.value.write('ui/_setting.json', settings)
  fs.value.write('sounds/sound_definitions.json', sounds)
}

const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
const triggerAudioFileInput = () => {
  audioFileInput.value.click();
}
const handleAudioFileChange = e => {
  const file = e.target.files[0]
  if (file) {
    const isAudioFile = file.type.startsWith('audio/') || 
      ['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(file.type)
    if (!isAudioFile) {
      error.value(t('editor.music.fileInvalid'))
      e.target.value = ''
      return
    }
    audioFileNamePreview.value = file.name
    const reader = new FileReader()
    reader.onload = event => {
      audioFile.value = event.target.result
      if (!newSongTitle.value) newSongTitle.value = file.name.replace(/\.[^/.]+$/, '')

      if (!isIOS) {
        let audio = new Audio()
        audio.addEventListener("loadedmetadata", () => {
          const duration = audio.duration
          newSongDuration.value = formatDuration(duration)
        })
        const blob = new Blob([event.target.result], {type: file.type})
        audio.src = URL.createObjectURL(blob)
      }
    };
    reader.readAsArrayBuffer(file)
    audioFileInputEmpty.value = false
  } else audioFileInputEmpty.value = true
}
const handleAudioDrop = e => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('audio/')) {
    audioFileNamePreview.value = file.name
    const reader = new FileReader()
    reader.onload = event => {
      audioFile.value = event.target.result
      if (!newSongTitle.value) newSongTitle.value = file.name.replace(/\.[^/.]+$/, '')

      if (!isIOS) {
        let audio = new Audio()
        audio.addEventListener("loadedmetadata", () => {
          const duration = audio.duration
          newSongDuration.value = formatDuration(duration)
        })
        const blob = new Blob([event.target.result], {type: file.type})
        audio.src = URL.createObjectURL(blob)
      }
    };
    reader.readAsArrayBuffer(file)
  }
}
const formatDuration = duration => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
const playSong = async index => {
  const song = currentAlbum.value.songs[index]
  
  // 如果文件还没加载，先从文件系统加载
  if (!song.file) {
    if (player.value.audio) stopSong()
    player.value.loading = true
    player.value.index = index
    
    try {
      // 找到当前专辑ID
      const albumId = currentAlbum.value.id
      const songBlob = await fs.value.read('sounds/album/' + albumId + '/' + song.id + '.ogg')
      song.file = songBlob
    } catch (e) {
      console.error('Failed to load audio file:', e)
      player.value.loading = false
      player.value.index = -1
      error.value(t('editor.music.loadFailed'))
      return
    }
  }
  
  if (song.file) {
    if (player.value.audio) stopSong()
    player.value.loading = false
    
    const audio = new Audio()
    audio.src = URL.createObjectURL(new Blob([song.file]))
    audio.play()
    
    const playingInterval = setInterval(() => {
      if (audio.duration) {
        player.value.pause = audio.paused
        // 拖动模式下暂停进度条自动更新，避免与手动拖动冲突
        if (!player.value.isDragging) {
          player.value.progress = (audio.currentTime / audio.duration) * 100
          player.value.progressText = formatDuration(audio.currentTime) + ' / '
        }
      }
      if (audio.ended) {
        stopSong()
      }
    }, 1000)
    
    player.value = {
      index,
      audio,
      interval: playingInterval,
      pause: false,
      progress: 0,
      progressText: '',
      loading: false
    }
  }
}
const togglePlaySong = (index, event) => {
  if (event.target.nodeName === "MDUI-MENU-ITEM") return
  // 如果正在拖动，不触发点击播放/暂停
  if (player.value.isDragging) return
  if (player.value.index === index) {
    if (player.value.pause) resumeSong()
    else pauseSong()
  } else {
    playSong(index)
  }
}
const pauseSong = () => {
  if (player.value.audio) {
    player.value.audio.pause()
    player.value.pause = true
  }
}
const resumeSong = () => {
  if (player.value.audio) {
    player.value.audio.play()
    player.value.pause = false
  }
}
const stopSong = () => {
  if (player.value && player.value.audio) {
    player.value.pause = false
    player.value.progress = 0
    player.value.progressText = ''
    player.value.loading = false
    player.value.isDragging = false
    player.value.dragProgress = 0
    player.value.dragProgressText = ''
    player.value.audio.pause()
    player.value.audio.src = ''
    player.value.audio = null
    player.value.index = -1
    clearInterval(player.value.interval)
  }
}
// 拖动进度相关函数
const handleSongMouseDown = (index, event) => {
  // 只对正在播放的歌曲启用拖动
  if (player.value.index !== index || player.value.loading) return
  if (event.target.nodeName === 'MDUI-BUTTON-ICON' || event.target.closest('mdui-dropdown')) return
  
  dragSongElement.value = event.currentTarget
  dragStartX.value = event.clientX
  
  // 设置长按定时器（500ms后进入拖动模式）
  longPressTimer.value = setTimeout(() => {
    player.value.isDragging = true
    player.value.dragProgress = player.value.progress
  }, 500)
}
const handleSongMouseMove = (index, event) => {
  if (!player.value.isDragging || player.value.index !== index) return
  if (!player.value.audio || !player.value.audio.duration) return
  
  const element = dragSongElement.value
  if (!element) return
  
  const rect = element.getBoundingClientRect()
  const elementWidth = rect.width
  
  // 计算拖动的偏移量和进度百分比
  const deltaX = event.clientX - dragStartX.value
  const progressDelta = (deltaX / elementWidth) * 100
  
  // 计算新进度并限制在0-100范围内
  let newProgress = player.value.progress + progressDelta
  newProgress = Math.max(0, Math.min(100, newProgress))
  
  // 更新拖动进度显示（只更新显示，不改变实际播放位置）
  player.value.dragProgress = newProgress
  const newTime = (newProgress / 100) * player.value.audio.duration
  player.value.dragProgressText = formatDuration(newTime) + ' / '
}
const handleSongMouseUp = (index) => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 如果正在拖动，应用最终进度
  if (player.value.isDragging && player.value.index === index && player.value.audio) {
    const newTime = (player.value.dragProgress / 100) * player.value.audio.duration
    player.value.audio.currentTime = newTime
    player.value.progress = player.value.dragProgress
    player.value.progressText = formatDuration(newTime) + ' / '
  }
  
  // 重置拖动状态
  player.value.isDragging = false
  player.value.dragProgress = 0
  player.value.dragProgressText = ''
  dragSongElement.value = null
}
const handleSongMouseLeave = (index) => {
  // 鼠标离开时如果正在拖动则结束拖动
  if (player.value.isDragging) {
    handleSongMouseUp(index)
  }
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}
// 触摸事件处理（移动端）
const handleSongTouchStart = (index, event) => {
  if (player.value.index !== index || player.value.loading) return
  if (event.target.nodeName === 'MDUI-BUTTON-ICON' || event.target.closest('mdui-dropdown')) return
  
  const touch = event.touches[0]
  dragSongElement.value = event.currentTarget
  dragStartX.value = touch.clientX
  
  longPressTimer.value = setTimeout(() => {
    player.value.isDragging = true
    player.value.dragProgress = player.value.progress
  }, 500)
}
const handleSongTouchMove = (index, event) => {
  if (!player.value.isDragging || player.value.index !== index) return
  if (!player.value.audio || !player.value.audio.duration) return
  
  // 阻止浏览器默认行为（滑动返回、页面滚动）
  event.preventDefault()
  event.stopPropagation()
  
  const touch = event.touches[0]
  const element = dragSongElement.value
  if (!element) return
  
  const rect = element.getBoundingClientRect()
  const elementWidth = rect.width
  
  const deltaX = touch.clientX - dragStartX.value
  const progressDelta = (deltaX / elementWidth) * 100
  
  let newProgress = player.value.progress + progressDelta
  newProgress = Math.max(0, Math.min(100, newProgress))
  
  player.value.dragProgress = newProgress
  const newTime = (newProgress / 100) * player.value.audio.duration
  player.value.dragProgressText = formatDuration(newTime) + ' / '
}
const handleSongTouchEnd = (index, event) => {
  // 拖动结束时也阻止默认行为，防止触发浏览器返回手势
  if (player.value.isDragging && event) {
    event.preventDefault()
    event.stopPropagation()
  }
  handleSongMouseUp(index)
}

// 批量添加
const multiSelectFileInput = ref(null)

const handleBatchAddFiles = () => {
  multiSelectFileInput.value.click()
}
const handleBatchAddFilesChange = async e => {
  const settings = await fs.value.read('ui/_setting.json')
  const sounds = await fs.value.read('sounds/sound_definitions.json')

  const files = e.target.files
  if (files.length > 0) {
    const audioFiles = Array.from(files).map((file, i) => {
      return new Promise(resolve => {
        if (file.type.startsWith('audio/')) {
          const reader = new FileReader()
          reader.onload = async event => {
            const id = randomString()

            currentAlbum.value.songs.push({
              title: file.name.replace(/\.[^/.]+$/, ''),
              artist: '',
              cover: false,
              duration: '0:00',
              file: event.target.result,
              fileName: file.name,
              id
            })
            const currentLength = currentAlbum.value.songs.length - 1

            const songDetails = {}
            newSongCover.value && fs.value.write('textures/cube/cover/song/'+id+'.png', newSongCover.value)
            songDetails[id + "@cn80b37451.m"] = {
              $music_name: file.name.replace(/\.[^/.]+$/, ''),
              $music_author: '',
              $music_id: "cube.song." + id,
              $music_cover: '',
              $music_minute: 0,
              $music_second: 0
            }
            sounds["cube.song." + id] = {
              category: "ui",
              sounds: [
                {
                  name: 'sounds/album/' + currentAlbum.value.id + '/' + id,
                  stream: true,
                  volume: 0.5
                }
              ]
            }
            if (!sounds["cube.music." + currentAlbum.value.id]) sounds["cube.music." + currentAlbum.value.id] = {
              category: "ui",
              sounds: []
            }
            sounds["cube.music." + currentAlbum.value.id].sounds.push({
              name: 'sounds/album/' + currentAlbum.value.id + '/' + id,
              stream: true,
              volume: 0.5
            })
            settings[currentAlbum.value.id + "Album@cn80b37451.f"].$listContent.push(songDetails)

            if (!isIOS) {
              const audio = new Audio()
              audio.addEventListener('loadedmetadata', () => {
                const durationString = formatDuration(audio.duration)
                const [minutes, seconds] = parseTime(durationString)
                currentAlbum.value.songs[currentLength].duration = durationString
                songDetails[id + "@cn80b37451.m"].$music_minute = minutes
                songDetails[id + "@cn80b37451.m"].$music_second = seconds
                fs.value.write('ui/_setting.json', settings)
              })
              audio.src = URL.createObjectURL(file)
            }
            resolve({
              buffer: event.target.result,
              fileName: file.name,
              index: currentLength,
              id
            })
          }
          reader.readAsArrayBuffer(file)
        } else resolve({})
      })
    })
    Promise.all(audioFiles)
      .then(async data => {
        if (data.length > 0) {
          fs.value.write('ui/_setting.json', settings)
          fs.value.write('sounds/sound_definitions.json', sounds)
          batchConvertFile(data)
        }
      })
      .catch(error => console.error(error))
  }
}

// 格式转换
const initFFmpeg = async () => {
  if (!fileConversion.value.isReady) {
    fileConversion.value.dialog = true
    fileConversion.value.progressText = t('editor.music.fileConversion.init')
    try {
      await ffmpeg.load()
      ffmpeg.on('progress', ({ progress, time }) => {
        fileConversion.value.progressText = t('editor.music.fileConversion.progressSingle', [parseFloat((progress * 100).toFixed(2)), parseFloat((time / 1000000).toFixed(2))])
        fileConversion.value.progressCurrent = parseFloat((progress * 100).toFixed(2)) / 100
      });
      fileConversion.value.isReady = true
      fileConversion.value.progressText = t('editor.music.fileConversion.initCompleted')
    } catch (e) {
      fileConversion.value.progressText = t('editor.music.fileConversion.error') + e
    }
  }
}
const batchConvertFile = async files => {
  if (!files) return
  await initFFmpeg()

  fileConversion.value.dialog = true
  fileConversion.value.details = t('editor.music.fileConversion.details', [0, files.length])
  fileConversion.value.progressCurrent = 0
  fileConversion.value.progressTotal = 0

  for (const [index, file] of Array.from(files).entries()) {
    if (file.fileName.endsWith('.ogg')) {
      fileConversion.value.details = t('editor.music.fileConversion.details', [index + 1, files.length])
      fileConversion.value.progressTotal = (index + 1) / files.length
      await fs.value.write('sounds/album/'+currentAlbum.value.id+'/'+file.id+'.ogg', new Blob([file.buffer], { type: 'audio/ogg' }))
      continue
    }

    fileConversion.value.currentFileName = file.fileName
    try {
      const uint8Array = new Uint8Array(file.buffer);
      await ffmpeg.writeFile(`input.${file.fileName.split('.').pop()}`, uint8Array)
      await ffmpeg.exec(['-i', `input.${file.fileName.split('.').pop()}`, 'output.ogg'])
      const data = await ffmpeg.readFile('output.ogg')

      fileConversion.value.details = t('editor.music.fileConversion.details', [index + 1, files.length])
      fileConversion.value.progressTotal = (index + 1) / files.length

      const details = currentAlbum.value.songs[file.index]
      details.file = data
      details.fileName = details.fileName.substring(0, details.fileName.lastIndexOf('.')) + '.ogg'

      await fs.value.write('sounds/album/'+currentAlbum.value.id+'/'+file.id+'.ogg', new Blob([data], { type: 'audio/ogg' }))
    } catch (e) {
      console.error(t('editor.music.fileConversion.error') + e)
    }
  }
  fileConversion.value.dialog = false
}

onMounted(async () => {
  try {
    await ffmpeg.load()
    ffmpeg.on('progress', ({ progress, time }) => {
      fileConversion.value.progressText = t('editor.music.fileConversion.progressSingle', [parseFloat((progress * 100).toFixed(2)), parseFloat((time / 1000000).toFixed(2))])
      fileConversion.value.progressCurrent = parseFloat((progress * 100).toFixed(2)) / 100
    })
    fileConversion.value.isReady = true
  } catch (e) {
    console.log('Initialization failed:', e)
  }

  try {
    if (!(await fs.value.exist('sounds/sound_definitions.json')))
      await fs.value.write('sounds/sound_definitions.json', {})
    if (!(await fs.value.exist('ui/_setting.json'))) {
      await fs.value.write('ui/_setting.json', {
        namespace: "cube_setting"
      })
    }

    const settings = await fs.value.read("ui/_setting.json")
    const sounds = await fs.value.read("sounds/sound_definitions.json")
    if (settings) {
      if (settings.music_album === undefined) {
        settings.music_album = {
          modifications: [
            {
              array_name: "controls",
              operation: "insert_back",
              value: []
            }
          ]
        }
        settings.music_sidebar_content = {
          modifications: [
            {
              array_name: "controls",
              operation: "insert_back",
              value: []
            }
          ]
        }
        settings.music_content = {
          modifications: [
            {
              array_name: "controls",
              operation: "insert_back",
              value: []
            }
          ]
        }
        await fs.value.write('ui/_setting.json', settings)
      }
      for (const [i, item] of settings.music_album.modifications[0].value.entries()) {
        const obj = item[Object.keys(item)[0]]
        const { $album_id: id, $album_cover, $album_name: name } = obj
        const hasCover = $album_cover !== "($cube_path_icons+custom)"
        const { $listContent: songs, $album_describe: artist } = settings[id + "Album@cn80b37451.f"]
        let cover = false
        if (hasCover) {
          try {
            const albumCoverData = await fs.value.read('textures/cube/cover/album/' + id + '.png')
            const albumBlob = new Blob([albumCoverData], { type: 'image/png' })
            cover = URL.createObjectURL(albumBlob)
          } catch (e) {
            console.error('Cover loading failed:', e)
          }
        }

        const songsArray = []
        for (const songControl of songs) {
          const song = songControl[Object.keys(songControl)[0]]
          const songID = song.$music_id.replace("cube.song.", "")

          let coverURL = false
          if (song.$music_cover) {
            try {
              const path = song.$music_cover.replace("($cube_path_base+'", "textures/cube/").replace("')", "")
              const coverData = await fs.value.read(path)
              const blob = new Blob([coverData], { type: 'image/png' })
              coverURL = URL.createObjectURL(blob)
            } catch (e) {
              console.error('Cover loading failed:', e)
            }
          }
          const songObj = {
            title: song.$music_name,
            duration: song.$music_minute + ':' + song.$music_second,
            artist: song.$music_author,
            cover: coverURL,
            file: null,
            fileName: songID + ".ogg",
            id: songID
          }
          songsArray.push(songObj)
        }

        albums.value.push({ cover, name, artist, id, songs: songsArray })
      }
    }
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  stopSong()
  if (albums.value.length === 0)
    fs.value.remove('sounds/sound_definitions.json')
})
</script>

<style scoped lang="scss">
#content {
  padding-top: 64px !important;
}

.add-fab {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: rgb(var(--mdui-color-surface));
  border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 1);
}

.breadcrumb {
  margin-left: 16px;
  color: rgb(var(--mdui-color-on-surface-variant));
  flex-grow: 1;
}

.music-container-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.music-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.scrollable-content {
  max-height: 100%;
  overflow-y: auto;
  .music-content {
    max-height: calc(100% - 70px);
  }
  .song-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    background-color: rgba(var(--mdui-color-primary-container), 0.5);
    border-radius: 2px;
    transition: width 0.3s cubic-bezier(0.39, 0.58, 0.57, 1);
    z-index: -1;
  }
}

.album-cover, .song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.album-artist {
  color: rgb(var(--mdui-color-on-surface-variant));
  font-size: 0.875rem;
}

.dialog-title {
  margin-top: 0;
}

.dialog-content {
  padding: 16px 0;
  .audio-upload {
    margin-top: 0.5rem;
    .upload-area {
      background: rgba(var(--mdui-color-surface-variant), 0.8);
      border-radius: 4px;
      padding: 0.4rem;
      text-align: center;
      transition: all 0.3s;
      &:hover {
        background-color: rgba(var(--mdui-color-surface-variant), 0.65);
      }
      .upload-prompt {
        display: flex;
        flex-direction: column;
        align-items: center;
        ion-icon {
          font-size: 1.2rem;
          margin-bottom: 0.2rem;
        }
        div {
          font-size: 0.75rem;
        }
      }
      .file-name {
        font-size: 0.75rem;
        color: rgb(var(--mdui-color-on-surface-variant));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  &.progress-dialog {
    .progress-info {
      margin-bottom: 16px;
      .file-name {
        font-weight: bold;
      }
      .file-name, .progress-text {
        margin-bottom: 8px;
      }
    }
    .conversion-details {
      margin-bottom: 8px;
    }
    mdui-linear-progress {
      margin-bottom: 8px;
    }
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}

.dialog-actions .mdui-button {
  margin-left: 8px;
}

.add-album-button,
.add-song-button {
  margin-left: auto;
}

.cover-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.upload-placeholder {
  border: 2px dashed rgba(var(--mdui-color-outline-variant), 1);
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;
  color: rgb(var(--mdui-color-on-surface-variant));
}

.add-cover {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  background-color: rgb(var(--mdui-color-surface-variant));
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--mdui-color-on-surface));
}

.add-cover ion-icon {
  font-size: 24px;
}

.cover-preview {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 8px;
  img {
    width: 56px;
    height: 56px;
  }
}

.album-name,
.song-title,
.album-artist,
.song-info {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-info {
  color: rgb(var(--mdui-color-on-surface-variant));
  font-size: 0.875rem;
}

/* 动画定义 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.6, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 列表项动画 */
.list-item-enter-active,
.list-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.6, 1);
}

.list-item-enter-from,
.list-item-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0.8;
  color: rgb(var(--mdui-color-on-surface-variant));
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  text-align: center;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>