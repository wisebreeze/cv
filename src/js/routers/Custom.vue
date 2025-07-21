<template>
<div>
  <Topbar />
  <div id="content" class="ns custom-route" style="height: var(--window-height);">
    <div class="content-container">
      <div class="header-section">
        <h1 class="main-title">{{ $t("custom$title") }}</h1>
        <p class="subtitle">{{ $t("custom$desc") }}</p>
      </div>

      <div class="card-container">
        <mdui-card 
          clickable
          class="action-card" 
          v-for="(btn, index) in buttons" 
          :key="index"
          @click="handleAction(btn.action)"
        >
          <div class="card-content">
            <ion-icon class="card-icon" :name="btn.icon"></ion-icon>
            <span class="card-text">{{ btn.text }}</span>
          </div>
        </mdui-card>
      </div>
    </div>
    <input
      type="file"
      ref="zipInput"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar'

const { t } = useI18n()
const router = useRouter()
const fs = inject("fs")

const zipInput = ref(null)

const manifestJSON = {
  format_version: 2,
  header: {
    name: "",
    description: "",
    uuid: "",
    version: [1,0,0],
    min_engine_version: [1,13,0]
  },
  modules: [
    {
      type: "resources",
      uuid: "",
      version: [1,0,0]
    }
  ]
}

const buttons = ref([
  { text: t("gui$new"), action: 'create', icon: 'add-outline' },
  { text: t('gui$edit'), action: 'edit', icon: 'create-outline' }
])

const handleAction = async (action) => {
  switch (action) {
    case "create":
      const getUUID = await import('../functions/uuid')
      manifestJSON.header.uuid = getUUID.default()
      manifestJSON.modules[0].uuid = getUUID.default()
      await fs.value.write('manifest.json', manifestJSON)

      await fs.value.write('ui/_global_variables.json', {
        $cube_custom_boolean: true,
        $cube_custom_from_website: true,
        $cube_custom_name: "",
        $cube_custom_desc: "",
        $cube_custom_uuid: manifestJSON.header.uuid
      })

      router.push(window.innerWidth <= 768 ? '/editor' : '/editor/music')
      break
    case "edit":
      zipInput.value.click()
      break
  }
}

const handleFileSelect = event => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onload = async e => {
    const arrayBuffer = e.target.result;
    await fs.value.remove('/')
    await fs.value.importFromZip(arrayBuffer)
    router.push(window.innerWidth <= 768 ? '/editor' : '/editor/music')
  }
}

onMounted(() => {
  try {
    // fs.value.clearFileSystem('/')
  } catch (e) {
    console.log('error: ', e)
  }
})
</script>

<style lang="scss" scoped>
.custom-route {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  padding-top: 64px !important;
  background: rgb(var(--mdui-color-surface));

  .content-container {
    width: 100%;
    max-width: 800px;

    .header-section {
      margin-bottom: 2.5rem;
      text-align: left;

      .main-title {
        color: rgb(var(--mdui-color-on-surface));
        margin-block-start: 0;
        margin-block-end: 0;
        margin-bottom: 0.5rem;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .subtitle {
        color: rgb(var(--mdui-color-on-surface-variant));
        opacity: 0.8;
        margin-block-start: 0;
        margin-block-end: 0;
      }
    }

    .card-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      
      .action-card {
        background: rgb(var(--mdui-color-surface-container)) !important;
        border-radius: 8px !important;
        padding: 1.5rem;
        height: 120px;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:hover {
          transform: translateY(-2px);
        }

        .card-content {
          height: 100%;
          position: relative;
          
          .card-icon {
            position: absolute;
            top: 0;
            left: 0;
            font-size: 2rem;
            color: rgb(var(--mdui-color-primary));
          }

          .card-text {
            position: absolute;
            bottom: 0;
            left: 0;
            color: rgb(var(--mdui-color-on-surface));
          }
        }
      }
    }
  }
}

@media (min-width: 768px) {
  .content-container {
    width: 40% !important;
  }
}

@media (max-width: 767px) {
  .content-container {
    width: 70% !important;

    .card-container {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>