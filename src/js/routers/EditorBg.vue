<template>
  <div>
    <Topbar v-if="!isDesktop" />
    <div :id="!isDesktop ? 'content' : ''" class="ns" style="width: 100%;height: var(--window-height);box-sizing: border-box;overflow-x: hidden;overflow-y: auto">
      <mdui-dialog :open="infoDialogOpen" @close="infoDialogOpen = false">
        <div slot="headline">{{ t('bg$info') }}</div>
        <mdui-text-field 
          :value="delay"
          :disabled="handleImage"
          :label="t('bg$interval')"
          inputmode="decimal"
          style="margin-bottom: 5px"
          @change="delay = $event.target.value"
        />
        <mdui-text-field 
          :value="duration"
          :disabled="handleImage"
          :label="t('bg$duration')"
          inputmode="decimal"
          style="margin-bottom: 5px"
          @change="duration = $event.target.value"
        />
        <mdui-text-field 
          :value="blurRadius"
          :label="t('bg$blurRadius')"
          inputmode="decimal"
          style="margin-bottom: 5px"
          @change="blurRadius = $event.target.value"
        />
        <div slot="action">
          <mdui-button variant="text" style="margin-right: 0.2rem" @click="cancelBtn">{{ t('gui$cancel') }}</mdui-button>
          <mdui-button variant="filled" @click="continueBtn">{{ t('gui$continue') }}</mdui-button>
        </div>
      </mdui-dialog>
  
      <div class="editor-container">
        <input 
          type="file" 
          ref="uploadFile" 
          @change="fileHandle" 
          class="file-input"
        />
        
        <div 
          class="upload-area"
          :style="(!bgData.live && bgData.img) || (bgData.live && bgData.src) ? '' : 'border: 2px dashed rgba(var(--mdui-color-primary), 0.5)'"
          @click="handleClickOrDrop"
          @drop.prevent="handleDrop"
          @dragover.prevent="allowDrop"
        >
          <div v-if="(!bgData.live && !bgData.img) || (bgData.live && !bgData.src)" class="upload-prompt">
            <ion-icon name="cloud-upload-outline"/>
            <div>{{ t('gui$upload') }}</div>
          </div>
          
          <video 
            v-if="bgData.live && bgData.src" 
            ref="previewVideo" 
            :src="bgData.src" 
            controls 
            loop 
            muted
            class="preview-media"
          />
          
          <img 
            v-if="!bgData.live && bgData.img" 
            :src="bgData.img" 
            alt="Background" 
            class="preview-media"
          >
        </div>
        
        <div class="settings-section">
          <div style="padding: 16px">
            <div class="progress-header">
              <span>{{ progressText }}</span>
              <span>{{ progressPercentage }}</span>
            </div>
            <mdui-linear-progress :value="progressValue" />
  
            <mdui-button 
              variant="filled" 
              class="upload-btn"
              v-if="isCompleted && (bgData.img || bgData.src)"
              @click="handleClickOrDrop"
            >
              {{ t('gui$upload') }}
            </mdui-button>
          </div>

          <mdui-list style="padding: 0">
            <mdui-list-item>
              {{ t('bg$live') }}
              <mdui-switch 
                slot="end-icon" 
                :checked="bgData.live" 
                @change="liveSwitchFn"
              />
            </mdui-list-item>
            
            <mdui-list-item>
              {{ t('bg$resetStatic') }}
              <mdui-button 
                slot="end-icon" 
                variant="outlined" 
                @click="resetStatic"
              >
                {{ t('gui$reset') }}
              </mdui-button>
            </mdui-list-item>
            
            <mdui-list-item>
              {{ t('bg$resetLive') }}
              <mdui-button 
                slot="end-icon" 
                variant="outlined" 
                @click="resetLive"
              >
                {{ t('gui$reset') }}
              </mdui-button>
            </mdui-list-item>
          </mdui-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar'

const { t } = useI18n()
const router = useRouter()
const fs = inject("fs")

defineProps({
  isDesktop: {
    type: Boolean,
    default: false
  }
})

// 文件
const setVariables = async obj => {
  let file = await fs.value.read("ui/_global_variables.json")
  file = Object.assign((file || {}), obj)
  fs.value.write("ui/_global_variables.json", file)
}

// 响应式数据
const uploadFile = ref(null)
const previewVideo = ref(null)
const infoDialogOpen = ref(false)
const handleImage = ref(false)
const isCompleted = ref(false)

const delay = ref("0.3")
const duration = ref("0.12")
const blurRadius = ref("10")

const progressText = ref(t('bg$progress'))
const progressPercentage = ref('0%')
const progressValue = ref(0)

const bgData = reactive({
  live: false,
  src: null,
  img: null
})

let loopInterval = null
let isLooping = false
let frameArr = []

// 进度更新
const updateProgress = (current, total) => {
  const progress = total === 0 ? 0 : current / total
  progressValue.value = progress
  progressPercentage.value = `${(progress * 100).toFixed(1)}%`
  progressText.value = t("bg$progress$videoProcessing", [`${current}`, `${total}`])
}

// 视频循环处理
const handleVideoEnd = () => {
  if (isLooping && previewVideo.value) {
    previewVideo.value.currentTime = 0
    previewVideo.value.play().catch(console.error)
  }
}

const startVideoLoop = () => {
  if (isLooping || !previewVideo.value) return
  isLooping = true
  previewVideo.value.play().catch(console.error)
  previewVideo.value.addEventListener('ended', handleVideoEnd)
  loopInterval = setInterval(() => {
    if (previewVideo.value.paused && isLooping) {
      previewVideo.value.currentTime = 0
      previewVideo.value.play()
    }
  }, 1000)
}

const stopVideoLoop = () => {
  isLooping = false
  if (previewVideo.value) {
    previewVideo.value.pause()
    previewVideo.value.removeEventListener('ended', handleVideoEnd)
  }
  clearInterval(loopInterval)
}

// 文件处理
const fileHandle = e => {
  const file = e.target.files[0]
  if (!file) return

  isCompleted.value = false
  if (file.type.indexOf("video/") === 0) {
    bgData.live = true
    handleImage.value = false
    const video = document.createElement('video')
    video.addEventListener("loadedmetadata", () => {
      if (video.duration <= 1200) {
        infoDialogOpen.value = true
      } else {
        cancelBtn()
        mdui.snackbar({
          message: t("bg$longVideo"),
          placement: "top",
          autoCloseDelay: 3000,
          closeable: true
        })
      }
    })
    bgData.src = URL.createObjectURL(file)
    video.src = bgData.src
  } else if (file.type.indexOf("image/") === 0) {
    bgData.live = false
    handleImage.value = true
    infoDialogOpen.value = true
  } else {
    cancelBtn()
    mdui.snackbar({
      message: t("bg$invalid"),
      placement: "top",
      autoCloseDelay: 3000,
      closeable: true
    })
  }
}

const cancelBtn = () => {
  infoDialogOpen.value = false
  handleImage.value = false
}

const continueBtn = async () => {
  delay.value = Math.max(0, Math.min(parseFloat(delay.value), 80))
  duration.value = Math.max(0, Math.min(parseFloat(duration.value), 20))
  blurRadius.value = Math.max(1, Math.min(parseInt(blurRadius.value), 50))
  if (delay.value <= 0) delay.value = 0.3
  if (duration.value <= 0) duration.value = 0.12
  infoDialogOpen.value = false
  setVariables({ $cube_custom_bg: true })

  if (isNaN(delay.value)) {
    progressText.value = t("bg$progress$delayError")
    cancelBtn()
  }
  if (isNaN(duration.value)) {
    progressText.value = t("bg$progress$durationError")
    cancelBtn()
  }
  if (isNaN(blurRadius.value)) {
    progressText.value = t("bg$progress$blurRadiusError")
    cancelBtn()
  }

  if (handleImage.value) {
    progressValue.value = 0
    progressPercentage.value = `0%`
    progressText.value = t("bg$progress$load")
    setVariables({ $cube_set_0a57c067: false })

    var reader = new FileReader()
    reader.onload = function(event) {
      var image = new Image()
      image.onload = async function(){
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0)
        bgData.img = canvas.toDataURL('image/jpeg')
        await new Promise(resolve => canvas.toBlob(async blob => {
          await fs.value.write("textures/cube/bg/bg.jpg", blob)
          resolve()
        }))

        progressValue.value = 0.5
        progressPercentage.value = `50.0%`;
        progressText.value = t("bg$progress$blur")

        const requestIdle = window.requestIdleCallback||function(handler){var startTime=Date.now();return setTimeout(function(){handler({didTimeout:false,timeRemaining:function(){return Math.max(0,50.0-(Date.now()-startTime))}})},1)}

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const processor = optimizedGaussBlur(imgData, blurRadius)
        const generator = processor.process()

        async function nextChunk(deadline) {
          while (true) {
            const { value: task, done } = generator.next()
            if (done) {
              // 处理完成
              ctx.putImageData(imgData, 0, 0)
              
              await new Promise(resolve => canvas.toBlob(async blob => {
                await fs.value.write("textures/cube/bg/blur.jpg", blob)
                resolve()
              }))
              progressValue.value = 1
              progressPercentage.value = `100.0%`
              progressText.value = t("bg$progress$done")
              isCompleted.value = true
              cancelBtn()
              break
            }
            
            // 执行当前分块任务
            task()
            
            if (deadline.timeRemaining() <= 5) {
              // 时间不足，等待下一个空闲周期
              requestIdle(nextChunk)
              break
            }
          }
        }
        requestIdle(nextChunk)
      }
      image.src=event.target.result
    }
    reader.readAsDataURL(uploadFile.value.files[0])
  } else {
    setVariables({ $cube_set_0a57c067: true })
    if (await fs.value.exist("textures/cube/frame")) {
      await fs.value.remove("textures/cube/frame")
      await fs.value.remove("textures/cube/frameBlur")
    }
    progressText.value = t("bg$progress$videoLoading")

    const file = uploadFile.value.files[0]
    const video = document.createElement('video')
    video.muted = true
    video.src = URL.createObjectURL(file)
    video.style.display = 'none'
    document.body.appendChild(video)
    await fs.value.write("assets/cube/preview.txt", URL.createObjectURL(file))

    video.addEventListener('loadedmetadata', () => {
      startVideoLoop()
      video.play().catch(console.error)
      detectFrameRate(video)
    })
  }
}

const detectFrameRate = video => {
  let frameRate = 30;
  if (typeof video.requestVideoFrameCallback === "function") {
    let lastTime = performance.now();
    let frameCount = 0;
    const checkFrameRate = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        frameRate = Math.round((frameCount * 1000) / (now - lastTime));
        extractFrames(video, frameRate);
      } else {
        video.requestVideoFrameCallback(checkFrameRate);
      }
    }
    video.requestVideoFrameCallback(checkFrameRate);
  } else {
    extractFrames(video, frameRate);
  }
}

const extractFrames = (video, frameRate) => {
  const frameInterval = Math.round(delay.value * frameRate)
  const totalFrames = Math.floor(video.duration * frameRate)
  const totalImages = Math.ceil(totalFrames / frameInterval)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  let currentImage = 0
  progressText.value = t("bg$progress$videoProcessing", "0", `${totalImages}`)

  video.addEventListener("seeked", function onSeeked() {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(blob => {
      const img = new Image()
      img.src = URL.createObjectURL(blob)
      img.onload = () => {
        frameArr.push(img)
        fs.value.write("textures/cube/frame/" + (currentImage===0?"frame.jpg":`frame_${currentImage}.jpg`), blob)
        currentImage++
        updateProgress(currentImage, totalImages)
        if (currentImage < totalImages) video.currentTime = (currentImage * frameInterval) / frameRate
        else {
          completeProcessing(video, totalImages)
        }
      }
    }, 'image/jpeg')
  })

  video.currentTime = 0
}

const completeProcessing = async (video, total) => {
  const startAllTime = performance.now()
  progressText.value = t("bg$progress$videoProcessingDone", `${total}`)
  document.body.removeChild(video)
  video = null

  progressValue.value = 0
  progressPercentage.value = `0%`

  let startTime = performance.now()
  let lastImageTime = startTime
  let remainingTime = t("bg$progress$videoBlurUnknown")

  const requestIdle = window.requestIdleCallback||function(handler){var startTime=Date.now();return setTimeout(function(){handler({didTimeout:false,timeRemaining:function(){return Math.max(0,50.0-(Date.now()-startTime))}})},1)}

  const timeUpdater = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000
    const timeStr = remainingTime === t("bg$progress$videoBlurUnknown") ? remainingTime : `${remainingTime}s`
    progressText.value = t("bg$progress$videoBlur", [`${processedCount}`, `${frameArr.length}`, `${timeStr}`])
  }, 500)

  let processedCount = 0
  const processQueue = async () => {
    while (processedCount < frameArr.length) {
      await new Promise(resolve => {
        requestIdle(async deadline => {
          // 在空闲时段内尽可能处理多个任务
          while (deadline.timeRemaining() > 5 && processedCount < frameArr.length) {
            const img = frameArr[processedCount]
            const singleStart = performance.now()
            await processBlur(img, blurRadius.value, processedCount)

            // 计算单张耗时
            const singleDuration = performance.now() - singleStart
            const avgTime = singleDuration / (processedCount > 3 ? 3 : 1)
            remainingTime = ((avgTime * (frameArr.length - processedCount - 1)) / 1000).toFixed(1)

            // 更新进度
            processedCount++
            const progress = (processedCount / frameArr.length * 100).toFixed(1)
            progressValue.value = Number.parseInt(progress) / 100
            progressPercentage.value = `${progress}%`
          }
          resolve()
        })
      })
    }
    clearInterval(timeUpdater)
    progressText.value = t("bg$progress$videoBlurDone", [`${total}`, `${formatProcessingTime(startAllTime)}`])
    editFrameFile()
  }
  processQueue()
}

const formatProcessingTime = startTime => {
  const seconds = ((performance.now() - startTime) / 1000).toFixed(1);
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return t("bg$progress$videoBlurTimeMinute", [`${mins}`, `${secs.toString().padStart(2, '0')}`]);
  }
  return t("bg$progress$videoBlurTimeSecond", [`${seconds}`]);
}

const processBlur = async (img, radius, progress) => {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const processor = optimizedGaussBlur(imgData, radius);
    const generator = processor.process();

    // 空闲时间调度
    const requestIdle = window.requestIdleCallback||function(handler){var startTime=Date.now();return setTimeout(function(){handler({didTimeout:false,timeRemaining:function(){return Math.max(0,50.0-(Date.now()-startTime))}})},1)};

    function nextChunk(deadline) {
      while (true) {
        const { value: task, done } = generator.next();
        if (done) {
          // 处理完成
          ctx.putImageData(imgData, 0, 0);
          
          canvas.toBlob(blob => {
            fs.value.write("textures/cube/frameBlur/" + (progress===0?"frame.jpg":`frame_${progress}.jpg`), blob);
          }, "image/jpeg");

          resolve();
          break;
        }
        
        // 执行当前分块任务
        task();
        
        if (deadline.timeRemaining() <= 5) {
          // 时间不足，等待下一个空闲周期
          requestIdle(nextChunk);
          break;
        }
      }
    }
    requestIdle(nextChunk)
  });
}

const optimizedGaussBlur = (imgData, radius) => {
  const pixels = imgData.data
  const width = imgData.width
  const height = imgData.height
  
  // 生成高斯核
  const kernel = buildKernel(radius)
  const chunkSize = 50 // 每块处理50行
  
  // 创建中间缓冲区
  const tempPixels = new Uint8ClampedArray(pixels.length)
  
  return {
    * process() {
      // 水平模糊分块处理
      for (let y = 0; y < height; y += chunkSize) {
        yield () => horizontalBlurChunk(pixels, tempPixels, width, height, kernel, y, Math.min(y + chunkSize, height))
      }
      // 垂直模糊分块处理
      for (let x = 0; x < width; x += chunkSize) {
        yield () => verticalBlurChunk(tempPixels, pixels, width, height, kernel, x, Math.min(x + chunkSize, width))
      }
    }
  };
}

const buildKernel = radius => {
  const sigma = radius / 3
  const kernel = []
  let sum = 0

  for (let i = -radius; i <= radius; i++) {
    const weight = Math.exp(-(i*i)/(2*sigma*sigma))
    kernel.push(weight)
    sum += weight
  }

  return kernel.map(w => w / sum)
}

const horizontalBlurChunk = (src, dest, width, height, kernel, startY, endY) => {
  const radius = (kernel.length - 1) >> 1
  
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0
      
      for (let i = -radius; i <= radius; i++) {
        const px = clamp(x + i, 0, width - 1)
        const pos = (y * width + px) * 4
        
        const weight = kernel[i + radius]
        a += src[pos] * weight
        r += src[pos + 1] * weight
        g += src[pos + 2] * weight
        b += src[pos + 3] * weight
      }

      const destPos = (y * width + x) * 4
      dest[destPos] = a
      dest[destPos + 1] = r
      dest[destPos + 2] = g
      dest[destPos + 3] = b
    }
  }
}

const verticalBlurChunk = (src, dest, width, height, kernel, startX, endX) => {
  const radius = (kernel.length - 1) >> 1
  
  for (let x = startX; x < endX; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0, g = 0, b = 0, a = 0
      
      for (let i = -radius; i <= radius; i++) {
        const py = clamp(y + i, 0, height - 1)
        const pos = (py * width + x) * 4
        
        const weight = kernel[i + radius]
        a += src[pos] * weight
        r += src[pos + 1] * weight
        g += src[pos + 2] * weight
        b += src[pos + 3] * weight
      }
      
      const destPos = (y * width + x) * 4
      dest[destPos] = a
      dest[destPos] = a
      dest[destPos + 1] = r
      dest[destPos + 2] = g
      dest[destPos + 3] = b
    }
  }
}

const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

var editFrameFile = async () => {
  var frameJSON={"namespace":"cncded832c","a":{"type":"image","size":["100%","100%"],"fill":true},"b":{"anim_type":"offset","duration":duration.value},"c":{"type":"panel","controls":[{"a@cncded832c.e":{"size":["100%","100%"],"anchor_from":"center","anchor_to":"center"}},{"b":{"type":"image","texture":"textures/cube/frame/frame","layer":-2,"size":["100%","100%"],"fill":true}}]},"d":{"type":"panel","controls":[{"a@cncded832c.f":{"size":["100%","100%"],"anchor_from":"center","anchor_to":"center"}},{"b":{"type":"image","texture":"textures/cube/frameBlur/frame","layer":-2,"size":["100%","100%"],"fill":true}}]},"e@ct.vp":{"offset":"@cncded832c.1","controls":[]},"f@ct.vp":{"offset":"@cncded832c.1","controls":[]}}
  frameJSON = JSON.parse(JSON.stringify(frameJSON))
  var len=frameArr.length
  frameArr.forEach((e,i)=>{
    frameJSON["e@ct.vp"]["controls"].push({
      [i+"@cncded832c.a"]:{texture:"textures/cube/frame/frame"+(i===0?"":"_"+i)}
    })
    frameJSON["f@ct.vp"]["controls"].push({
      [i+"@cncded832c.a"]:{texture:"textures/cube/frameBlur/frame"+(i===0?"":"_"+i)}
    })
    frameJSON[(i+1)+"@cncded832c.b"]={
      from:[0,`${i*-100}%`],
      to:[0,`${i*-100}%`],
      next:`@cncded832c.${i===len-1?"1":i+2}`
    }
  })
  await fs.value.write("assets/cube/frame.ui", frameJSON)
  stopVideoLoop()
  isCompleted.value = true
  cancelBtn()
}

const liveSwitchFn = () => {
  bgData.live = !bgData.live
  setVariables({ $cube_custom_bg: bgData.live })
}

const resetStatic = () => {
  mdui.dialog({
    headline: t("gui$reset"),
    description: t("bg$resetStaticDialog"),
    closeOnOverlayClick: true,
    closeOnEsc: true,
    actions: [
      { text: t("gui$cancel") },
      {
        text: t("gui$reset"),
        onClick: async () => {
          bgData.live = false
          bgData.img = null
          if (await fs.value.exist("textures/cube/bg/bg.jpg")) {
            fs.value.remove("textures/cube/bg/bg.jpg")
            fs.value.remove("textures/cube/bg/blur.jpg")
          }
          liveSwitchFn()
        }
      }
    ]
  })
}

const resetLive = () => {
  mdui.dialog({
    headline: t("gui$reset"),
    description: t("bg$resetLiveDialog"),
    closeOnOverlayClick: true,
    closeOnEsc: true,
    actions: [
      { text: t("gui$cancel") },
      {
        text: t("gui$reset"),
        onClick: async () => {
          bgData.live = false
          bgData.src = null
          frameArr = []
          if (await fs.value.exist("textures/cube/frame")) {
            fs.value.remove("textures/cube/frame")
            fs.value.remove("textures/cube/frameBlur")
            fs.value.remove("assets/cube/frame.ui")
          }
          liveSwitchFn()
        }
      }
    ]
  })
}

const allowDrop = (e) => {
  e.preventDefault()
}

const handleDrop = (e) => {
  e.preventDefault()
  if (e.dataTransfer.files.length > 0) {
    uploadFile.value.files = e.dataTransfer.files
    fileHandle({ target: uploadFile.value })
  }
}

const handleClickOrDrop = () => {
  uploadFile.value.click()
}

onBeforeUnmount(() => {
  stopVideoLoop()
})

onMounted(async () => {
  if (await fs.value.exist("ui/_global_variables.json")) {
    const variables = await fs.value.read("ui/_global_variables.json")
    bgData.live = variables.$cube_set_0a57c067 || false
  }
  if (await fs.value.exist("assets/cube/preview.txt")) {
    const video = await fs.value.read("assets/cube/preview.txt")
    bgData.src = video
  }
  if (await fs.value.exist("textures/cube/bg/bg.jpg")) {
    const image = await fs.value.read("textures/cube/bg/bg.jpg")
    const imageReader = new FileReader()
    imageReader.onload = () => {
      bgData.img = imageReader.result
    }
    imageReader.readAsDataURL(image)
  }
  isCompleted.value = (!bgData.live && bgData.img) || (bgData.live && bgData.src)
})
</script>

<style scoped lang="scss">
#content {
  padding-top: 64px !important;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  padding: 16px;
  overflow-x: hidden;
  overflow-y: auto;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: var(--mdui-shape-corner-medium);
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(var(--mdui-color-surface-container-highest), 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: rgb(var(--mdui-color-primary));
  background-color: rgba(var(--mdui-color-primary), 0.05);
}

.upload-prompt {
  text-align: center;
  box-sizing: border-box;
  color: rgba(var(--mdui-color-on-surface), 0.7);
  ion-icon {
    font-size: 32px;
    color: rgb(var(--mdui-color-primary));
    margin-bottom: 2px;
  }
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--mdui-shape-corner-medium);
}

.settings-section {
  background: rgba(var(--mdui-color-primary-dark), 0.2);
  border-radius: var(--mdui-shape-corner-medium);
  margin-top: 16px;
  padding-bottom: 16px;
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .upload-btn {
    margin-top: 0.4rem;
    width: 100%;
  }
}

.file-input {
  display: none;
}
</style>