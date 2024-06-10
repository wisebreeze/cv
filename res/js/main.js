(function(){
mdui.setColorScheme("#778BFF");
var data = localStorage.getItem('themeType');
typeof data == "string"&&mdui.setTheme(data);
var saveAs=saveAs||"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(a){if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f=!a.externalHost&&"download"in e,g=a.webkitRequestFileSystem,h=a.requestFileSystem||g||a.mozRequestFileSystem,i=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},j="application/octet-stream",k=0,l=[],m=function(){for(var a,b=l.length;b--;)a=l[b],"string"==typeof a?d.revokeObjectURL(a):a.remove();l.length=0},n=function(a,b,c){var d,e;for(b=[].concat(b),d=b.length;d--;)if(e=a["on"+b[d]],"function"==typeof e)try{e.call(a,c||a)}catch(f){i(f)}},o=function(d,i){var m,o,p,q,r=this,s=d.type,t=!1,u=function(){var a=c().createObjectURL(d);return l.push(a),a},v=function(){n(r,"writestart progress write writeend".split(" "))},w=function(){(t||!m)&&(m=u(d)),o?o.location.href=m:window.open(m,"_blank"),r.readyState=r.DONE,v()},x=function(a){return function(){return r.readyState!==r.DONE?a.apply(this,arguments):void 0}},y={create:!0,exclusive:!1};return r.readyState=r.INIT,i||(i="download"),f?(m=u(d),b=a.document,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),e.href=m,e.download=i,q=b.createEvent("MouseEvents"),q.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(q),r.readyState=r.DONE,v(),void 0):(a.chrome&&s&&s!==j&&(p=d.slice||d.webkitSlice,d=p.call(d,0,d.size,j),t=!0),g&&"download"!==i&&(i+=".download"),(s===j||g)&&(o=a),h?(k+=d.size,h(a.TEMPORARY,k,x(function(a){a.root.getDirectory("saved",y,x(function(a){var b=function(){a.getFile(i,y,x(function(a){a.createWriter(x(function(b){b.onwriteend=function(b){o.location.href=a.toURL(),l.push(a),r.readyState=r.DONE,n(r,"writeend",b)},b.onerror=function(){var a=b.error;a.code!==a.ABORT_ERR&&w()},"writestart progress write abort".split(" ").forEach(function(a){b["on"+a]=r["on"+a]}),b.write(d),r.abort=function(){b.abort(),r.readyState=r.DONE},r.readyState=r.WRITING}),w)}),w)};a.getFile(i,{create:!1},x(function(a){a.remove(),b()}),x(function(a){a.code===a.NOT_FOUND_ERR?b():w()}))}),w)}),w),void 0):(w(),void 0))},p=o.prototype,q=function(a,b){return new o(a,b)};return p.abort=function(){var a=this;a.readyState=a.DONE,n(a,"abort")},p.readyState=p.INIT=0,p.WRITING=1,p.DONE=2,p.error=p.onwritestart=p.onprogress=p.onwrite=p.onabort=p.onerror=p.onwriteend=null,a.addEventListener("unload",m,!1),q.unload=function(){m(),a.removeEventListener("unload",m,!1)},q}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);
var {useState,useEffect,useRef} = Cube;

var fileStructure = [
  {
    type: 'folder',
    name: 'sounds',
    children: [
      {
        type: 'file',
        name: 'sound_definitions.json',
        content: null
      }
    ]
  },
  {
    type: 'folder',
    name: 'ui',
    children: [
      {
        type: 'file',
        name: '_setting.json',
        content: null
      },
      {
        type: 'file',
        name: '_global_variables.json',
        content: null
      }
    ]
  },
  {
    type: 'folder',
    name: 'textures',
    children: []
  },
  {
    type: 'file',
    name: 'manifest.json',
    content: '{"format_version":1,"header":{"description":"","name":"","uuid":"","version":[1,0,0]},"modules":[{"type":"resources","uuid":"","version":[1,0,0]}]}'
  },
  {
    type: 'file',
    name: 'pack_icon.png',
    content: null
  },
];
let projectName="",projectDesc="";
function deleteEmpty(e){for(var t=e.length-1;t>=0;t--){var l=e[t];"folder"===l.type?(deleteEmpty(l.children),0===l.children.length&&e.splice(t,1)):"file"!==l.type||l.content&&""!==l.content||e.splice(t,1)}}
function deleteFile(r,e){var t=r.split("/"),n=fileStructure,i=!0,f=!1,o=void 0;try{for(var l,u=t[Symbol.iterator]();!(i=(l=u.next()).done);i=!0)!function(){var r=l.value,e=n.find(function(e){return"folder"===e.type&&e.name===r});if(!e)throw new Error("the path does not exist");n=e.children}()}catch(r){f=!0,o=r}finally{try{!i&&u.return&&u.return()}finally{if(f)throw o}}var a=n.findIndex(function(r){return"file"===r.type&&r.name===e});if(-1===a)throw new Error("the file does not exist");n.splice(a,1)}
function fileRead(n){for(var r=n.split("/"),t=fileStructure,e=0;e<r.length;e++)!function(e){var i=r[e];if(!i)return"continue";var o=t.find(function(n){return n.name===i});if(!o)throw new Error("Path "+n+" not found");if(!(t=o.children||o))throw new Error("Path "+n+" not found")}(e);if(null!==t.content||null!==t.children)return t;throw new Error("Invalid path "+n)}
function findFileByName(a,b){var c=!0,d=!1,e=void 0;try{for(var g,h,f=a[Symbol.iterator]();!(c=(g=f.next()).done);c=!0){if(h=g.value,h.name===b)return h;if('folder'===h.type){var i=findFileByName(h.children,b);if(i)return i}}}catch(h){d=!0,e=h}finally{try{!c&&f.return&&f.return()}finally{if(d)throw e}}return null}
function addFileToFolder(e,r,n){for(var t=e.split("/"),l=0;l<fileStructure.length;l++){var i=fileStructure[l];if("folder"===i.type&&i.name===t[0]){if(i.children||(i.children=[]),1===t.length){for(var f=r,u=r.substring(0,r.lastIndexOf(".")),d=r.substring(r.lastIndexOf(".")),o=i.children.filter(function(e){return"file"===e.type}).map(function(e){return e.name}),a=1;o.includes(f);)f=u+"_"+a+d,a++;return i.children.push({type:"file",name:f,content:n}),f}var c=addFileToFolder(t.slice(1).join("/"),r,n,i.children);if(c)return c}}return console.error('Unable to find folder at path "'+e+'"'),null}
function addFilesToZip(folder,zip){folder.forEach(item=>{if(item.type==='file'){zip.file(item.name,item.content);}else if(item.type==='folder'){const newFolder=zip.folder(item.name);addFilesToZip(item.children,newFolder);}});}
function downloadZip(a){const b=new JSZip;addFilesToZip(a,b),b.generateAsync({type:"blob"}).then(function(a){saveAs(a,projectName||"立方之窗_自定义包")})}
function fetchImage(url,callback){fetch(url).then(response=>response.blob()).then(blob=>{const icon=fileStructure.find(item=>item.name==='pack_icon.png');if(icon)icon.content=blob;if(typeof callback==='function')callback(blob);}).catch(error=>console.error('Fetching image failed:',error));}
function get_uuid(){var a=(new Date).getTime();return window.performance&&"function"==typeof window.performance.now&&(a+=performance.now()),"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(b){var c=0|(a+16*Math.random())%16;return a=Math.floor(a/16),("x"==b?c:8|3&c).toString(16)})}

function topBar({title}){
  const [theme,setTheme] = useState(localStorage.getItem('themeType'));
  return Cube.c("div",{className:"ns",style:"position: relative;overflow: hidden"},
    Cube.c("mdui-top-app-bar",{"scroll-behavior":"elevate","scroll-target":"#content"},
      Cube.c("mdui-top-app-bar-title",{style:"margin-left:8px"},Cube.c("a",{href:"/",style:"color: inherit; text-decoration: none;"},title||"立方之窗")),
      Cube.c("div",{style:"flex-grow: 1"}),
      Cube.c("mdui-dropdown",null,
        Cube.c("mdui-button-icon",{slot:"trigger"},Cube.c("ion-icon",{attr:{name:theme==="dark"?"moon-outline":"sunny-outline"}})),
        Cube.c("mdui-menu",{selects:"single",value:theme||"auto"},
          Cube.c("mdui-menu-item",{onClick:()=>{setTheme("light");mdui.setTheme('light');localStorage.setItem('themeType',"light");},value:"light"},"浅色"),
          Cube.c("mdui-menu-item",{onClick:()=>{setTheme("dark");mdui.setTheme('dark');localStorage.setItem('themeType',"dark");},value:"dark"},"深色"),
          Cube.c("mdui-divider"),
          Cube.c("mdui-menu-item",{onClick:()=>{setTheme("auto");mdui.setTheme('auto'),localStorage.setItem('themeType',"auto");},value:"auto"},"跟随系统")
        )
      )
    )
  )
}

// index
function navScreen(){
  const dialog = useRef();
  const nextBtn = useRef();
  const nameInput = useRef();
  const customBtn = function(){
    dialog.current.open=true;
    setTimeout(()=>{document.body.style.width="auto"},1)
  }
  const closeBtn = function(){dialog.current.open=false}
  const checkInput = function(e){projectName=e.target.inputRef.value.value;e.target.inputRef.value.value.trim().length>0?nextBtn.current.removeAttribute("disabled"):nextBtn.current.setAttribute("disabled","disabled")}
  const descInput = function(e){projectDesc=e.target.inputRef.value.value;}
  const next = function(){
    fetchImage("/res/image/icon.png");
    let manifest=fileStructure.find(item=>item.name==='manifest.json');
    let manifestJSON=JSON.parse(manifest.content);
    manifestJSON.header.name=projectName;
    manifestJSON.header.description=projectDesc;
    manifestJSON.header.uuid=get_uuid();
    manifestJSON.modules[0].uuid=get_uuid();
    manifest.content=JSON.stringify(manifestJSON);
    Cube.skipRouter("/item");
  }
  return Cube.c(Cube.fragment,null,
    Cube.c("div",{id:"content",className:"ns mdui-container"},
      Cube.c("div",{className:"mdui-container"},
      Cube.c("h1",null,"站点索引"),
      Cube.c("p",null,"一目了然的网站全貌，轻松找到您需要的内容")),
      Cube.c("div",null,
        Cube.c("mdui-button",{style:"width:100%;",onClick:customBtn},"开始自定义")
      ),
      Cube.c("mdui-dialog",{ref:dialog,attr:{"close-on-overlay-click":"close-on-overlay-click","close-on-esc":"close-on-esc"}},
        Cube.c("span",{slot:"headline"},"资源包信息"),
        Cube.c("mdui-text-field",{maxlength:32,ref:nameInput,onInput:checkInput,counter:"counter",label:"名称"}),
        Cube.c("mdui-text-field",{attr:{"max-rows":5},onInput:descInput,autosize:"autosize",maxlength:150,counter:"counter",label:"描述"}),
        Cube.c("mdui-button",{slot:"action",variant:"text",onClick:closeBtn},"取消"),
        Cube.c("mdui-button",{slot:"action",variant:"filled",ref:nextBtn,onClick:next,disabled:"disabled"},"下一步")
      )
    )
  )
}

// itemScreen
function bottomBtn({leftFn,rightFn,leftText,rightText,leftBtn}){
  return Cube.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%"},
    leftBtn?leftBtn:Cube.c("mdui-button",{onClick:leftFn,style:"width:50%;margin-bottom:5px;margin-right:5px;box-sizing:border-box;width:calc(50% - 10px);",variant:"outlined"},leftText),
    Cube.c("mdui-button",{onClick:rightFn,style:"width:50%;margin-bottom:5px;box-sizing:border-box;width:calc(50% - 10px)",variant:"filled"},rightText)
  )
}
function itemScreen(){
  const confirmExit = function(e){
    e.returnValue = "你确定要退出表单提交吗？";
    return "你确定要退出表单提交吗？";
  }
  window.addEventListener('beforeunload',confirmExit);
  const quitBtn = function(){
    mdui.dialog({
      headline:"你确定要退出吗？",
      description:"刷新网页后，自定义操作的数据将会删除",
      closeOnEsc:true,closeOnOverlayClick:true,
      actions:[
        {text:"取消"},
        {text:"退出",onClick:function(){window.removeEventListener('beforeunload',confirmExit);Cube.skipRouter("/nav")}}
      ]
    })
  }
  const downloadBtn = function(){
    mdui.dialog({
      headline:"下载",
      description:"下载完成后，将下载的压缩包的后缀改为.mcpack，之后使用 Minecraft 打开！",
      closeOnEsc:true,closeOnOverlayClick:true,
      actions:[
        {text:"取消"},
        {text:"确定",onClick:function(){window.removeEventListener('beforeunload',confirmExit);deleteEmpty(fileStructure);downloadZip(fileStructure);}}
      ]
    })
  }
  function toMusic(){Cube.skipRouter("/music")}
  //function toBg(){Cube.skipRouter("/bg")}
  function card({icon,title,onClick}){
    const coming_soon = function(){mdui.snackbar({message:"敬请期待",closeable:true,autoCloseDelay:3000,closeOnOutsideClick:true,placement:"top"})}
    return Cube.c("mdui-card",{onClick:onClick||coming_soon,style:"box-sizing:border-box;width:calc(50% - 10px);padding:10px;margin:5px;height:90px",clickable:"clickable"},
      Cube.c("ion-icon",{style:"font-size:32px;",attr:{name:icon}}),
      Cube.c("span",{style:"position:absolute;bottom:10px;left:10px;"},title)
    )
  }
  return Cube.c(Cube.fragment,null,
    Cube.c("div",{id:"content",className:"ns mdui-container"},
      Cube.c("div",{className:"mdui-container"},
      Cube.c("h1",null,"自定义项目"),
      Cube.c("p",null,"选择你需要自定义的项目，定制完成后，点击下方的下载按钮下载压缩包"),
      Cube.c("div",{style:"display:flex;flex-wrap: wrap;"},
        Cube.c(card,{icon:"musical-notes",title:"音乐",onClick:toMusic}),
        Cube.c(card,{icon:"image",title:"背景"}),
        Cube.c(card,{icon:"extension-puzzle",title:"功能"}),
        Cube.c(card,{icon:"brush",title:"主题"})
      )),
    ),
    Cube.c(bottomBtn,{leftFn:quitBtn,rightFn:downloadBtn,leftText:"退出",rightText:"下载"})
  )
}

// bgScreen
function bgScreen(){
  var uploadFile=useRef(),video=useRef();
  var videoHandle=function(e){
    var file=e.target.files[0];
    if(file.type.match('video/mp4')){
      video.current.src=URL.createObjectURL(file)
    }
  }
  var save=function(){Cube.skipRouter("/item")}
  var allowDrop=function(a){a.preventDefault()},handleClickOrDrop=function(a,b){a.preventDefault();var c,d=b.current;if('drop'===a.type)c=a.dataTransfer.files,d.files=c;else if('click'===a.type)return void d.click()};
  var leftBtn=Cube.c("mdui-button",{onClick:e=>handleClickOrDrop(e,uploadFile),ondrop:e=>handleClickOrDrop(e,uploadFile),ondragover:allowDrop,style:"width:50%;margin-bottom:5px;margin-right:5px;box-sizing:border-box;width:calc(50% - 10px);",variant:"outlined"},"上传");
  return Cube.c(Cube.fragment,null,
    Cube.c("div",{id:"content",className:"ns mdui-container"},
      Cube.c("h1",null,"背景"),
      Cube.c("p",null,"你可以点击上传按钮上传视频，点击保存按钮后即可制作动态背景"),
      Cube.c("input",{attr:{type:"file"},onChange:videoHandle,ref:uploadFile,style:"display:none"}),
      Cube.c("video",{attr:{controls:"controls"},ref:video,style:"margin-top:5px;width:100%"})
    ),
    Cube.c(bottomBtn,{leftBtn:leftBtn,rightFn:save,leftText:"上传",rightText:"保存"})
  )
}

// musicScreen
function musicScreen(){
  var musicName=useRef(),musicAuthor=useRef(),addBtn=useRef(),dialog=useRef(),musicFile=useRef(),coverFile=useRef();
  var close=()=>{dialog.current.open=false},coverChange=function(e){coverFile.name=e.target.files[0].name},musicChange=function(a){var b=a.target.files[0];if(b){var c=b.name.split(".").pop();return"ogg"===c?void(""===musicName.current.inputRef.value.value&&musicName.current.setRangeText(b.name.substring(0,b.name.lastIndexOf("."))),addBtn.current.disabled=!1):mdui.snackbar({message:"\u8BE5\u683C\u5F0F\u7684\u6587\u4EF6\u4E0D\u652F\u6301\uFF0C\u8BF7\u4E0A\u4F20 .ogg \u6587\u4EF6",closeable:!0,autoCloseDelay:3e3,closeOnOutsideClick:!0,placement:"top"})}};
  var allowDrop=function(a){a.preventDefault()},handleClickOrDrop=function(a,b){a.preventDefault();var c,d=b.current;if('drop'===a.type)c=a.dataTransfer.files,d.files=c;else if('click'===a.type)return void d.click()};

  var setting = findFileByName(fileStructure,"_setting.json");
  if(setting.content===null)setting.content=`{"customAlbum@cn80b37451.f":{"$listContent":[]}}`;
  var setJson = JSON.parse(setting.content)
  var soundsDef = findFileByName(fileStructure,"sound_definitions.json");
  if(soundsDef.content===null)soundsDef.content=`{"cube.music.custom":{"category":"ui","sounds":[]}}`;
  var soundsDefJson = JSON.parse(soundsDef.content)

  var item = setJson["customAlbum@cn80b37451.f"]["$listContent"];
  var newBtn=()=>{dialog.current.open=true}
  var addMusic=()=>{
    var name=musicName.current.inputRef.value.value,author=musicAuthor.current.inputRef.value.value,fileReader=new FileReader(),audio=new Audio();
    fileReader.onload = function(e){
      var blob = new Blob([e.target.result], { type: 'audio/ogg' });
      var oggPath = "sounds/"+addFileToFolder("sounds",name+".ogg",blob);
      var coverFiles = coverFile.current.files,coverPath="",oggID = get_uuid();
      if(coverFiles&&coverFiles.length>0){
        var coverID=get_uuid(),reader=new FileReader(),coverType=coverFiles[0].type;
        coverPath="textures/"+coverID+"."+coverFile.name.split('.').pop();
        reader.onload=function(e){
          var coverBlob = new Blob([e.target.result], { type: coverType });
          addFileToFolder("textures",coverID+"."+coverFile.name.split('.').pop(),coverBlob)
        }
        reader.readAsArrayBuffer(coverFiles[0])
      }
      soundsDefJson[oggID]={category:"ui",sounds:[{name:oggPath.slice(0,oggPath.lastIndexOf(".")),load_on_low_memory:true,volume:0.5}]}
      soundsDefJson["cube.music.custom"].sounds.push({name:oggPath.slice(0,oggPath.lastIndexOf(".")),load_on_low_memory:true,volume:0.5})
      soundsDef.content=JSON.stringify(soundsDefJson)
      audio.src=URL.createObjectURL(blob);
      audio.addEventListener('loadedmetadata',function(){
        const duration=audio.duration,
        musicData={[item.length+"@cn80b37451.m"]:{"$music_name":name,"$music_author":author,"$music_id":oggID,"$music_cover":coverPath,"$music_minute":Math.floor(duration / 60),"$music_second":Math.floor(duration % 60)}};
        setJson["customAlbum@cn80b37451.f"]["$listContent"].push(musicData)
        setting.content=JSON.stringify(setJson)
        musicFile.current.value="",coverFile.current.value="",addBtn.current.disabled=!0;
        dialog.current.open=false
        Cube.forceUpdate()
      })
    };
    fileReader.readAsArrayBuffer(musicFile.current.files[0]);
  };
  var deleteMusic=i=>{
    var firstKeys=Object.keys(item[i]),musicID=item[i][firstKeys]["$music_id"],coverPath=item[i][firstKeys]["$music_cover"],soundsDef=fileRead("sounds/sound_definitions.json"),soundsDefJson=JSON.parse(soundsDef.content),oggPath=soundsDefJson[musicID]["sounds"][0]["name"]+".ogg";item.splice(i,1),
    coverPath!==''&&deleteFile("textures",coverPath.slice(coverPath.lastIndexOf('/')+1)),deleteFile("sounds",oggPath.slice(oggPath.lastIndexOf('/')+1)),setting.content=JSON.stringify(setJson),soundsDefJson["cube.music.custom"].sounds.splice(i,1),delete soundsDefJson[musicID],soundsDef.content=JSON.stringify(soundsDefJson),Cube.forceUpdate()
  }
  var save = function(){Cube.skipRouter("/item")}
  return Cube.c(Cube.fragment,null,
    Cube.c("div",{id:"content",className:"ns mdui-container"},
      Cube.c("mdui-list",{className:"mdui-container"},
        item.map((i,index)=>{
          var firstKey=Object.keys(i),musicObj=i[firstKey[0]];
          return Cube.c("mdui-list-item",{rounded:"rounded"},musicObj["$music_name"],
            Cube.c("span",{slot:"description"},musicObj["$music_author"]),
            Cube.c("mdui-dropdown",{slot:"end-icon",style:"line-height:normal;"},
              Cube.c("mdui-button-icon",{slot:"trigger"},Cube.c("ion-icon",{attr:{name:"ellipsis-vertical"}})),
              Cube.c("mdui-menu",null,Cube.c("mdui-menu-item",{onClick:()=>deleteMusic(index)},"删除"))
            ))
        })),
      item.length===0&&Cube.c("div",{style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
        Cube.c("div",{style:{fontSize:"32px"}},"列表是空的"),
        Cube.c("div",{style:{fontSize:"14px",marginTop:"4px"}},"点击左下角按钮添加音乐～")
    )),
    Cube.c(bottomBtn,{leftFn:newBtn,rightFn:save,leftText:"添加",rightText:"保存"}),
    Cube.c("mdui-dialog",{ref:dialog,attr:{"close-on-overlay-click":"close-on-overlay-click","close-on-esc":"close-on-esc"}},
      Cube.c("span",{slot:"headline"},"添加音乐"),
      Cube.c("mdui-text-field",{maxlength:32,ref:musicName,counter:"counter",label:"音乐名称"}),
      Cube.c("mdui-text-field",{maxlength:32,ref:musicAuthor,counter:"counter",label:"音乐作者"}),
      Cube.c("mdui-segmented-button-group",{attr:{"full-width":"full-width"}},
        Cube.c("mdui-segmented-button",{ondrop:e=>handleClickOrDrop(e,coverFile),onClick:e=>handleClickOrDrop(e,coverFile),ondragover:allowDrop},"封面"),
        Cube.c("mdui-segmented-button",{ondrop:e=>handleClickOrDrop(e,musicFile),onClick:e=>handleClickOrDrop(e,musicFile),ondragover:allowDrop},"文件")),
      Cube.c("input",{attr:{type:"file",accept:"audio/*"},ref:musicFile,onChange:musicChange,style:"display:none"}),
      Cube.c("input",{attr:{type:"file",accept:"image/*"},ref:coverFile,onChange:coverChange,style:"display:none"}),
      Cube.c("mdui-button",{slot:"action",variant:"text",onClick:close},"取消"),
      Cube.c("mdui-button",{slot:"action",variant:"filled",onClick:addMusic,ref:addBtn,disabled:"disabled"},"添加")
    )
  )
}

function home(){
  return Cube.c(Cube.fragment,null,
    Cube.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      Cube.c("div",{style:{fontSize:"32px"}},"敬请期待"),
      Cube.c("div",{style:{fontSize:"15px",marginTop:"4px"}},"该网站正在完善中…")
    )
  )
}
function errorScreen(){
  return Cube.c(Cube.fragment,null,
    Cube.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      Cube.c("div",{style:{fontSize:"32px"}},"404"),
      Cube.c("div",{style:{fontSize:"15px",marginTop:"4px"}},"该页面不存在"),
      Cube.c("mdui-button",{href:"/",style:{marginTop:"8px"}},"返回首页")
    )
  )
}
function App(){
  return Cube.c(Cube.fragment,null,Cube.c(topBar),Cube.c(Cube.BrowserRouter,{errorComponent:errorScreen},
    Cube.c(Cube.router,{path:"/",component:home}),
    Cube.c(Cube.router,{path:"/nav",component:navScreen}),
    Cube.c(Cube.router,{path:"/item",component:itemScreen}),
    Cube.c(Cube.router,{path:"/music",component:musicScreen}),
    Cube.c(Cube.router,{path:"/bg",component:bgScreen}),
  ));
}
if(window.location.href.startsWith("https://wisebreeze.github.io")){Cube.setInitialPath("cv/")}
document.addEventListener("DOMContentLoaded",function(){
  const container = document.getElementById("app")
  Cube.root(App,container)
});
})()