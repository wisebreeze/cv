(function(){
mdui.setColorScheme("#778BFF");
var data = localStorage.getItem('themeType');
typeof data == "string"&&mdui.setTheme(data);
var saveAs=saveAs||"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(a){if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f=!a.externalHost&&"download"in e,g=a.webkitRequestFileSystem,h=a.requestFileSystem||g||a.mozRequestFileSystem,i=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},j="application/octet-stream",k=0,l=[],m=function(){for(var a,b=l.length;b--;)a=l[b],"string"==typeof a?d.revokeObjectURL(a):a.remove();l.length=0},n=function(a,b,c){var d,e;for(b=[].concat(b),d=b.length;d--;)if(e=a["on"+b[d]],"function"==typeof e)try{e.call(a,c||a)}catch(f){i(f)}},o=function(d,i){var m,o,p,q,r=this,s=d.type,t=!1,u=function(){var a=c().createObjectURL(d);return l.push(a),a},v=function(){n(r,"writestart progress write writeend".split(" "))},w=function(){(t||!m)&&(m=u(d)),o?o.location.href=m:window.open(m,"_blank"),r.readyState=r.DONE,v()},x=function(a){return function(){return r.readyState!==r.DONE?a.apply(this,arguments):void 0}},y={create:!0,exclusive:!1};return r.readyState=r.INIT,i||(i="download"),f?(m=u(d),b=a.document,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),e.href=m,e.download=i,q=b.createEvent("MouseEvents"),q.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(q),r.readyState=r.DONE,v(),void 0):(a.chrome&&s&&s!==j&&(p=d.slice||d.webkitSlice,d=p.call(d,0,d.size,j),t=!0),g&&"download"!==i&&(i+=".download"),(s===j||g)&&(o=a),h?(k+=d.size,h(a.TEMPORARY,k,x(function(a){a.root.getDirectory("saved",y,x(function(a){var b=function(){a.getFile(i,y,x(function(a){a.createWriter(x(function(b){b.onwriteend=function(b){o.location.href=a.toURL(),l.push(a),r.readyState=r.DONE,n(r,"writeend",b)},b.onerror=function(){var a=b.error;a.code!==a.ABORT_ERR&&w()},"writestart progress write abort".split(" ").forEach(function(a){b["on"+a]=r["on"+a]}),b.write(d),r.abort=function(){b.abort(),r.readyState=r.DONE},r.readyState=r.WRITING}),w)}),w)};a.getFile(i,{create:!1},x(function(a){a.remove(),b()}),x(function(a){a.code===a.NOT_FOUND_ERR?b():w()}))}),w)}),w),void 0):(w(),void 0))},p=o.prototype,q=function(a,b){return new o(a,b)};return p.abort=function(){var a=this;a.readyState=a.DONE,n(a,"abort")},p.readyState=p.INIT=0,p.WRITING=1,p.DONE=2,p.error=p.onwritestart=p.onprogress=p.onwrite=p.onabort=p.onerror=p.onwriteend=null,a.addEventListener("unload",m,!1),q.unload=function(){m(),a.removeEventListener("unload",m,!1)},q}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);
var {useState,useEffect,useRef} = cv,
collapse=useRef()

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
        content: `{"$cube_custom_boolean":true,"$cube_custom_from_website":true}`
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
],
varObj=[
{title:"HUD",content:[
  {name:"快捷栏选定颜色动画",id:"daf3c18e"},
  {name:"圆角快捷栏",id:"f51d10b7",def:!0},
  {name:"侧边记分板分数",id:"838534a8",def:!0},
  {name:"折叠附魔信息",id:"bac1d62e"},0,
  {name:"隐藏 HUD",id:"ecf4b741",def:!0},
  {name:"隐藏 HUD 提示",id:"13564f64",def:!0},
  {name:"HUD 提示时长",id:"269a8a99",def:3.5,type:"textField"},
  {name:"始终显示快捷栏",desc:"隐藏Hud时，始终显示快捷栏",id:"f89237ba"},0,
  {name:"聊天栏消息显示条数",id:"706f8519",def:8,round:!0,type:"textField"},0,
  {name:"环境渲染",id:"352b190b",def:!0},
  {name:"触屏圆圈进度",id:"7b5039a2",def:!0},0,
  {name:"信息显示位置",id:"83f6db8f",def:1,type:"dropdown",items:["顶部","底部"]},
  {name:"耐久样式",id:"fb27fdf6",def:0,type:"dropdown",items:["百分比","详细"]},
  {name:"物品数量",id:"c827079b",def:!0},
  {name:"物品 ID",id:"d0c8872c"},
  {name:"物品数据值",id:"506d4838",desc:"需启用“物品 ID”"},
  {name:"耐久",id:"41dd8cd4",def:!0},
  {name:"辅助物品",id:"b21e18db",def:!0},
  {name:"追溯指针",id:"ef309951",desc:"需启用“辅助物品”，低于1.19版本不要开启"},0,
  {name:"辅助准心",id:"089fd192",def:!0},
  {name:"无条件显示",id:"78743dd4",desc:"需启用“辅助准心”"},0,
  {name:"地图",id:"af0089db",desc:"仅中国版可用"},
  {name:"大小",id:"8d09f184",def:[32,32],type:"size"},
  {name:"实时更新",id:"d6b5a438",def:!0},
  {name:"实时更新间隔",id:"eb035ece",def:3,round:!0,type:"textField"}
]},{title:"背包和容器",content:[
  {name:"始终快速移动",id:"a4709548"},
  {name:"控制物品数量",id:"bf7db8a5",def:!0},
  {name:"显示飞行物品",id:"894d44d5",def:!0},
  {name:"是否双击一键合成",id:"40fac462",def:!0},
  {name:"过滤物品",id:"32686c12",desc:"⚠️ 开发中",def:!0},
  {name:"受伤时关闭容器",id:"7c333392",def:!0},
  {name:"物品 AUX ID",id:"5b8cc68e"},
  {name:"选择数量",id:"ded3a8c5",def:!0},0,
  {name:"帮助",id:"dfcffcc5",def:!0},
  {name:"增强酿造指南",id:"04d7ac52"},0,
  {name:"连锁移动",id:"70a9fab5"},
  {name:"默认连锁移动",id:"b6cb0c61",def:!0},
  {name:"快捷栏连锁移动",id:"c7e25550"},
  {name:"禁用连锁丢弃",id:"ca15dac8",def:!0},0,
  {name:"显示盔甲值",id:"099671d2",desc:"⚠️ 开发中",def:!0}
]},{title:"隐私",content:[
  {name:"玩家名称",id:"b83676b3",def:!0},
  {name:"坐标",id:"e4a7ac08",def:!0}
]},{title:"全局",content:[
  {name:"文本框最大字符长度",id:"0a923b41",def:2147483647,round:!0,type:"textField"},
  {name:"文本框亵渎过滤器",id:"b0455ac5"},
  {name:"测试版顶部调试文字",id:"1e2ff19a",def:!0},
  {name:"百分比",id:"20ccca31",def:!0}
]},{title:"设置",content:[
  {name:"查看路径",id:"c4c8702e",def:!0},
  {name:"旧世界",id:"84b37071",desc:"✨ 需要使用 1.20.73 以及更早版本版本，新版本被 Ore UI 代替",def:!0},
  {name:"流畅度",id:"e1ed717a",def:!0}
]},{title:"美化",content:[
  {name:"屏幕边框",id:"e6786154",def:!0}
]},{title:"优化",content:[
  {name:"低频渲染",id:"8a30c7d6"}
]},{title:"模态",content:[
  {name:"遮罩",id:"3f9be171"},
  {name:"空白处关闭类型",id:"c4db2e62",def:2,type:"dropdown",items:["无","点击","双击"]}
]},{title:"开始",content:[
  {name:"相片分割",id:"c1919f11"}
]},{title:"游戏",content:[
  {name:"最近游戏",id:"e5ccf1eb",def:!0}
]},{title:"音乐",content:[
  {name:"音乐",id:"5fc8cf29",def:!0},
  {name:"当前播放时长",id:"9cdaa0d3",def:!0},
  {name:"倍速播放",id:"5d9e4f0e"},
  {name:"音量调节",id:"9c9e051d",def:!0}
]},{title:"暂停",content:[
  {name:"保存并退出提示",id:"e4e1334d",def:!0}
]},{title:"聊天",content:[
  {name:"显示限制",id:"e8bcd7b9",def:100,round:!0,type:"textField"},
  {name:"受伤时关闭聊天屏幕",id:"9cbb46ee",def:!0},
  {name:"增强命令显示",id:"b9a8724e",def:!0},
  {name:"忽略设置字体",id:"fa7d1a3c"}
]},{title:"其他",content:[
  {name:"受伤时关闭药水效果屏幕",id:"9003f259",def:!0},
  {name:"受伤时关闭书与羽毛屏幕",id:"f2234e31",def:!0},
  {name:"总是解锁未交易选项",id:"9ed4aeaf",def:!0},
  {name:"命令实际延迟",id:"539b5cb4",def:!0},
  {name:"彩蛋",id:"bc8b0fd2",desc:"⚠️ 开发中",def:!0}
]},{title:"开发者",prefix:"$cube_dev_",content:[
  {name:"调试工具",id:"tool"},
  {name:"调试状态",id:"status"},
  {name:"调试信息",id:"message"},
  {name:"调试布局",id:"layout"},
  {name:"指针位置",id:"pointer",desc:"⚠️ 开发中"},
  {name:"聊天",id:"chat"},0,
  {name:"环境沙盒",id:"c923cef2"},
  {name:"屏幕大小",id:"5523405d",def:["default","default"],type:"size"},
  {name:"开发者",id:"9b52c609",def:!0},
  {name:"中国版",id:"b53ba732"},
  {name:"键盘＆鼠标",id:"decdc2ac",def:!0},
  {name:"触屏",id:"cf295d3c"},
  {name:"游戏手柄",id:"950d0911"}
]}];
let projectName="",projectDesc="";
function arraysEqual(arr1,arr2){if(!Array.isArray(arr1)&&!Array.isArray(arr2))return arr1===arr2;if(arr1.length!==arr2.length)return false;return arr1.every((v,i)=>v===arr2[i])}
function mergeObjects(){return Array.from(arguments).reduce((target,source)=>(Object.keys(source).forEach(key=>target[key]=source[key]),target),{})}
function deleteEmpty(e){for(var t=e.length-1;t>=0;t--){var l=e[t];"folder"===l.type?(deleteEmpty(l.children),0===l.children.length&&e.splice(t,1)):"file"!==l.type||l.content&&""!==l.content||e.splice(t,1)}}
function deleteFile(r,e){var t=r.split("/"),n=fileStructure,i=!0,f=!1,o=void 0;try{for(var l,u=t[Symbol.iterator]();!(i=(l=u.next()).done);i=!0)!function(){var r=l.value,e=n.find(function(e){return"folder"===e.type&&e.name===r});if(!e)throw new Error("the path does not exist");n=e.children}()}catch(r){f=!0,o=r}finally{try{!i&&u.return&&u.return()}finally{if(f)throw o}}var a=n.findIndex(function(r){return"file"===r.type&&r.name===e});if(-1===a)throw new Error("the file does not exist");n.splice(a,1)}
function fileRead(n){for(var r=n.split("/"),t=fileStructure,e=0;e<r.length;e++)!function(e){var i=r[e];if(!i)return"continue";var o=t.find(function(n){return n.name===i});if(!o)throw new Error("Path "+n+" not found");if(!(t=o.children||o))throw new Error("Path "+n+" not found")}(e);if(null!==t.content||null!==t.children)return t;throw new Error("Invalid path "+n)}
function findFileByName(a,b){var c=!0,d=!1,e=void 0;try{for(var g,h,f=a[Symbol.iterator]();!(c=(g=f.next()).done);c=!0){if(h=g.value,h.name===b)return h;if('folder'===h.type){var i=findFileByName(h.children,b);if(i)return i}}}catch(h){d=!0,e=h}finally{try{!c&&f.return&&f.return()}finally{if(d)throw e}}return null}
function addFileToFolder(e,r,n){for(var t=e.split("/"),l=0;l<fileStructure.length;l++){var i=fileStructure[l];if("folder"===i.type&&i.name===t[0]){if(i.children||(i.children=[]),1===t.length){for(var f=r,u=r.substring(0,r.lastIndexOf(".")),d=r.substring(r.lastIndexOf(".")),o=i.children.filter(function(e){return"file"===e.type}).map(function(e){return e.name}),a=1;o.includes(f);)f=u+"_"+a+d,a++;return i.children.push({type:"file",name:f,content:n}),f}var c=addFileToFolder(t.slice(1).join("/"),r,n,i.children);if(c)return c}}return console.error('Unable to find folder at path "'+e+'"'),null}
function addFilesToZip(folder,zip){folder.forEach(item=>{if(item.type==='file'){zip.file(item.name,item.content);}else if(item.type==='folder'){const newFolder=zip.folder(item.name);addFilesToZip(item.children,newFolder);}});}
function downloadZip(a){const b=new JSZip;addFilesToZip(a,b),b.generateAsync({type:"blob"}).then(function(a){saveAs(a,projectName||"立方之窗_自定义包")})}
function fetchImage(url,callback){fetch(url).then(response=>response.blob()).then(blob=>{const icon=fileStructure.find(item=>item.name==='pack_icon.png');if(icon)icon.content=blob;if(typeof callback==='function')callback(blob);}).catch(error=>console.error('Fetching image failed:',error));}
function get_uuid(){var a=(new Date).getTime();return window.performance&&"function"==typeof window.performance.now&&(a+=performance.now()),"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(b){var c=0|(a+16*Math.random())%16;return a=Math.floor(a/16),("x"==b?c:8|3&c).toString(16)})}
function debounce(func,delay){let timerId;return function(){const context=this;const args=arguments;clearTimeout(timerId);timerId=setTimeout(function(){func.apply(context,args);},delay)}}
function throttle(func,interval){let lastTime=0;return function(...args){const now=Date.now();if(now-lastTime>=interval){lastTime=now;func.apply(this,args)}}}

function topBar({title}){
  const [theme,setTheme] = useState(localStorage.getItem('themeType'));
  return cv.c("div",{className:"ns",style:"position: relative;overflow: hidden"},
    cv.c("mdui-top-app-bar",{"scroll-behavior":"elevate","scroll-target":"#content"},
      cv.c("mdui-top-app-bar-title",{style:"margin-left:8px"},cv.c("a",{href:"/",style:"color: inherit; text-decoration: none;"},title||"立方之窗")),
      cv.c("div",{style:"flex-grow: 1"}),
      cv.c("mdui-dropdown",null,
        cv.c("mdui-button-icon",{slot:"trigger"},cv.c("ion-icon",{attr:{name:theme==="dark"?"moon-outline":"sunny-outline"}})),
        cv.c("mdui-menu",{selects:"single",value:theme||"auto"},
          cv.c("mdui-menu-item",{onClick:()=>{setTheme("light");mdui.setTheme('light');localStorage.setItem('themeType',"light");},value:"light"},"浅色"),
          cv.c("mdui-menu-item",{onClick:()=>{setTheme("dark");mdui.setTheme('dark');localStorage.setItem('themeType',"dark");},value:"dark"},"深色"),
          cv.c("mdui-divider"),
          cv.c("mdui-menu-item",{onClick:()=>{setTheme("auto");mdui.setTheme('auto'),localStorage.setItem('themeType',"auto");},value:"auto"},"跟随系统")
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
    let manifest=fileStructure.find(item=>item.name==='manifest.json'),
    manifestJSON=JSON.parse(manifest.content);
    manifestJSON.header.name=projectName;
    manifestJSON.header.description=projectDesc;
    manifestJSON.header.uuid=get_uuid();
    manifestJSON.modules[0].uuid=get_uuid();
    manifest.content=JSON.stringify(manifestJSON);
    let globalVariablesFile=fileRead("ui/_global_variables.json"),
    globalVariablesJSON=JSON.parse(globalVariablesFile.content)
    globalVariablesJSON["$cube_custom_name"]=projectName;globalVariablesJSON["$cube_custom_desc"]=projectDesc;globalVariablesJSON["$cube_custom_uuid"]=manifestJSON.header.uuid;globalVariablesJSON["$cube_custom_version"]=0;globalVariablesJSON["$cube_custom_target_api"]=4000
    globalVariablesFile.content=JSON.stringify(globalVariablesJSON)
    cv.skipRouter("/item");
  }
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container"},
      cv.c("div",{className:"mdui-container"},
      cv.c("h1",null,"站点索引"),
      cv.c("p",null,"一目了然的网站全貌，轻松找到您需要的内容")),
      cv.c("div",null,
        cv.c("mdui-button",{style:"width:100%;",onClick:customBtn},"开始自定义")
      ),
      cv.c("mdui-dialog",{ref:dialog,attr:{"close-on-overlay-click":"close-on-overlay-click","close-on-esc":"close-on-esc"}},
        cv.c("span",{slot:"headline"},"资源包信息"),
        cv.c("mdui-text-field",{maxlength:32,ref:nameInput,onInput:checkInput,counter:"counter",label:"名称"}),
        cv.c("mdui-text-field",{attr:{"max-rows":5},onInput:descInput,autosize:"autosize",maxlength:150,counter:"counter",label:"描述"}),
        cv.c("mdui-button",{slot:"action",variant:"text",onClick:closeBtn},"取消"),
        cv.c("mdui-button",{slot:"action",variant:"filled",ref:nextBtn,onClick:next,disabled:"disabled"},"下一步")
      )
    )
  )
}

// item
function bottomBtn({leftFn,rightFn,leftText,rightText,leftBtn}){
  return cv.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%"},
    leftBtn?leftBtn:cv.c("mdui-button",{onClick:leftFn,style:"width:50%;margin-bottom:5px;margin-right:5px;box-sizing:border-box;width:calc(50% - 10px);",variant:"outlined"},leftText),
    cv.c("mdui-button",{onClick:rightFn,style:"width:50%;margin-bottom:5px;box-sizing:border-box;width:calc(50% - 10px)",variant:"filled"},rightText)
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
        {text:"退出",onClick:function(){window.removeEventListener('beforeunload',confirmExit);cv.skipRouter("/nav")}}
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
  function toMusic(){cv.skipRouter("/music")}
  function toVariables(){cv.skipRouter("/variables")}
  //function toBg(){cv.skipRouter("/bg")}
  function card({icon,title,onClick}){
    const coming_soon = function(){mdui.snackbar({message:"敬请期待",closeable:true,autoCloseDelay:3000,closeOnOutsideClick:true,placement:"top"})}
    return cv.c("mdui-card",{onClick:onClick||coming_soon,style:"box-sizing:border-box;width:calc(50% - 10px);padding:10px;margin:5px;height:90px",clickable:"clickable"},
      cv.c("ion-icon",{style:"font-size:32px;",attr:{name:icon}}),
      cv.c("span",{style:"position:absolute;bottom:10px;left:10px;"},title)
    )
  }
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container"},
      cv.c("div",{className:"mdui-container"},
      cv.c("h1",null,"自定义项目"),
      cv.c("p",null,"选择你需要自定义的项目，定制完成后，点击下方的下载按钮下载压缩包"),
      cv.c("div",{style:"display:flex;flex-wrap: wrap;"},
        cv.c(card,{icon:"musical-notes",title:"音乐",onClick:toMusic}),
        cv.c(card,{icon:"image",title:"背景"}),
        cv.c(card,{icon:"cog",title:"设置",onClick:toVariables}),
        cv.c(card,{icon:"brush",title:"主题"})
      )),
    ),
    cv.c(bottomBtn,{leftFn:quitBtn,rightFn:downloadBtn,leftText:"退出",rightText:"下载"})
  )
}

// variables
function variablesScreen(){
  const [searchText,setSearchText]=useState("")
  var hasOption=item=>typeof item==="object"&&item!==null&&(item.hasOwnProperty('name')&&item.name.toLowerCase().includes(searchText.toLowerCase()))||(item.hasOwnProperty("desc")&&item.desc.toLowerCase().includes(searchText.toLowerCase())),
  isEmptyResult=searchText.trim()!==""&&!varObj.some(item=>item.content.some(hasOption))
  function parseNumber(e,varItem){return Math.max(Number.parseFloat(e.target.value.slice(e.target.value.startsWith("item")?4:0)||varItem.def||0),0)}
  function partition({data}){
    function changeEvent(e){
      const varItem=data.content.find(item=>item.id===e.target.id);
      if(varItem.type==="size"){
        let value=e.target.value==="default"?"default":parseNumber(e,varItem),xDef=varItem.def[0],yDef=varItem.def[1]
        varItem.current=[e.target.axis==="x"?Number.isNaN(value)?xDef:value:xDef,e.target.axis==="y"?Number.isNaN(value)?yDef:value:yDef]
        return
      }
      varItem.current=varItem.type==null||varItem.type==="switch"?e.target.checked:
      typeof varItem.def==="number"?parseNumber(e,varItem):e.target.value
      if(varItem.round===!0)varItem.current=Math.round(varItem.current)
      if(varItem.type==="textField"&&typeof varItem.def==="number"){
        let textFieldExpression=varItem.round?/^\d+$/:/^\d+(\.\d+)?$/
        e.target.helper=textFieldExpression.test(e.target.value)?"":varItem.round?`不能是浮点数，使用${Math.round(parseNumber(e,varItem))}代替`:`类型错误，使用${varItem.def}代替`
      }
    }
    var hasResult=searchText.trim()===""||data.content.some(hasOption)
    return hasResult&&cv.c(searchText.trim()===""?"mdui-collapse-item":"div",null,
      cv.c("mdui-list-item",{slot:"header",rounded:true},cv.c("b",null,data.title)),
      cv.c("mdui-list",null,
        data.content.map(function(e){
          if(!e)return searchText.trim()===""&&cv.c("mdui-divider");
          return (searchText.trim()===""||e.name.toLowerCase().includes(searchText.toLowerCase())||e.hasOwnProperty("desc")&&e.desc.toLowerCase().includes(searchText.toLowerCase()))&&cv.c("mdui-list-item",{rounded:true,description:e.desc||""},e.name,
            e.type==="textField"?cv.c("mdui-text-field",{slot:"end-icon",value:e.current==null?e.def||"":e.current,id:e.id,onChange:changeEvent,style:"width:120px;",inputmode:typeof e.def==="number"?"decimal":"text",placeholder:(e.def||"").toString()}):
            e.type==="dropdown"?cv.c("mdui-select",{slot:"end-icon",value:e.current==null?'item'+(e.def||0):e.current,id:e.id,onChange:changeEvent,style:"width:120px;line-height:normal;"},
              e.items.map((item,i)=>{
                return cv.c("mdui-menu-item",{value:'item'+i},item)
            })):
            e.type==="size"?cv.c("div",{slot:"end-icon",style:"display:inline-block;"},cv.c("mdui-text-field",{inputmode:"decimal",label:"X轴 | px",axis:"x",id:e.id,value:(e.current&&e.current[0])||e.def[0],placeholder:e.def[0],style:"width:80px;",onChange:changeEvent}),cv.c("span",null," "),cv.c("mdui-text-field",{inputmode:"decimal",label:"Y轴 | px",axis:"y",id:e.id,value:(e.current&&e.current[1])||e.def[1],placeholder:e.def[1],style:"width:80px;",onChange:changeEvent})):
            cv.c("mdui-switch",{slot:"end-icon",checked:e.current==null?e.def||false:e.current,id:e.id,onChange:changeEvent},cv.c("div",{slot:"checked-icon"}))
        )})
      )
    )
  }
  function deployment(){
    let globalVariablesFile=fileRead("ui/_global_variables.json"),
    globalVariablesJSON=JSON.parse(globalVariablesFile.content),
    tempVar={};
    globalVariablesJSON=Object.keys(globalVariablesJSON).reduce((acc,key)=>{
      if(!key.startsWith("$cube_set_")&&!key.startsWith("$cube_dev_"))acc[key]=globalVariablesJSON[key];
      return acc
    },{})
    varObj.forEach(item=>{
      item.content.forEach(e=>{
        if(e.current==null||arraysEqual(e.current,e.def))return;
        if(!e.def&&e.current===false)return;
        tempVar[(item.prefix||"$cube_set_")+e.id]=e.current
      })
    })
    globalVariablesJSON=mergeObjects(globalVariablesJSON,tempVar)
    globalVariablesFile.content=JSON.stringify(globalVariablesJSON)
  }
  function search(e){
    throttle(function(){
      setSearchText(e.target.value)
    },5000)()
  }
  function save(){deployment();cv.skipRouter("/item")}
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container"},
      cv.c("div",{className:"mdui-container",style:"height:calc(100vh - 11.5rem);overflow-y:auto;border-radius:var(--mdui-shape-corner-medium)"},
      cv.c("h1",null,"设置"),
      cv.c("div",{style:"margin:0 0 5px 0;position:sticky;top:0;z-index:10"},cv.c("mdui-text-field",{label:"搜索选项",clearable:!0,onInput:search})),
      cv.c("div",{style:"background:rgba(var(--mdui-color-primary-dark), 0.2);border-radius:var(--mdui-shape-corner-medium);padding:0 5px;"},cv.c("mdui-list",null,cv.c("mdui-collapse",{ref:collapse,accordion:!0},
        varObj.map(d=>cv.c(partition,{data:d})),
        isEmptyResult&&cv.c("b",{style:'display:flex;justify-content:center;width:100%'},"空空如也")
      )))
    )),
    cv.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%;z-index:1000"},
      cv.c("mdui-button",{onClick:save,style:"margin-bottom:5px;box-sizing:border-box;width:calc(100% - 16px)",variant:"filled"},"保存")
    )
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
  var save=function(){cv.skipRouter("/item")}
  var allowDrop=function(a){a.preventDefault()},handleClickOrDrop=function(a,b){a.preventDefault();var c,d=b.current;if('drop'===a.type)c=a.dataTransfer.files,d.files=c;else if('click'===a.type)return void d.click()};
  var leftBtn=cv.c("mdui-button",{onClick:e=>handleClickOrDrop(e,uploadFile),ondrop:e=>handleClickOrDrop(e,uploadFile),ondragover:allowDrop,style:"width:50%;margin-bottom:5px;margin-right:5px;box-sizing:border-box;width:calc(50% - 10px);",variant:"outlined"},"上传");
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container"},
      cv.c("h1",null,"背景"),
      cv.c("p",null,"你可以点击上传按钮上传视频，点击保存按钮后即可制作动态背景"),
      cv.c("input",{attr:{type:"file"},onChange:videoHandle,ref:uploadFile,style:"display:none"}),
      cv.c("video",{attr:{controls:"controls"},ref:video,style:"margin-top:5px;width:100%"})
    ),
    cv.c(bottomBtn,{leftBtn:leftBtn,rightFn:save,leftText:"上传",rightText:"保存"})
  )
}

// music
function musicScreen(){
  var musicName=useRef(),musicAuthor=useRef(),addBtn=useRef(),dialog=useRef(),musicFile=useRef(),coverFile=useRef();
  var close=()=>{dialog.current.open=false},coverChange=function(e){coverFile.name=e.target.files[0].name},musicChange=function(a){var b=a.target.files[0];if(b){var c=b.name.split(".").pop();return"ogg"===c?void(""===musicName.current.inputRef.value.value&&musicName.current.setRangeText(b.name.substring(0,b.name.lastIndexOf("."))),addBtn.current.disabled=!1):mdui.snackbar({message:"\u8BE5\u683C\u5F0F\u7684\u6587\u4EF6\u4E0D\u652F\u6301\uFF0C\u8BF7\u4E0A\u4F20 .ogg \u6587\u4EF6",closeable:!0,autoCloseDelay:3e3,closeOnOutsideClick:!0,placement:"top"})}};
  var allowDrop=function(a){a.preventDefault()},handleClickOrDrop=function(a,b){a.preventDefault();var c,d=b.current;if('drop'===a.type)c=a.dataTransfer.files,d.files=c;else if('click'===a.type)return void d.click()};

  var setting = findFileByName(fileStructure,"_setting.json");
  if(setting.content===null)setting.content=`{"customAlbum@cn80b37451.f":{"$listContent":[]}}`;
  var setJson = JSON.parse(setting.content)
  var soundsDef = findFileByName(fileStructure,"sound_definitions.json");
  if(soundsDef.content===null)soundsDef.content=`{"cv.music.custom":{"category":"ui","sounds":[]}}`;
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
      soundsDefJson["cv.music.custom"].sounds.push({name:oggPath.slice(0,oggPath.lastIndexOf(".")),load_on_low_memory:true,volume:0.5})
      soundsDef.content=JSON.stringify(soundsDefJson)
      audio.src=URL.createObjectURL(blob);
      audio.addEventListener('loadedmetadata',function(){
        const duration=audio.duration,
        musicData={[item.length+"@cn80b37451.m"]:{"$music_name":name,"$music_author":author,"$music_id":oggID,"$music_cover":coverPath,"$music_minute":Math.floor(duration / 60),"$music_second":Math.floor(duration % 60)}};
        setJson["customAlbum@cn80b37451.f"]["$listContent"].push(musicData)
        setting.content=JSON.stringify(setJson)
        musicFile.current.value="",coverFile.current.value="",addBtn.current.disabled=!0;
        dialog.current.open=false
        cv.forceUpdate()
      })
    };
    fileReader.readAsArrayBuffer(musicFile.current.files[0]);
  };
  var deleteMusic=i=>{
    var firstKeys=Object.keys(item[i]),musicID=item[i][firstKeys]["$music_id"],coverPath=item[i][firstKeys]["$music_cover"],soundsDef=fileRead("sounds/sound_definitions.json"),soundsDefJson=JSON.parse(soundsDef.content),oggPath=soundsDefJson[musicID]["sounds"][0]["name"]+".ogg";item.splice(i,1),
    coverPath!==''&&deleteFile("textures",coverPath.slice(coverPath.lastIndexOf('/')+1)),deleteFile("sounds",oggPath.slice(oggPath.lastIndexOf('/')+1)),setting.content=JSON.stringify(setJson),soundsDefJson["cv.music.custom"].sounds.splice(i,1),delete soundsDefJson[musicID],soundsDef.content=JSON.stringify(soundsDefJson),cv.forceUpdate()
  }
  var save = function(){cv.skipRouter("/item")}
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container"},
      cv.c("mdui-list",{className:"mdui-container"},
        item.map((i,index)=>{
          var firstKey=Object.keys(i),musicObj=i[firstKey[0]];
          return cv.c("mdui-list-item",{rounded:"rounded"},musicObj["$music_name"],
            cv.c("span",{slot:"description"},musicObj["$music_author"]),
            cv.c("mdui-dropdown",{slot:"end-icon",style:"line-height:normal;"},
              cv.c("mdui-button-icon",{slot:"trigger"},cv.c("ion-icon",{attr:{name:"ellipsis-vertical"}})),
              cv.c("mdui-menu",null,cv.c("mdui-menu-item",{onClick:()=>deleteMusic(index)},"删除"))
            ))
        })),
      item.length===0&&cv.c("div",{style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
        cv.c("div",{style:{fontSize:"32px"}},"列表是空的"),
        cv.c("div",{style:{fontSize:"14px",marginTop:"4px"}},"点击左下角按钮添加音乐～")
    )),
    cv.c(bottomBtn,{leftFn:newBtn,rightFn:save,leftText:"添加",rightText:"保存"}),
    cv.c("mdui-dialog",{ref:dialog,attr:{"close-on-overlay-click":"close-on-overlay-click","close-on-esc":"close-on-esc"}},
      cv.c("span",{slot:"headline"},"添加音乐"),
      cv.c("mdui-text-field",{maxlength:32,ref:musicName,counter:"counter",label:"音乐名称"}),
      cv.c("mdui-text-field",{maxlength:32,ref:musicAuthor,counter:"counter",label:"音乐作者"}),
      cv.c("mdui-segmented-button-group",{attr:{"full-width":"full-width"}},
        cv.c("mdui-segmented-button",{ondrop:e=>handleClickOrDrop(e,coverFile),onClick:e=>handleClickOrDrop(e,coverFile),ondragover:allowDrop},"封面"),
        cv.c("mdui-segmented-button",{ondrop:e=>handleClickOrDrop(e,musicFile),onClick:e=>handleClickOrDrop(e,musicFile),ondragover:allowDrop},"文件")),
      cv.c("input",{attr:{type:"file",accept:"audio/*"},ref:musicFile,onChange:musicChange,style:"display:none"}),
      cv.c("input",{attr:{type:"file",accept:"image/*"},ref:coverFile,onChange:coverChange,style:"display:none"}),
      cv.c("mdui-button",{slot:"action",variant:"text",onClick:close},"取消"),
      cv.c("mdui-button",{slot:"action",variant:"filled",onClick:addMusic,ref:addBtn,disabled:"disabled"},"添加")
    )
  )
}

function home(){
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      cv.c("div",{style:{fontSize:"32px"}},"敬请期待"),
      cv.c("div",{style:{fontSize:"15px",marginTop:"4px"}},"该网站正在完善中…")
    )
  )
}
function errorScreen(){
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      cv.c("div",{style:{fontSize:"32px"}},"404"),
      cv.c("div",{style:{fontSize:"15px",marginTop:"4px"}},"该页面不存在"),
      cv.c("mdui-button",{href:"/",style:{marginTop:"8px"}},"返回首页")
    )
  )
}
function App(){
  return cv.c(cv.fragment,null,cv.c(topBar),cv.c(cv.BrowserRouter,{errorComponent:errorScreen},
    cv.c(cv.router,{path:"/",component:home}),
    cv.c(cv.router,{path:"/nav",component:navScreen}),
    cv.c(cv.router,{path:"/item",component:itemScreen}),
    cv.c(cv.router,{path:"/music",component:musicScreen}),
    cv.c(cv.router,{path:"/variables",component:variablesScreen}),
    cv.c(cv.router,{path:"/bg",component:bgScreen}),
  ));
}
if(window.location.href.startsWith("https://wisebreeze.github.io")){cv.setInitialPath("/cv")}
document.addEventListener("DOMContentLoaded",function(){
  const container = document.getElementById("app")
  cv.root(App,container)
});
})()