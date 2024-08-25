import {setVariables,removeVariables,fileRead,addFileToFolder} from "../main"
import {BottomBtn} from "./item"

const bgData={live:false,src:null,img:null,showLive:true};

function gaussBlur(blur,canvas,ctx){
  let start = +new Date();
	let sum = 0;
	let delta = 5;
	let alpha_left = 1 / (2 * Math.PI * delta * delta);
	let step = blur < 3 ? 1 : 2;
	for (let y = -blur; y <= blur; y += step) {
		for (let x = -blur; x <= blur; x += step) {
			let weight = alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta));
			sum += weight;
		}
	}
	let count = 0;
	for (let y = -blur; y <= blur; y += step) {
		for (let x = -blur; x <= blur; x += step) {
			count++;
			ctx.globalAlpha = alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta)) / sum * blur;
			ctx.drawImage(canvas,x,y);
		}
	}
	ctx.globalAlpha = 1;
}
//function gaussBlur(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;r*=3;var a,o,e,n,f,u,h,s,i,d,p,c=new Uint8ClampedArray(t.data),l=t.width,v=t.height,M=[];r=Math.floor(r);var g=r/3;for(h=1/(Math.sqrt(2*Math.PI)*g),u=-1/(2*g*g),s=-r;s<=r;s++)M.push(h*Math.exp(u*s*s));for(e=0;e<v;e++)for(o=0;o<l;o++){for(n=f=u=h=a=0,i=-r;i<=r;i++)(d=o+i)>=0&&d<l&&(s=4*(e*l+d),p=M[i+r],n+=c[s]*p,f+=c[s+1]*p,u+=c[s+2]*p,h+=c[s+3]*p,a+=p);s=4*(e*l+o),t.data.set([n,f,u,h].map(function(t){return t/a}),s)}for(c.set(t.data),o=0;o<l;o++)for(e=0;e<v;e++){for(n=f=u=h=a=0,i=-r;i<=r;i++)(d=e+i)>=0&&d<v&&(s=4*(d*l+o),p=M[i+r],n+=c[s]*p,f+=c[s+1]*p,u+=c[s+2]*p,h+=c[s+3]*p,a+=p);s=4*(e*l+o),t.data.set([n,f,u,h].map(function(t){return t/a}),s)}return t}
function gaussBlur2(r,t,o){var a,f,h,e,s,u,i,n,M,d,g=r.data,l=r.width,c=r.height,p=[],q=0;for(t=Math.floor(t)||3,o=o||t/3,u=1/(Math.sqrt(2*Math.PI)*o),s=-1/(2*o*o),i=0,a=-t;a<=t;a++,i++)e=u*Math.exp(s*a*a),p[i]=e,q+=e;for(i=0,d=p.length;i<d;i++)p[i]/=q;for(f=0;f<c;f++)for(a=0;a<l;a++){for(h=e=s=u=0,q=0,n=-t;n<=t;n++)(M=a+n)>=0&&M<l&&(i=4*(f*l+M),h+=g[i]*p[n+t],e+=g[i+1]*p[n+t],s+=g[i+2]*p[n+t],q+=p[n+t]);i=4*(f*l+a),g[i]=h/q,g[i+1]=e/q,g[i+2]=s/q}for(a=0;a<l;a++)for(f=0;f<c;f++){for(h=e=s=u=0,q=0,n=-t;n<=t;n++)(M=f+n)>=0&&M<c&&(i=4*(M*l+a),h+=g[i]*p[n+t],e+=g[i+1]*p[n+t],s+=g[i+2]*p[n+t],q+=p[n+t]);i=4*(f*l+a),g[i]=h/q,g[i+1]=e/q,g[i+2]=s/q}return r.data=g,r}

function BgScreen(){
  var {T,useRef}=cv;

  var frameArr=[];

  var uploadFile=useRef(),
  video=useRef(),
  previewVideo=useRef(),
  img=useRef(),
  progress=useRef(),
  progressDialog=useRef(),
  infoDialog=useRef(),
  delayInput=useRef(),
  durationInput=useRef(),
  engineInput=useRef(),
  liveSwitch=useRef();

  var timer=null,delay=400,duration=0.1,frameIndex=0,engine="engine2",useBlur=true;
  var cancelBtn=function(){delayInput.current.disabled=false;durationInput.current.disabled=false;progressDialog.current.open=false;infoDialog.current.open=false;var cloneUpload=document.createElement("input");cloneUpload.type="file";cloneUpload.accept="image/*, video/*";cloneUpload.style="display:none";cloneUpload.addEventListener("change",fileHandle);uploadFile.current.parentNode.replaceChild(cloneUpload,uploadFile.current);uploadFile.current=cloneUpload}
  var continueBtn=function(){
    delay=Math.max(20,Math.min(Number.parseInt(delayInput.current.value),60000))
    duration=Math.max(0,Math.min(Number.parseFloat(durationInput.current.value),10))
    engine=engineInput.current.value||"engine2"
    infoDialog.current.open=false
    progressDialog.current.open=true
    setVariables({"$cube_custom_bg":true})
    if(bgData.showLive==0){
      progressDialog.current.description=T("bg$progress$load")
      liveSwitch.current.checked=false;
      liveSwitchFn();
      fileRead("textures/cube")[2].children=[];
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
          await new Promise(resolve=>canvas.toBlob(blob=>{addFileToFolder("textures/cube/bg","bg.jpg",blob);resolve()}))
          progressDialog.current.description=T("bg$progress$blur")
          if(useBlur&&engine=="engine1")ctx.putImageData(gaussBlur2(ctx.getImageData(0,0,canvas.width,canvas.height),10),0,0)
          else if(useBlur)gaussBlur(10,canvas,ctx)
          await new Promise(resolve=>canvas.toBlob(blob=>{addFileToFolder("textures/cube/bg","blur.jpg",blob);resolve()}))
          cancelBtn()
        }
        image.src=event.target.result
      }
      reader.readAsDataURL(uploadFile.current.files[0]);
      return
    }
    function videoHandle(){
      frameArr=[];
      progressDialog.current.description=T("bg$progress$extract")
      bgData.src=URL.createObjectURL(uploadFile.current.files[0])
      previewVideo.current.setAttribute("src",URL.createObjectURL(uploadFile.current.files[0]))
      video.current.setAttribute("src",URL.createObjectURL(uploadFile.current.files[0]))
      video.current.muted=true
      video.current.play()
    }
    console.log(useBlur)
    mdui.dialog({headline:T("bg$staticWarn$title"),description:T("bg$staticWarn$desc"),closeOnEsc:true,actions:[{text:T("gui$cancel"),onClick:cancelBtn},{text:T("gui$continue"),onClick:videoHandle}]})
  }
  var fileHandle=function(e){
    var file=e.target.files[0];
    if(!file)return;
    if(file.type.indexOf("video/")===0){
      bgData.showLive=true;
      var video=document.createElement('video');
      video.addEventListener("loadedmetadata",function(){
        var duration=video.duration;
        if(duration<=30)infoDialog.current.open=true;
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
  var videoCanPlay=()=>{
    var width=video.current.videoWidth,height=video.current.videoHeight;
    liveSwitch.current.checked=true
    liveSwitchFn()
    fileRead("textures/cube")[0].children=[]
    fileRead("textures/cube")[1].children=[]
    video.current.playbackRate=2;
    timer=setInterval(()=>{
      var canvas=document.createElement("canvas"),ctx=canvas.getContext('2d');
      canvas.width=width;
      canvas.height=height;
      canvas.getContext('2d').drawImage(video.current,0,0,canvas.width,canvas.height)
      frameArr.push({index:frameIndex,time:video.current.currentTime,frame:canvas,blur:null})
      frameIndex++
      progress.current.value=video.current.currentTime/video.current.duration
    },delay/2)
  }
  var getBlobFromCanvas=canvas=>new Promise(resolve=>canvas.toBlob(blob=>resolve(blob),"image/jpeg",0.8))
  var videoEnded=()=>{
    clearInterval(timer)
    progressDialog.current.description=T("bg$progress$def")
    async function processDefFrames(){
      var len=frameArr.length;
      for(var e of frameArr){
        var blob=await getBlobFromCanvas(e.frame)
        progress.current.value=e.index/len
        addFileToFolder("textures/cube/frame",e.index===0?"frame.jpg":`frame_${e.index}.jpg`,blob)
      }
      handleBlur()
    }
    processDefFrames()
  }
  var handleBlur=function(){
    progress.current.value=1
    progressDialog.current.description=T("bg$progress$blur")
    async function processBlurFrames(){
      var len=frameArr.length;
      for (var e of frameArr){
        var ctx=e.frame.getContext("2d");
        await new Promise(resolve=>{
          progress.current.value=e.index/len
          if(useBlur&&engine=="engine1")ctx.putImageData(gaussBlur2(ctx.getImageData(0,0,e.frame.width,e.frame.height),30),0,0)
          else if(useBlur)gaussBlur(10,e.frame,ctx)
          e.frame.toBlob(blob=>{addFileToFolder("textures/cube/frameBlur",e.index===0?"frame.jpg":`frame_${e.index}.jpg`,blob);resolve()},"image/jpeg",0.8)
        })
      }
      editFrameFile()
    }
    processBlurFrames()
  }
  var editFrameFile=()=>{
    var frameJSON={"namespace":"cncded832c","a":{"type":"image","size":["100%","100%"],"fill":true},"b":{"anim_type":"offset","duration":duration},"c":{"type":"panel","controls":[{"a@cncded832c.e":{"size":["100%","100%"],"anchor_from":"center","anchor_to":"center"}},{"b":{"type":"image","texture":"textures/cube/frame/frame","layer":-2,"size":["100%","100%"],"fill":true}}]},"d":{"type":"panel","controls":[{"a@cncded832c.f":{"size":["100%","100%"],"anchor_from":"center","anchor_to":"center"}},{"b":{"type":"image","texture":"textures/cube/frameBlur/frame","layer":-2,"size":["100%","100%"],"fill":true}}]},"e@ct.vp":{"offset":"@cncded832c.1","controls":[]},"f@ct.vp":{"offset":"@cncded832c.1","controls":[]}}
    var frameJSONFile=fileRead("assets/cube/frame.ui")
    frameJSON=JSON.parse(JSON.stringify(frameJSON))
    progressDialog.current.description=T("bg$progress$write")
    progress.current.value=0
    var len=frameArr.length
    frameArr.forEach((e,i)=>{
      progress.current.value=i/len
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
      cv.c("mdui-dialog",{headline:T("bg$progress"),description:T("bg$progress$extract"),ref:progressDialog},cv.c("mdui-linear-progress",{ref:progress})),
      cv.c("mdui-dialog",{headline:T("bg$info"),ref:infoDialog},
        cv.c("mdui-text-field",{label:T("bg$interval"),ref:delayInput,min:20,max:60000,type:"number",value:400,style:"margin-bottom:5px"}),
        cv.c("mdui-text-field",{label:T("bg$duration"),ref:durationInput,min:0,max:10,type:"number",value:0.1,style:"margin-bottom:5px"}),
        cv.c("mdui-select",{label:T("bg$blur"),ref:engineInput,value:"engine2",style:"margin-bottom:5px;line-height:normal;"},cv.c("mdui-menu-item",{value:"engine1"},T("bg$blur$1")),cv.c("mdui-menu-item",{value:"engine2"},T("bg$blur$2"))),
        (<mdui-list-item rounded>{T("bg$useBlur")}<mdui-switch slot="end-icon" checked={true} onChange={function(e){useBlur=e.target.checked}}><div slot="checked-icon"></div></mdui-switch></mdui-list-item>),
        cv.c("mdui-button",{slot:"action",variant:"text",onClick:cancelBtn},T("gui$cancel")),
        cv.c("mdui-button",{slot:"action",variant:"filled",onClick:continueBtn},T("gui$continue"))
      ),
      cv.c("h1",null,T("bg$title")),
      cv.c("input",{attr:{type:"file",accept:"image/*, video/*"},onChange:fileHandle,ref:uploadFile,style:"display:none"}),
      cv.c("video",{attr:{controls:"controls"},onCanplay:videoCanPlay,onEnded:videoEnded,ref:video,style:"width:0;height:0;visibility:hidden;"}),
      cv.c("video",{attr:{controls:"controls"},ref:previewVideo,src:bgData.src,style:`display:${bgData.showLive?"block":"none"};width:100%;border-radius:var(--mdui-shape-corner-medium);`}),
      cv.c("img",{ref:img,src:bgData.img,style:`display:${bgData.showLive?"none":"block"};width:100%;height:180px;border-radius:var(--mdui-shape-corner-medium);`}),
      cv.c("div",{style:"background:rgba(var(--mdui-color-primary-dark), 0.2);border-radius:var(--mdui-shape-corner-medium);padding:0 5px;margin-top:5px;"},cv.c("mdui-list",null,
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