<template>
  <div>
    <Topbar v-if="!isDesktop" />
    <div v-if="!isDesktop || isSidebar" :id="!isDesktop ? 'content' : ''" class="ns" style="width: 100%;height: var(--window-height);box-sizing: border-box;overflow-y: auto">
      <div class="header-section">
        <div class="avatar-container">
          <mdui-button 
            class="avatar-button"
            @click="triggerFileInput"
            variant="filled-tonal"
          >
            <mdui-avatar v-if="!pack_icon" class="avatar-placeholder">
              <ion-icon name="add-outline" style="width: 2rem;height: 2rem"></ion-icon>
            </mdui-avatar>
            <mdui-avatar v-else :src="pack_icon" class="avatar-image" />
          </mdui-button>
        </div>

        <div class="input-group">
          <mdui-text-field 
            :label="t('custom$new$name')"
            :value="pack_name"
            variant="filled"
            class="input-field"
            name="packName"
            @change="e => changePackInfo(e, 'name')"
          />
          
          <mdui-text-field
            :label="t('custom$new$desc')"
            :value="pack_description"
            variant="filled"
            class="input-field"
            name="packDescription"
            max-rows="1"
            autosize
            @change="e => changePackInfo(e, 'description')"
          />
        </div>
      </div>

      <div class="menu-content">
        <div class="menu-card">
          <mdui-list>
            <mdui-list-item
              v-for="(item, index) in menuItems"
              :key="index"
              @click="menuOnClick(item.path)"
            >
              <ion-icon slot="icon" style="height: 1.2em;width: 1.2em" :name="item.icon"></ion-icon>
              {{ t(item.text) }}
              <ion-icon slot="end-icon" style="height: 1.1em;width: 1.1em" name="chevron-forward-outline" />
            </mdui-list-item>
            <div v-if="isSidebar" style="padding: 0.5rem 0.5rem 0 0.5rem">
              <mdui-button
                variant="filled"
                full-width
                @click="showDownloadDialog = true"
              >
                {{ t('gui$download') }}
                <ion-icon slot="icon" name="download-outline" />
              </mdui-button>
            </div>
          </mdui-list>
        </div>
      </div>

      <mdui-fab
        class="download-fab"
        variant="primary"
        v-if="!isSidebar"
        @click="showDownloadDialog = true"
      >
        <ion-icon slot="icon" name="download-outline" />
      </mdui-fab>
    </div>

    <div v-if="isDesktop && !isSidebar" class="ns desktop-home">
      <h1>{{ t("editor.empty_title") }}</h1>
      <h2>{{ t("editor.empty_subtitle") }}</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import * as simplecrop from "../simpleCrop"
import Topbar from '../components/Topbar'

const { t } = useI18n();
const router = useRouter();
const fs = inject("fs");
const showDownloadDialog = inject("showDownloadDialog");

defineProps({
  isDesktop: {
    type: Boolean,
    default: false
  },
  isSidebar: {
    type: Boolean,
    default: false
  }
})

const menuItems = ref([
  { text: 'editor.music.music', icon: 'musical-note-outline', path: '/editor/music' },
  { text: 'bg$title', icon: 'image-outline', path: '/editor/bg' },
  { text: 'editor.settings.title', icon: 'settings-outline', path: '/editor/settings' },
  { text: 'theme$title', icon: 'brush-outline', path: '/editor/theme' },
  { text: 'editor.panel.title', icon: 'briefcase-outline', path: '/editor/panel' },
  { text: 'editor.word.screenTitle', icon: 'chatbox-outline', path: '/editor/word' },
  { text: 'editor.guide.title', icon: 'help-outline', path: '/guide' }
])

const menuOnClick = path => {
  router.push(path)
}

const pack_icon = ref(null);
const pack_name = ref("");
const pack_description = ref("");

const changePackInfo = async (e, prefix) => {
  let manifestJSON = await fs.value.read("manifest.json");
  let globalVariablesJSON = await fs.value.read("ui/_global_variables.json");
  manifestJSON.header[prefix === "name" ? "name" : "description"] = e.target.value;
  globalVariablesJSON[prefix === "name" ? "$cube_custom_name" : "$cube_custom_desc"] = e.target.value;
  await fs.value.write('manifest.json', manifestJSON);
  await fs.value.write('ui/_global_variables.json', globalVariablesJSON);
  if (prefix === "name") pack_name.value = e.target.value;
  else pack_description.value = e.target.value
}

const triggerFileInput = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = handleFileSelect;
  input.click();
  input.remove()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const img = new Image()
  img.src = URL.createObjectURL(file)
  
  img.onload = () => {
    if (img.width !== img.height) {
      new simplecrop({
        src: img.src,
        cropSizePercent: 0.8,
        size: {
          width: Math.min(img.width,img.height),
          height: Math.min(img.width,img.height)
        },
        cropCallback: function(result) {
          pack_icon.value = result.toDataURL("image/png");
          changePackIcon(pack_icon.value);
          result.width = 0;
          result.height = 0
        }
      })
    } else {
      pack_icon.value = img.src;
      changePackIcon(img.src)
    }
  }
}

const changePackIcon = async src => {
  const img = new Image();
  img.src = src;

  await new Promise((resolve) => {
    if (img.complete) resolve();
    else img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(blob => {
    fs.value.write('pack_icon.png', blob)
  }, 'image/png');
}

onMounted(async () => {
  const manifest = await fs.value.read('manifest.json');
  const icon = await fs.value.read('pack_icon.png');
  if (manifest && manifest.format_version) {
    pack_name.value = manifest.header ? manifest.header.name : "";
    pack_description.value = manifest.header ? manifest.header.description : "";
  }
  if (icon !== null) {
    pack_icon.value = URL.createObjectURL(icon);
  }
})
</script>

<style lang="scss" scoped>
#content {
  padding-top: 64px !important;
}

:deep(.mdui-list-item ion-icon[slot="icon"]) {
  width: 1.2em !important;
  height: 1.2em !important;
  font-size: 1.2em !important;
}

:deep(.mdui-list-item ion-icon[slot="end-icon"]) {
  width: 1.1em !important;
  height: 1.1em !important;
  font-size: 1.1em !important;
}

.desktop-home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  h1, h2 {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  h2 {
    margin-top: 0.5rem;
    font-weight: normal;
  }
}

.header-section {
  display: flex;
  gap: 2rem;
  padding: 1.5rem;
  align-items: flex-start;
  > .avatar-container {
    flex-shrink: 0;
    margin-top: 0.8rem;
    > .avatar-button {
      padding: 0;
      background: rgb(var(--mdui-color-primary-container));
      border-radius: 50%;
      width: 80px;
      height: 80px;
      .avatar-placeholder {
        background: none;
        height: 80px;
        width: 80px;
      }
      .avatar-placeholder, .avatar-image {
        width: 80px;
        height: 80px;
        font-size: 2rem;
        aspect-ratio: 1;
      }
    }
  }
  .input-group {
    flex-grow: 1;
    display: grid;
    gap: 0.4rem;
    height: 4rem;
  }
}

.menu-content {
  box-sizing: border-box;
  margin-top: 0.5em;
  padding: 0 1.5rem 2rem;
  width: 100%;
  > .menu-card {
  background: rgba(var(--mdui-color-surface-container), 0.6);
  border-radius: 12px;
  padding: 0;
  width: 100%;
    > .mdui-list {
      padding: 0.5rem 0;
      > .mdui-list-item {
        padding: 1rem 1.5rem;
      }
    }
  }
}

.download-fab {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  --mdui-color-surface-container: var(--mdui-color-primary-container);
}
</style>