import * as simplecrop from "../simpleCrop"
import {fileStructure,fileRead,findFileByName,addFileToFolder,deleteFile,get_uuid} from "../main"
import {BottomBtn} from "./item"

const MusicArr=[];

function parseTime(timeString) {
  let regex = /^(\d+):(\d{1,2})$/;
  let match = timeString.match(regex);
  let minutes = 0;
  let seconds = 0;
  if (match) {
    minutes = parseInt(match[1], 10);
    seconds = parseInt(match[2], 10);
    if (minutes >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
    }
  }
  return minutes * 60 + seconds;
}

function MusicScreen(){
  var {T,useRef}=cv

  var isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

  var musicName=useRef(),musicAuthor=useRef(),musicDuration=useRef(),addBtn=useRef(),dialog=useRef(),musicFile=useRef(),coverFile=useRef(),multipleFiles=useRef();
  var close=()=>{dialog.current.open=false},coverChange=function(e){var reader=new FileReader();reader.onload=function(r){var img=new Image();img.onload=function(){new simplecrop({src:r.target.result,cropSizePercent:0.8,size:{width:Math.min(img.width,img.height),height:Math.min(img.width,img.height)},cropCallback:function(result){coverFile.result=result}})};img.src=r.target.result;coverFile.name=e.target.files[0].name};if(e.target.files.length>0)reader.readAsDataURL(e.target.files[0])},musicChange=function(a){var b=a.target.files[0];if(b){var c=b.name.split(".").pop();return"ogg"===c?void(""===musicName.current.inputRef.value.value&&musicName.current.setRangeText(b.name.substring(0,b.name.lastIndexOf("."))),addBtn.current.disabled=!1):mdui.snackbar({message:T("music$oggTip"),closeable:!0,autoCloseDelay:3e3,closeOnOutsideClick:!0,placement:"top"})}};
  var allowDrop=function(a){a.preventDefault()},handleClickOrDrop=function(a,b){a.preventDefault();var c,d=b.current;if('drop'===a.type)c=a.dataTransfer.files,d.files=c;else if('click'===a.type)return void d.click()};

  var setting=findFileByName(fileStructure,"_setting.json");
  if(setting.content===null)setting.content=`{"customAlbum@cn80b37451.f":{"$listContent":[]}}`;
  var setJson=JSON.parse(setting.content)
  var soundsDef=findFileByName(fileStructure,"sound_definitions.json");
  if(soundsDef.content===null)soundsDef.content=`{"cube.music.custom":{"category":"ui","sounds":[]}}`;
  var soundsDefJson=JSON.parse(soundsDef.content)

  var item=setJson["customAlbum@cn80b37451.f"]["$listContent"];
  var newBtn=()=>{dialog.current.open=true}
  var addMusic=()=>{
    var name=musicName.current.inputRef.value.value,author=musicAuthor.current.inputRef.value.value,fileReader=new FileReader(),audio=new Audio();
    fileReader.onload=async function(e){
      var blob=new Blob([e.target.result],{type:'audio/ogg'}),musicDetails={};
      var oggPath="sounds/"+addFileToFolder("sounds",name+".ogg",blob);
      var coverFiles=coverFile.current.files,coverPath="",oggID=get_uuid();
      if(coverFiles&&coverFiles.length>0){
        var coverID=get_uuid(),coverType=coverFiles[0].type;
        coverPath="textures/"+coverID+"."+coverFile.name.split('.').pop();
        var coverBlob = await new Promise(resolve=>{
          musicDetails.img=coverFile.result.toDataURL(coverType)
          coverFile.result.toBlob(blob=>resolve(blob),coverType);
        })
        addFileToFolder("textures",coverID+"."+coverFile.name.split('.').pop(),coverBlob)
      }
      soundsDefJson[oggID]={category:"ui",sounds:[{name:oggPath.slice(0,oggPath.lastIndexOf(".")),stream:true,volume:0.5}]}
      soundsDefJson["cube.music.custom"].sounds.push({name:oggPath.slice(0,oggPath.lastIndexOf(".")),stream:true,volume:0.5})
      soundsDef.content=JSON.stringify(soundsDefJson)
      MusicArr.push(musicDetails);
      const duration = parseTime(musicDuration.current.value);
      function setData(duration=audio.duration){
        const musicData={[item.length+"@cn80b37451.m"]:{"$music_name":name,"$music_author":author,"$music_id":oggID,"$music_cover":coverPath,"$music_minute":Math.floor(duration / 60),"$music_second":Math.floor(duration % 60)}};
        setJson["customAlbum@cn80b37451.f"]["$listContent"].push(musicData)
        setting.content=JSON.stringify(setJson)
        musicFile.current.value="",coverFile.current.value="",addBtn.current.disabled=!0;
        dialog.current.open=false
        URL.revokeObjectURL(audio.src)
        cv.forceUpdate()
      }
      if(!isIOS && duration === 0){
        audio.src=URL.createObjectURL(blob);
        audio.addEventListener('loadedmetadata',()=>{setData(audio.duration)});
      }
      else setData(duration);
    };
    fileReader.readAsArrayBuffer(musicFile.current.files[0]);
  };
  var deleteMusic=i=>{
    var firstKeys=Object.keys(item[i]),musicID=item[i][firstKeys]["$music_id"],coverPath=item[i][firstKeys]["$music_cover"],soundsDef=fileRead("sounds/sound_definitions.json"),soundsDefJson=JSON.parse(soundsDef.content),oggPath=soundsDefJson[musicID]["sounds"][0]["name"]+".ogg";MusicArr.splice(i,1),item.splice(i,1),
    coverPath!==''&&deleteFile("textures",coverPath.slice(coverPath.lastIndexOf('/')+1)),deleteFile("sounds",oggPath.slice(oggPath.lastIndexOf('/')+1)),setting.content=JSON.stringify(setJson),soundsDefJson["cube.music.custom"].sounds.splice(i,1),delete soundsDefJson[musicID],soundsDef.content=JSON.stringify(soundsDefJson),cv.forceUpdate()
  }
  var edit=(type,name,i)=>mdui.prompt({
    headline:T("gui$edit")+" "+name,closeOnEsc:true,cancelText:T("gui$cancel"),confirmText:T("gui$confirm"),
    onConfirm:value=>{if(type==="$music_name"&&value.trim()===""){mdui.snackbar({message:T("music$nameEmpty"),placement:"top",action:T("gui$know"),onActionClick:()=>{}});return}var firstKeys=Object.keys(item[i]);item[i][firstKeys][type]=value;setting.content=JSON.stringify(setJson);cv.forceUpdate()}
  })

  var setDuration=i=>mdui.prompt({
    headline:T("music$changeDuration"),
    closeOnEsc:true,
    description:T("music$example"),
    cancelText:T("gui$cancel"),confirmText:T("gui$confirm"),
    onConfirm:value=>{
      if(value.trim()===""){
        mdui.snackbar({message:T("music$durationEmpty"),placement:"top",action:T("gui$know"),onActionClick:()=>{}});
        return
      }
      const duration = parseTime(value),
      firstKeys=Object.keys(item[i]);
      item[i][firstKeys]["$music_minute"]=Math.floor(duration / 60);
      item[i][firstKeys]["$music_second"]=Math.floor(duration % 60);
      setting.content=JSON.stringify(setJson);
    }
  })

  const multipleUpload=async e=>{
    const files = e.target.files;
    const filePromises = [];
    files.forEach(file=>{
      const reader = new FileReader(),audio=new Audio();
      if(file.type === "audio/ogg")filePromises.push(new Promise((resolve, reject)=>{
        reader.onload = e => {
          const blob=new Blob([e.target.result],{type:'audio/ogg'}),musicDetails={};
          let oggPath="sounds/"+addFileToFolder("sounds",file.name,blob),oggID=get_uuid(),duration=0;
          soundsDefJson[oggID]={category:"ui",sounds:[{name:oggPath.slice(0,oggPath.lastIndexOf(".")),stream:true,volume:0.5}]}
          soundsDefJson["cube.music.custom"].sounds.push({name:oggPath.slice(0,oggPath.lastIndexOf(".")),stream:true,volume:0.5})
          soundsDef.content=JSON.stringify(soundsDefJson)
          MusicArr.push(musicDetails);
          function setData(duration=audio.duration){
            const musicData={[item.length+"@cn80b37451.m"]:{"$music_name":file.name.substring(0,file.name.lastIndexOf('.')),"$music_author":"","$music_id":oggID,"$music_cover":"","$music_minute":Math.floor(duration / 60),"$music_second":Math.floor(duration % 60)}};
            setJson["customAlbum@cn80b37451.f"]["$listContent"].push(musicData)
            setting.content=JSON.stringify(setJson)
            dialog.current.open=false
            URL.revokeObjectURL(audio.src)
            resolve(musicData)
          }
          if(!isIOS && duration === 0){
            audio.src=URL.createObjectURL(blob);
            audio.addEventListener('loadedmetadata',()=>{setData(audio.duration)});
          }
          else setData(duration);
        }
        reader.readAsArrayBuffer(file)
      }));
      else mdui.snackbar({message:T("music$oggTip")+' ('+file.name+')',closeable:!0,autoCloseDelay:3e3,closeOnOutsideClick:!0,placement:"top"})
    })
    Promise.all(filePromises).then(results => {
      mdui.snackbar({message:T("music$multipleUpload",results.length),closeable:!0,autoCloseDelay:3e3,closeOnOutsideClick:!0,placement:"top"})
      cv.forceUpdate()
    }).catch(error => {
      mdui.alert({
        headline: "Error",
        description: error,
        confirmText: T("gui$know")
      })
    })
  }

  var save=function(){cv.skipRouter("/item")}
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container",style:"margin:8px"},
      item.length!==0&&cv.c("div",{className:"mdui-container"},cv.c("mdui-list",{style:"background:rgba(var(--mdui-color-primary-dark), 0.2);border-radius:var(--mdui-shape-corner-medium);padding:5px;"},
        item.map((i,index)=>{
          var firstKey=Object.keys(i),musicObj=i[firstKey[0]];
          return cv.c("mdui-list-item",{rounded:"rounded"},musicObj["$music_name"],
            cv.c("span",{slot:"description"},musicObj["$music_author"]),
            MusicArr[index].img&&cv.c("img",{slot:"icon",style:"width:2.5rem;height:2.5rem;border-radius:4px",src:MusicArr[index].img}),
            cv.c("mdui-dropdown",{slot:"end-icon",style:"line-height:normal;",trigger:"click","stay-open-on-click":true},
              cv.c("mdui-button-icon",{slot:"trigger"},cv.c("ion-icon",{attr:{name:"ellipsis-vertical"}})),
              cv.c("mdui-menu",{dense:true},
                cv.c("mdui-menu-item",{onClick:()=>mdui.dialog({headline:T("gui$remove")+` ${musicObj["$music_name"]}? `,description:T("music$deleteDesc"),closeOnEsc:true,closeOnOverlayClick:true,actions:[{text:T("gui$cancel")},{text:T("gui$remove"),onClick:deleteMusic.bind(this,index)}]})},T("gui$remove")),
                cv.c("mdui-menu-item",{onClick:()=>edit("$music_name",T("music$name"),index)},T("gui$edit")+" "+T("music$name")),
                cv.c("mdui-menu-item",{onClick:()=>edit("$music_author",T("music$author"),index)},T("gui$edit")+" "+T("music$author")),
                cv.c("mdui-menu-item",{onClick:()=>setDuration(index)},T("music$changeDuration"))
              )
          ))
      })),cv.c("div",{style:"height:45px"})),
      item.length===0&&cv.c("div",{style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
        cv.c("div",{style:{fontSize:"32px"}},T("music$empty$title")),
        cv.c("div",{style:{fontSize:"14px",marginTop:"4px"}},T("music$empty$desc"))
    )),
    cv.c(BottomBtn,{leftFn:newBtn,rightFn:save,leftText:T("gui$add"),rightText:T("gui$save")}),
    (<>
      <mdui-dialog className="ns" ref={dialog} attr={{"close-on-esc":"close-on-esc"}}>
        <span slot="headline">{T("music$add")}</span>
        <mdui-text-field maxlength="32" ref={musicName} counter label={T("music$name")}/>
        <mdui-text-field maxlength="32" ref={musicAuthor} counter label={T("music$author")}/>
        <mdui-text-field maxlength="8" ref={musicDuration} counter label={T("music$duration")} helper={T("music$example")} attr={{"helper-on-focus":"helper-on-focus"}}/>
        <mdui-segmented-button-group attr={{"full-width":"full-width"}}>
          <mdui-segmented-button ondrop={e=>handleClickOrDrop(e,coverFile)} onClick={e=>handleClickOrDrop(e,coverFile)} ondragover={allowDrop}>{T("music$cover")}</mdui-segmented-button>
          <mdui-segmented-button ondrop={e=>handleClickOrDrop(e,musicFile)} onClick={e=>handleClickOrDrop(e,musicFile)} ondragover={allowDrop}>{T("music$file")}</mdui-segmented-button>
        </mdui-segmented-button-group>
        {!isIOS&&<span style="display:block;width:100%;text-align:center;margin-top:5px;font-size:0.8rem">{T("music$durationAuto")}</span>}
        {/*accept:audio*/}<input type="file" ref={musicFile} onChange={musicChange} style="display:none"/>
        <input type="file" accept="image/*" ref={coverFile} onChange={coverChange} style="display:none"/>
        <mdui-button slot="action" variant="text" onClick={e=>{close();handleClickOrDrop(e,multipleFiles)}}>{T("gui$multiple")}</mdui-button>
        <mdui-button slot="action" variant="text" onClick={close}>{T("gui$cancel")}</mdui-button>
        <mdui-button slot="action" variant="filled" onClick={addMusic} ref={addBtn} disabled>{T("gui$add")}</mdui-button>
      </mdui-dialog>
      <input type="file" multiple ref={multipleFiles} onChange={multipleUpload} style="display:none"/>
    </>)
  )
}

export default MusicScreen