import {setVariables,removeVariables,fileRead,addFileToFolder} from "../main"
import {BottomBtn} from "./item"

let loopInterval = null;
let isLooping = false;
const bgData={live:false,src:null,img:null,showLive:true};

function BgScreen(){
  var {T,useRef}=cv;

  var frameArr=[];

  var uploadFile=useRef(),
  previewVideo=useRef(),
  img=useRef(),
  infoDialog=useRef(),
  delayInput=useRef(),
  durationInput=useRef(),
  blurRadiusInput=useRef(),
  liveSwitch=useRef();

  // 动态背景
  var progressText = useRef(),
  progressPercentage = useRef(),
  progressBar = useRef();

  const setProgressText = text => {
    progressText.current.textContent = text;
  }

  const updateProgress = (current, total) => {
    const progress = total === 0 ? 0 : current / total;
    progressBar.current.value = progress;
    progressPercentage.current.textContent = `${(progress * 100).toFixed(1)}%`;
    setProgressText(T("bg$progress$videoProcessing",`${current}`,`${total}`));
  }

  const handleVideoEnd = () => {
    if (isLooping) {
      previewVideo.current.currentTime = 0;
      previewVideo.current.play().catch(error => {
        console.log(error);
      });
    }
  }

  const startVideoLoop = () => {
    if (isLooping) return;
    isLooping = true;
    previewVideo.current.play().catch(error => {
      console.error(error)
    });
    previewVideo.current.addEventListener('ended', handleVideoEnd);
    loopInterval = setInterval(() => {
      if (previewVideo.current.paused && isLooping) {
        previewVideo.current.currentTime = 0;
        previewVideo.current.play();
      }
    }, 1000);
  }

  const stopVideoLoop = () => {
    isLooping = false;
    previewVideo.current.pause();
    previewVideo.current.removeEventListener('ended', handleVideoEnd);
    clearInterval(loopInterval);
  }

  var delay=0.2,duration=0.1,blurRadius=10;
  var cancelBtn=function(){delayInput.current.disabled=false;durationInput.current.disabled=false;infoDialog.current.open=false;var cloneUpload=document.createElement("input");cloneUpload.type="file";cloneUpload.accept="image/*, video/*";cloneUpload.style="display:none";cloneUpload.addEventListener("change",fileHandle);uploadFile.current.parentNode.replaceChild(cloneUpload,uploadFile.current);uploadFile.current=cloneUpload}
  var continueBtn=function(){
    delay=Math.max(0,Math.min(Number.parseFloat(delayInput.current.value),100));
    duration=Math.max(0,Math.min(Number.parseFloat(durationInput.current.value),10));
    blurRadius=Math.max(0,Math.min(Number.parseInt(blurRadiusInput.current.value),50));
    infoDialog.current.open=false;
    setVariables({"$cube_custom_bg":true})

    if (isNaN(delay)) {
      setProgressText(T("bg$progress$delayError"));
      cancelBtn();
    }
    if (isNaN(duration)) {
      setProgressText(T("bg$progress$durationError"));
      cancelBtn();
    }
    if (isNaN(blurRadius)) {
      setProgressText(T("bg$progress$blurRadiusError"));
      cancelBtn();
    }

    if(bgData.showLive==0){
      setProgressText(T("bg$progress$load"));
      liveSwitch.current.checked=false;
      liveSwitchFn();
      try {
        fileRead("textures/cube")[2].children=[];
      } catch (e) {
        console.error(e)
      }
      var reader=new FileReader();
      reader.onload=function(event){
        var image=new Image();
        image.onload=async function(){
          var canvas=document.createElement('canvas'),
          ctx=canvas.getContext('2d');
          canvas.width=image.width;
          canvas.height=image.height;
          ctx.drawImage(image, 0, 0);
          img.current.src=canvas.toDataURL('image/jpeg')
          bgData.img=img.current.src
          await new Promise(resolve => canvas.toBlob(blob => {
            addFileToFolder("textures/cube/bg","bg.jpg",blob);
            resolve()
          }));

          progressBar.current.value = 0.5;
          progressPercentage.current.textContent = `50.0%`;
          setProgressText(T("bg$progress$blur"));

          const requestIdle = window.requestIdleCallback||function(handler){var startTime=Date.now();return setTimeout(function(){handler({didTimeout:false,timeRemaining:function(){return Math.max(0,50.0-(Date.now()-startTime))}})},1)};

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const processor = optimizedGaussBlur(imgData, blurRadius);
          const generator = processor.process();

          async function nextChunk(deadline) {
            while (true) {
              const { value: task, done } = generator.next();
              if (done) {
                // 处理完成
                ctx.putImageData(imgData, 0, 0);
                
                await new Promise(resolve => canvas.toBlob(blob => {
                  addFileToFolder("textures/cube/bg","blur.jpg",blob);
                  resolve()
                }));
                progressBar.current.value = 1;
                progressPercentage.current.textContent = `100.0%`;
                setProgressText(T("bg$progress$done"));
                cancelBtn();
    
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
        }
        image.src=event.target.result
      }
      reader.readAsDataURL(uploadFile.current.files[0]);
      return
    }
    frameArr = [];

    // 初始化
    liveSwitch.current.checked = true;
    liveSwitchFn();
    try {
      fileRead("textures/cube")[0].children = [];
      fileRead("textures/cube")[1].children = [];
    } catch (e) {
      console.error(e);
    }
    setProgressText(T("bg$progress$videoLoading"));

    const videoPlayer = document.createElement('video');
    videoPlayer.muted = true;
    videoPlayer.src = URL.createObjectURL(uploadFile.current.files[0]);
    videoPlayer.style.display = 'none';
    document.body.appendChild(videoPlayer);

    // 缓存播放的视频
    bgData.src = URL.createObjectURL(uploadFile.current.files[0]);
    previewVideo.current.setAttribute("src",URL.createObjectURL(uploadFile.current.files[0]));

    // 视频加载完成事件
    videoPlayer.addEventListener('loadedmetadata', () => {
      startVideoLoop();
      videoPlayer.play().catch(console.error);
      detectFrameRate(videoPlayer);
    });
  }
  var fileHandle=function(e){
    var file=e.target.files[0];
    if(!file)return;
    if(file.type.indexOf("video/")===0){
      bgData.showLive=true;
      var video=document.createElement('video');
      video.addEventListener("loadedmetadata",function(){
        var duration=video.duration;
        if(duration<=1200)infoDialog.current.open=true;
        else{cancelBtn();mdui.snackbar({message:T("bg$longVideo"),placement:"top",autoCloseDelay:3000,closeable:true})}
      })
      video.src=URL.createObjectURL(file);
    }else if(file.type.indexOf("image/")===0){
      delayInput.current.disabled=true
      durationInput.current.disabled=true
      bgData.showLive=false;
      infoDialog.current.open=true
    }else{cancelBtn();mdui.snackbar({message:T("bg$invalid"),placement:"top",autoCloseDelay:3000,closeable:true})}
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
    const frameInterval = Math.round(delay * frameRate);
    const totalFrames = Math.floor(video.duration * frameRate);
    const totalImages = Math.ceil(totalFrames / frameInterval);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let currentImage = 0;
    setProgressText(T("bg$progress$videoProcessing","0",`${totalImages}`));

    video.addEventListener("seeked", function onSeeked() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          frameArr.push(img)
          addFileToFolder("textures/cube/frame",currentImage===0?"frame.jpg":`frame_${currentImage}.jpg`,blob)
          currentImage++;
          updateProgress(currentImage, totalImages);
          if (currentImage < totalImages) {
            video.currentTime = (currentImage * frameInterval) / frameRate;
          } else {
            completeProcessing(video, totalImages);
          }
        }
      }, 'image/jpeg')
    });

    video.currentTime = 0;
  }

  const completeProcessing = async (video, total) => {
    const startAllTime = performance.now();
    setProgressText(T("bg$progress$videoProcessingDone",`${total}`));

    progressBar.current.value = 0;
    progressPercentage.current.textContent = `0%`;

    let startTime = performance.now();
    let lastImageTime = startTime;
    let remainingTime = T("bg$progress$videoBlurUnknown");

    const requestIdle = window.requestIdleCallback||function(handler){var startTime=Date.now();return setTimeout(function(){handler({didTimeout:false,timeRemaining:function(){return Math.max(0,50.0-(Date.now()-startTime))}})},1)};

    const timeUpdater = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const timeStr = remainingTime === T("bg$progress$videoBlurUnknown") ? remainingTime : `${remainingTime}s`;
      setProgressText(T("bg$progress$videoBlur",`${processedCount}`,`${frameArr.length}`,`${timeStr}`));
    }, 500);

    let processedCount = 0;
    const processQueue = async () => {
      while (processedCount < frameArr.length) {
        await new Promise(resolve => {
          requestIdle(async deadline => {
            // 在空闲时段内尽可能处理多个任务
            while (deadline.timeRemaining() > 5 && processedCount < frameArr.length) {
              const img = frameArr[processedCount];
              const singleStart = performance.now();
              await processBlur(img, blurRadius, processedCount);

              // 计算单张耗时
              const singleDuration = performance.now() - singleStart;
              const avgTime = singleDuration / (processedCount > 3 ? 3 : 1);
              remainingTime = ((avgTime * (frameArr.length - processedCount - 1)) / 1000).toFixed(1);

              // 更新进度
              processedCount++;
              const progress = (processedCount / frameArr.length * 100).toFixed(1);
              progressBar.current.value = Number.parseInt(progress) / 100;
              progressPercentage.current.textContent = `${progress}%`;
            }
            resolve();
          });
        });
      }
      clearInterval(timeUpdater);
      setProgressText(T("bg$progress$videoBlurDone",`${total}`,`${formatProcessingTime(startAllTime)}`));
      document.body.removeChild(video);
      editFrameFile();
    }
    processQueue();
  }

  const formatProcessingTime = startTime => {
    const seconds = ((performance.now() - startTime) / 1000).toFixed(1);
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return T("bg$progress$videoBlurTimeMinute",`${mins}`,`${secs.toString().padStart(2, '0')}`);
    }
    return T("bg$progress$videoBlurTimeSecond",`${seconds}`);
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
              addFileToFolder("textures/cube/frameBlur",progress===0?"frame.jpg":`frame_${progress}.jpg`,blob);
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
    const pixels = imgData.data;
    const width = imgData.width;
    const height = imgData.height;
    
    // 生成高斯核
    const kernel = buildKernel(radius);
    const chunkSize = 50; // 每块处理50行
    
    // 创建中间缓冲区
    const tempPixels = new Uint8ClampedArray(pixels.length);
    
    return {
      * process() {
        // 水平模糊分块处理
        for (let y = 0; y < height; y += chunkSize) {
          yield () => horizontalBlurChunk(pixels, tempPixels, width, height, kernel, y, Math.min(y + chunkSize, height));
        }
        // 垂直模糊分块处理
        for (let x = 0; x < width; x += chunkSize) {
          yield () => verticalBlurChunk(tempPixels, pixels, width, height, kernel, x, Math.min(x + chunkSize, width));
        }
      }
    };
  }
  
  const buildKernel = radius => {
    const sigma = radius / 3;
    const kernel = [];
    let sum = 0;
    
    for (let i = -radius; i <= radius; i++) {
      const weight = Math.exp(-(i*i)/(2*sigma*sigma));
      kernel.push(weight);
      sum += weight;
    }
    
    return kernel.map(w => w / sum);
  }

  const horizontalBlurChunk = (src, dest, width, height, kernel, startY, endY) => {
    const radius = (kernel.length - 1) >> 1;
    
    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let i = -radius; i <= radius; i++) {
          const px = clamp(x + i, 0, width - 1);
          const pos = (y * width + px) * 4;
          
          const weight = kernel[i + radius];
          a += src[pos] * weight;
          r += src[pos + 1] * weight;
          g += src[pos + 2] * weight;
          b += src[pos + 3] * weight;
        }
  
        const destPos = (y * width + x) * 4;
        dest[destPos] = a;
        dest[destPos + 1] = r;
        dest[destPos + 2] = g;
        dest[destPos + 3] = b;
      }
    }
  }

  const verticalBlurChunk = (src, dest, width, height, kernel, startX, endX) => {
    const radius = (kernel.length - 1) >> 1;
    
    for (let x = startX; x < endX; x++) {
      for (let y = 0; y < height; y++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let i = -radius; i <= radius; i++) {
          const py = clamp(y + i, 0, height - 1);
          const pos = (py * width + x) * 4;
          
          const weight = kernel[i + radius];
          a += src[pos] * weight;
          r += src[pos + 1] * weight;
          g += src[pos + 2] * weight;
          b += src[pos + 3] * weight;
        }
        
        const destPos = (y * width + x) * 4;
        dest[destPos] = a;
        dest[destPos] = a;
        dest[destPos + 1] = r;
        dest[destPos + 2] = g;
        dest[destPos + 3] = b;
      }
    }
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  var editFrameFile=()=>{
    var frameJSON={"namespace":"cncded832c","a":{"type":"image","size":["100%","100%"],"fill":true},"b":{"anim_type":"offset","duration":duration},"c":{"type":"panel","controls":[{"a@cncded832c.e":{"size":["100%","100%"],"anchor_from":"center","anchor_to":"center"}},{"b":{"type":"image","texture":"textures/cube/frame/frame","layer":-2,"size":["100%","100%"],"fill":true}}]},"d":{"type":"panel","controls":[{"a@cncded832c.f":{"size":["100%","100%"],"anchor_from":"center","anchor_to":"center"}},{"b":{"type":"image","texture":"textures/cube/frameBlur/frame","layer":-2,"size":["100%","100%"],"fill":true}}]},"e@ct.vp":{"offset":"@cncded832c.1","controls":[]},"f@ct.vp":{"offset":"@cncded832c.1","controls":[]}}
    var frameJSONFile=fileRead("assets/cube/frame.ui")
    frameJSON=JSON.parse(JSON.stringify(frameJSON))
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
    frameJSONFile.content=JSON.stringify(frameJSON)
    stopVideoLoop();
    cancelBtn()
  }
  var liveSwitchFn=function(){
    var globalVariablesFile=fileRead("ui/_global_variables.json"),globalVariablesJSON=JSON.parse(globalVariablesFile.content)
    var liveState=liveSwitch.current.checked;
    if(liveState)globalVariablesJSON["$cube_set_0a57c067"]=true;
    else globalVariablesJSON=Object.entries(globalVariablesJSON).reduce((acc,[key,value])=>{if(key!=='$cube_set_0a57c067')acc[key]=value;return acc},{});
    bgData.live=liveState
    previewVideo.current.style.display=liveState?"block":"none";
    img.current.style.display=liveState?"none":"block";
    globalVariablesFile.content=JSON.stringify(globalVariablesJSON)
  }
  var resetStatic=function(){mdui.dialog({headline:T("gui$reset"),description:T("bg$resetStaticDialog"),closeOnOverlayClick:true,closeOnEsc:true,actions:[{text:T("gui$cancel")},{text:T("gui$reset"),onClick:function(){liveSwitch.current.checked=false;removeVariables("$cube_custom_bg");fileRead("textures/cube")[2].children=[];img.current.src=null;bgData.img=null;liveSwitchFn()}}]})}
  var resetLive=function(){mdui.dialog({headline:T("gui$reset"),description:T("bg$resetLiveDialog"),closeOnOverlayClick:true,closeOnEsc:true,actions:[{text:T("gui$cancel")},{text:T("gui$reset"),onClick:function(){liveSwitch.current.checked=false;removeVariables("$cube_custom_bg");fileRead("textures/cube")[0].children=[];fileRead("textures/cube")[1].children=[];previewVideo.current.src=null;bgData.src=null;frameArr=[];liveSwitchFn()}}]})}
  var save=function(){cv.skipRouter("/item")}
  var allowDrop=function(a){a.preventDefault()},handleClickOrDrop=function(a,b){a.preventDefault();var c,d=b.current;if('drop'===a.type)c=a.dataTransfer.files,d.files=c;else if('click'===a.type)return void d.click()};
  var leftBtn=cv.c("mdui-button",{onClick:e=>handleClickOrDrop(e,uploadFile),ondrop:e=>handleClickOrDrop(e,uploadFile),ondragover:allowDrop,style:"margin-right:8px;box-sizing:border-box;width:calc(50% - 8px);",variant:"outlined"},T("gui$upload"));
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container",style:"margin:8px"},
      cv.c("mdui-dialog",{headline:T("bg$info"),ref:infoDialog},
        cv.c("mdui-text-field",{label:T("bg$interval"),ref:delayInput,inputmode:"decimal",value:0.2,style:"margin-bottom:5px"}),
        cv.c("mdui-text-field",{label:T("bg$duration"),ref:durationInput,inputmode:"decimal",value:0.1,style:"margin-bottom:5px"}),
        cv.c("mdui-text-field",{label:T("bg$blurRadius"),ref:blurRadiusInput,inputmode:"decimal",value:10,style:"margin-bottom:5px"}),
        cv.c("mdui-button",{slot:"action",variant:"text",onClick:cancelBtn},T("gui$cancel")),
        cv.c("mdui-button",{slot:"action",variant:"filled",onClick:continueBtn},T("gui$continue"))
      ),
      cv.c("h1",null,T("bg$title")),
      cv.c("input",{attr:{type:"file",accept:"image/*, video/*"},onChange:fileHandle,ref:uploadFile,style:"display:none"}),
      cv.c("video",{attr:{controls:"controls",loop:"loop",muted:"muted"},ref:previewVideo,src:bgData.src,style:`display:${bgData.showLive?"block":"none"};width:100%;border-radius:var(--mdui-shape-corner-medium);`}),
      cv.c("img",{ref:img,src:bgData.img,style:`display:${bgData.showLive?"none":"block"};width:100%;height:180px;border-radius:var(--mdui-shape-corner-medium);`}),
      cv.c("div",{style:"background:rgba(var(--mdui-color-primary-dark), 0.2);border-radius:var(--mdui-shape-corner-medium);padding:0 5px;margin-top:5px;"},cv.c("mdui-list",null,
        (<div style="padding:16px">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:14px;" ref={progressText}>{T("bg$progress")}</span>
            <span style="font-size:14px;" ref={progressPercentage}>0%</span>
          </div>
          <mdui-linear-progress value="0" ref={progressBar}/>
        </div>),
        cv.c("mdui-list-item",{rounded:true},T("bg$live"),cv.c("mdui-switch",{slot:"end-icon",checked:bgData.live,ref:liveSwitch,onChange:liveSwitchFn},cv.c("div",{slot:"checked-icon"}))),
        cv.c("mdui-list-item",{rounded:true},T("bg$resetStatic"),cv.c("mdui-button",{slot:"end-icon",variant:"outlined",onClick:resetStatic},T("gui$reset"))),
        cv.c("mdui-list-item",{rounded:true},T("bg$resetLive"),cv.c("mdui-button",{slot:"end-icon",variant:"outlined",onClick:resetLive},T("gui$reset")))
      )),
      cv.c("div",{style:"height:30px"})
    ),
    cv.c(BottomBtn,{leftBtn:leftBtn,rightFn:save,leftText:T("gui$upload"),rightText:T("gui$save")})
  )
}

export default BgScreen