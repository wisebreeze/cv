(function(){
mdui.setColorScheme("#778BFF");
var data=localStorage.getItem('themeType');
typeof data == "string"&&mdui.setTheme(data);
var saveAs=saveAs||"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(a){if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f=!a.externalHost&&"download"in e,g=a.webkitRequestFileSystem,h=a.requestFileSystem||g||a.mozRequestFileSystem,i=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},j="application/octet-stream",k=0,l=[],m=function(){for(var a,b=l.length;b--;)a=l[b],"string"==typeof a?d.revokeObjectURL(a):a.remove();l.length=0},n=function(a,b,c){var d,e;for(b=[].concat(b),d=b.length;d--;)if(e=a["on"+b[d]],"function"==typeof e)try{e.call(a,c||a)}catch(f){i(f)}},o=function(d,i){var m,o,p,q,r=this,s=d.type,t=!1,u=function(){var a=c().createObjectURL(d);return l.push(a),a},v=function(){n(r,"writestart progress write writeend".split(" "))},w=function(){(t||!m)&&(m=u(d)),o?o.location.href=m:window.open(m,"_blank"),r.readyState=r.DONE,v()},x=function(a){return function(){return r.readyState!==r.DONE?a.apply(this,arguments):void 0}},y={create:!0,exclusive:!1};return r.readyState=r.INIT,i||(i="download"),f?(m=u(d),b=a.document,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),e.href=m,e.download=i,q=b.createEvent("MouseEvents"),q.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(q),r.readyState=r.DONE,v(),void 0):(a.chrome&&s&&s!==j&&(p=d.slice||d.webkitSlice,d=p.call(d,0,d.size,j),t=!0),g&&"download"!==i&&(i+=".download"),(s===j||g)&&(o=a),h?(k+=d.size,h(a.TEMPORARY,k,x(function(a){a.root.getDirectory("saved",y,x(function(a){var b=function(){a.getFile(i,y,x(function(a){a.createWriter(x(function(b){b.onwriteend=function(b){o.location.href=a.toURL(),l.push(a),r.readyState=r.DONE,n(r,"writeend",b)},b.onerror=function(){var a=b.error;a.code!==a.ABORT_ERR&&w()},"writestart progress write abort".split(" ").forEach(function(a){b["on"+a]=r["on"+a]}),b.write(d),r.abort=function(){b.abort(),r.readyState=r.DONE},r.readyState=r.WRITING}),w)}),w)};a.getFile(i,{create:!1},x(function(a){a.remove(),b()}),x(function(a){a.code===a.NOT_FOUND_ERR?b():w()}))}),w)}),w),void 0):(w(),void 0))},p=o.prototype,q=function(a,b){return new o(a,b)};return p.abort=function(){var a=this;a.readyState=a.DONE,n(a,"abort")},p.readyState=p.INIT=0,p.WRITING=1,p.DONE=2,p.error=p.onwritestart=p.onprogress=p.onwrite=p.onabort=p.onerror=p.onwriteend=null,a.addEventListener("unload",m,!1),q.unload=function(){m(),a.removeEventListener("unload",m,!1)},q}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);
var {T,useState,useEffect,useRef}=cv

var language={
  "en-us":{
    gui$packName:"CubeVisage",gui$light:"Light",gui$dark:"Dark",gui$system:"System",e$title:"The page does not exist",e$back:"Home",gui$coming:"coming soon",gui$comingDesc:"The site is being improved...",gui$cancel:"Cancel",gui$save:"Save",gui$download:"Download",gui$exit:"Exit",gui$confirm:"Confirm",gui$new:"New",gui$next:"Next",gui$continue:"Continue",gui$upload:"Upload",gui$reset:"Reset",gui$add:"Add",gui$edit:"Edit",gui$remove:"Remove",gui$know:"Understand",custom$title:"Custom",custom$desc:"Customizing CubeVisage",custom$new$title:"Resource package information",custom$new$name:"Name",custom$new$desc:"Description",custom$items$desc:"Select the project you want to customize. After the customization is complete, click the Download button below to download the package",custom$download$desc:"After the download is complete, some browsers need to be compressed.The mcpack.zip suffix is changed to.mcpack，Open later with Minecraft",custom$exit$title:"Are you sure you want to quit?",custom$exit$desc:"Data for custom actions will be reset after page refresh",setting$title:"Setting",setting$search:"Search options",setting$empty:"Empty",theme$title:"Theme",music$title:"Music",music$empty$title:"List is empty",music$empty$desc:"Click on the lower left corner button to add music ~",music$add:"Add music",music$name:"Music name",music$author:"Music author",music$cover:"Cover",music$file:"File",music$nameEmpty:"Music name cannot be empty.",music$deleteDesc:"Are you sure you want to remove this music from the list? This operation cannot be undone!",music$oggTip:"This file format is not supported. Please upload a .ogg file",music$longPress:"Long press",bg$title:"Background",bg$live:"Dynamic background",bg$resetStatic:"Reset static background",bg$resetLive:"Reset dynamic background",bg$resetStaticDialog:"Are you sure you want to reset the static background data?",bg$resetLiveDialog:"Are you sure you want to reset dynamic background related data?",bg$info:"Basic information",bg$interval:"How many milliseconds does it take? [integer]",bg$duration:"Duration of each wallpaper [float]",bg$blur:"Blur engine",bg$blur$1:"Faster and average effect",bg$blur$2:"Slow (not compatible Safari)",bg$blur$3:"Slow",bg$progress:"In the production",bg$progress$extract:"Extracting each frame of picture",bg$progress$load:"Loading pictures",bg$progress$blur:"Processing blur now",bg$progress$def:"Processing normal background",bg$progress$write:"Writing to file",bg$longVideo:"The video is longer than 30 seconds, and you cannot create live wallpapers",bg$invalid:"Please upload a valid picture or video",
   },
  "zh-cn":{
    gui$packName:"立方之窗",gui$light:"浅色",gui$dark:"深色",gui$system:"跟随系统",e$title:"该页面不存在",e$back:"返回首页",gui$coming:"敬请期待",gui$comingDesc:"该网站正在完善中…",gui$cancel:"取消",gui$save:"保存",gui$download:"下载",gui$exit:"退出",gui$confirm:"确定",gui$new:"新建",gui$next:"下一步",gui$continue:"继续",gui$upload:"上传",gui$reset:"重置",gui$add:"添加",gui$edit:"编辑",gui$remove:"移除",gui$know:"知道了",custom$title:"自定义",custom$desc:"轻松定制立方之窗",custom$new$title:"资源包信息",custom$new$name:"名称",custom$new$desc:"描述",custom$items$desc:"选择你需要自定义的项目，定制完成后，点击下方的下载按钮下载压缩包",custom$download$desc:"下载完成后，部分浏览器需要将压缩包的.mcpack.zip后缀后缀改为.mcpack，之后使用 Minecraft 打开",custom$exit$title:"你确定要退出吗？",custom$exit$desc:"刷新网页后，自定义操作的数据将会重置",setting$title:"设置",setting$search:"搜索选项",setting$empty:"空空如也",theme$title:"主题",music$title:"音乐",music$empty$title:"列表是空的",music$empty$desc:"点击左下角按钮添加音乐～",music$add:"添加音乐",music$name:"音乐名称",music$author:"音乐作者",music$cover:"封面",music$file:"文件",music$nameEmpty:"音乐名称不能为空！",music$deleteDesc:"您确定要将该音乐从列表中移除吗？该操作不可撤销！",music$oggTip:"该格式的文件不支持，请上传 .ogg 文件",music$longPress:"长按展开",bg$title:"背景",bg$live:"动态背景",bg$resetStatic:"重置静态背景",bg$resetLive:"重置动态背景",bg$resetStaticDialog:"您确定重置静态背景相关数据吗？",bg$resetLiveDialog:"您确定重置动态背景相关数据吗？",bg$info:"基本信息",bg$interval:"每隔多少毫秒截图 (单位: 毫秒) [整数]",bg$duration:"每张壁纸停留时长 (单位: 秒) [浮点数]",bg$blur:"模糊引擎",bg$blur$1:"速度较快, 效果一般",bg$blur$2:"速度慢 (不兼容 Safari)",bg$blur$3:"速度慢",bg$progress:"制作中",bg$progress$extract:"提取每帧图片中",bg$progress$load:"正在加载图片中",bg$progress$blur:"正在处理模糊中",bg$progress$def:"正在处理普通背景",bg$progress$write:"写入文件中",bg$longVideo:"视频时长大于30秒，无法制作动态壁纸",bg$invalid:"请上传有效的图片或视频",
  }
},
fileStructure=[
  {
    type: 'folder',
    name: 'assets',
    children:[{type:'folder',name:'cube',children:[{type:'file',name:'frame.ui',content:null}]}]
  },
  {
    type: 'folder',
    name: 'sounds',
    children: [{type:'file',name:'sound_definitions.json',content:null}]
  },
  {
    type: 'folder',
    name: 'ui',
    children: [
      {type:'file',name:'_setting.json',content:null},
      {type:'file',name:'_global_variables.json',content:`{"$cube_custom_boolean":true,"$cube_custom_from_website":true}`}
    ]
  },
  {type:'folder',name:'textures',children:[{type:'folder',name:'cube',children:[
    {type:'folder',name:'frame',children:[]},
    {type:'folder',name:'frameBlur',children:[]},
    {type:'folder',name:'bg',children:[]}
  ]}]},
  {type:'file',name:'manifest.json',content:'{"format_version":2,"header":{"description":"","name":"未设置名称","uuid":"","version":[1,0,0],"min_engine_version":[1,13,0]},"modules":[{"type":"resources","uuid":"","version":[1,0,0]}]}'},
  {type:'file',name:'pack_icon.png',content:null}
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
  {name:"选择数量",id:"ded3a8c5",def:!0},
  {name:"纸娃娃",id:"50eee1e4",def:!0},0,
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
  {name:"指针位置",id:"pointer"},
  {name:"聊天",id:"chat"},0,
  {name:"环境沙盒",id:"c923cef2"},
  {name:"屏幕大小",id:"5523405d",def:["default","default"],type:"size"},
  {name:"开发者",id:"9b52c609",def:!0},
  {name:"中国版",id:"b53ba732"},
  {name:"键盘＆鼠标",id:"decdc2ac",def:!0},
  {name:"触屏",id:"cf295d3c"},
  {name:"游戏手柄",id:"950d0911"}
]}],bgData={live:false,src:null,img:null,showLive:true},MusicArr=[];
let projectName="",projectDesc="";cv.setLocalizationData(language);
var urlObj = new URL(window.location.href);cv.setLocale(localStorage.getItem('language')||urlObj.searchParams.get("lang")||"zh-cn");
function arraysEqual(arr1,arr2){if(!Array.isArray(arr1)&&!Array.isArray(arr2))return arr1===arr2;if(arr1.length!==arr2.length)return false;return arr1.every((v,i)=>v===arr2[i])}
function mergeObjects(){return Array.from(arguments).reduce((target,source)=>(Object.keys(source).forEach(key=>target[key]=source[key]),target),{})}
function deleteEmpty(e){for(var t=e.length-1;t>=0;t--){var l=e[t];"folder"===l.type?(deleteEmpty(l.children),0===l.children.length&&e.splice(t,1)):"file"!==l.type||l.content&&""!==l.content||e.splice(t,1)}}
function deleteFile(r,e){var t=r.split("/"),n=fileStructure,i=!0,f=!1,o=void 0;try{for(var l,u=t[Symbol.iterator]();!(i=(l=u.next()).done);i=!0)!function(){var r=l.value,e=n.find(function(e){return"folder"===e.type&&e.name===r});if(!e)throw new Error("the path does not exist");n=e.children}()}catch(r){f=!0,o=r}finally{try{!i&&u.return&&u.return()}finally{if(f)throw o}}var a=n.findIndex(function(r){return"file"===r.type&&r.name===e});if(-1===a)throw new Error("the file does not exist");n.splice(a,1)}
function fileRead(n){for(var r=n.split("/"),t=fileStructure,e=0;e<r.length;e++)!function(e){var i=r[e];if(!i)return"continue";var o=t.find(function(n){return n.name===i});if(!o)throw new Error("Path "+n+" not found");if(!(t=o.children||o))throw new Error("Path "+n+" not found")}(e);if(null!==t.content||null!==t.children)return t;throw new Error("Invalid path "+n)}
function findFileByName(a,b){var c=!0,d=!1,e=void 0;try{for(var g,h,f=a[Symbol.iterator]();!(c=(g=f.next()).done);c=!0){if(h=g.value,h.name===b)return h;if('folder'===h.type){var i=findFileByName(h.children,b);if(i)return i}}}catch(h){d=!0,e=h}finally{try{!c&&f.return&&f.return()}finally{if(d)throw e}}return null}
function addFileToFolder(a,b,c,d){var f,g,i,j,k,l,m,n,e=a.split("/");for(d||(d=fileStructure),f=0;f<d.length;f++)if(g=d[f],"folder"===g.type&&g.name===e[0]){if(g.children||(g.children=[]),1===e.length){for(i=b.substring(0,b.lastIndexOf(".")),j=b.substring(b.lastIndexOf(".")),k=g.children.filter(function(a){return"file"===a.type}).map(function(a){return a.name}),l=1;k.includes(b);)b=i+"_"+l+j,l++;return g.children.push({type:"file",name:b,content:c}),b}if(m=e.slice(1).join("/"),n=addFileToFolder(m,b,c,g.children))return n}return console.error('Unable to find folder at path "'+a+'"'),null}
function addFilesToZip(folder,zip){folder.forEach(item=>{if(item.type==='file'){zip.file(item.name,item.content);}else if(item.type==='folder'){const newFolder=zip.folder(item.name);addFilesToZip(item.children,newFolder);}});}
function downloadZip(a){const b=new JSZip;addFilesToZip(a,b),b.generateAsync({type:"blob"}).then(function(a){saveAs(a,(projectName||"立方之窗_自定义包")+".mcpack")})}
function fetchImage(url,callback){fetch(url).then(response=>response.blob()).then(blob=>{const icon=fileStructure.find(item=>item.name==='pack_icon.png');if(icon)icon.content=blob;if(typeof callback==='function')callback(blob);}).catch(error=>console.error('Fetching image failed:',error));}
function get_uuid(){var a=(new Date).getTime();return window.performance&&"function"==typeof window.performance.now&&(a+=performance.now()),"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(b){var c=0|(a+16*Math.random())%16;return a=Math.floor(a/16),("x"==b?c:8|3&c).toString(16)})}
function debounce(func,delay){let timerId;return function(){const context=this;const args=arguments;clearTimeout(timerId);timerId=setTimeout(function(){func.apply(context,args);},delay)}}
function throttle(func,interval){let lastTime=0;return function(...args){const now=Date.now();if(now-lastTime>=interval){lastTime=now;func.apply(this,args)}}}

function setVariables(obj){var globalVariablesFile=fileRead("ui/_global_variables.json"),globalVariablesJSON=JSON.parse(globalVariablesFile.content);Object.assign(globalVariablesJSON,obj);globalVariablesFile.content=JSON.stringify(globalVariablesJSON)}
function removeVariables(str){var globalVariablesFile=fileRead("ui/_global_variables.json"),globalVariablesJSON=JSON.parse(globalVariablesFile.content),propArr=str.split(",").map(prop=>prop.trim());globalVariablesJSON=Object.keys(globalVariablesJSON).filter(key=>!propArr.includes(key)).reduce((obj,key)=>{obj[key]=globalVariablesJSON[key];return obj},{});globalVariablesFile.content=JSON.stringify(globalVariablesJSON)}

function topBar({title}){
  const [language,setLanguage]=useState(localStorage.getItem('language')||urlObj.searchParams.get("lang")||"zh-cn");
  const [theme,setTheme]=useState(localStorage.getItem('themeType'));
  return cv.c("div",{className:"ns",style:"position: relative;overflow: hidden"},
    cv.c("mdui-top-app-bar",{"scroll-behavior":"elevate","scroll-target":"#content"},
      cv.c("mdui-top-app-bar-title",{style:"margin-left:8px"},cv.c("a",{href:"/",style:"color: inherit; text-decoration: none;"},title||T("gui$packName"))),
      cv.c("div",{style:"flex-grow: 1"}),
      cv.c("mdui-dropdown",null,
        cv.c("mdui-button-icon",{slot:"trigger"},cv.c("ion-icon",{attr:{name:"language-outline"}})),
        cv.c("mdui-menu",{selects:"single",value:language||"zh-cn"},
          cv.c("mdui-menu-item",{onClick:()=>{setLanguage("en-us");cv.setLocale('en-us');localStorage.setItem('language',"en-us");},value:"en-us"},"English"),
          cv.c("mdui-menu-item",{onClick:()=>{setLanguage("zh-cn");cv.setLocale('zh-cn');localStorage.setItem('language',"zh-cn");},value:"zh-cn"},"简体中文")
        )
      ),
      cv.c("mdui-dropdown",null,
        cv.c("mdui-button-icon",{slot:"trigger"},cv.c("ion-icon",{attr:{name:theme==="dark"?"moon-outline":"sunny-outline"}})),
        cv.c("mdui-menu",{selects:"single",value:theme||"auto"},
          cv.c("mdui-menu-item",{onClick:()=>{setTheme("light");mdui.setTheme('light');localStorage.setItem('themeType',"light");},value:"light"},T("gui$light")),
          cv.c("mdui-menu-item",{onClick:()=>{setTheme("dark");mdui.setTheme('dark');localStorage.setItem('themeType',"dark");},value:"dark"},T("gui$dark")),
          cv.c("mdui-divider"),
          cv.c("mdui-menu-item",{onClick:()=>{setTheme("auto");mdui.setTheme('auto'),localStorage.setItem('themeType',"auto");},value:"auto"},T("gui$system"))
        )
      )
    )
  )
}

// custom
function customScreen(){
  const dialog=useRef();
  const nextBtn=useRef();
  const nameInput=useRef();
  const customBtn=function(){
    dialog.current.open=true;
    setTimeout(()=>{document.body.style.width="auto"},1)
  }
  const closeBtn=function(){dialog.current.open=false}
  const checkInput=function(e){projectName=e.target.inputRef.value.value;e.target.inputRef.value.value.trim().length>0?nextBtn.current.removeAttribute("disabled"):nextBtn.current.setAttribute("disabled","disabled")}
  const descInput=function(e){projectDesc=e.target.inputRef.value.value;}
  const next=function(){
    fetchImage("https://cv-erd.pages.dev/res/image/icon.png");
    let manifest=fileStructure.find(item=>item.name==='manifest.json'),
    manifestJSON=JSON.parse(manifest.content);
    manifestJSON.header.name=projectName;
    manifestJSON.header.description=projectDesc;
    manifest.content=JSON.stringify(manifestJSON);
    let globalVariablesFile=fileRead("ui/_global_variables.json"),
    globalVariablesJSON=JSON.parse(globalVariablesFile.content)
    globalVariablesJSON["$cube_custom_name"]=projectName;globalVariablesJSON["$cube_custom_desc"]=projectDesc;globalVariablesJSON["$cube_custom_uuid"]=manifestJSON.header.uuid;globalVariablesJSON["$cube_custom_version"]=0;globalVariablesJSON["$cube_custom_target_api"]=4000
    globalVariablesFile.content=JSON.stringify(globalVariablesJSON)
    cv.skipRouter("/item");
  }
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container",style:"margin:8px"},
      cv.c("div",{className:"mdui-container"},
      cv.c("h1",null,T("custom$title")),
      cv.c("p",null,T("custom$desc"))),
      cv.c("div",null,
        cv.c("mdui-button",{style:"width:100%;",onClick:customBtn},T("gui$new"))
      ),
      cv.c("mdui-dialog",{ref:dialog,attr:{"close-on-overlay-click":"close-on-overlay-click","close-on-esc":"close-on-esc"}},
        cv.c("span",{slot:"headline"},T("custom$new$title")),
        cv.c("mdui-text-field",{maxlength:32,ref:nameInput,onInput:checkInput,counter:"counter",label:T("custom$new$name")}),
        cv.c("mdui-text-field",{attr:{"max-rows":5},onInput:descInput,autosize:"autosize",maxlength:150,counter:"counter",label:T("custom$new$desc")}),
        cv.c("mdui-button",{slot:"action",variant:"text",onClick:closeBtn},T("gui$cancel")),
        cv.c("mdui-button",{slot:"action",variant:"filled",ref:nextBtn,onClick:next,disabled:"disabled"},T("gui$next"))
      )
    )
  )
}

// item
function bottomBtn({leftFn,rightFn,leftText,rightText,leftBtn}){
  return cv.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%;padding:4px;background:rgba(var(--mdui-color-background-light),0.25)"},
    leftBtn?leftBtn:cv.c("mdui-button",{onClick:leftFn,style:"margin-right:8px;box-sizing:border-box;width:calc(50% - 8px);",variant:"outlined"},leftText),
    cv.c("mdui-button",{onClick:rightFn,style:"width:50%;box-sizing:border-box;width:calc(50% - 8px)",variant:"filled"},rightText)
  )
}
function itemScreen(){
  const confirmExit=function(e){
    e.returnValue="你确定要退出表单提交吗？";
    return "你确定要退出表单提交吗？";
  }
  window.addEventListener('beforeunload',confirmExit);
  const quitBtn=function(){
    mdui.dialog({
      headline:T("custom$exit$title"),
      description:T("custom$exit$desc"),
      closeOnEsc:true,closeOnOverlayClick:true,
      actions:[
        {text:T("gui$cancel")},
        {text:T("gui$exit"),onClick:function(){window.removeEventListener('beforeunload',confirmExit);cv.skipRouter("/custom")}}
      ]
    })
  }
  const downloadBtn=function(){
    mdui.dialog({
      headline:T("gui$download"),
      description:T("custom$download$desc"),
      closeOnEsc:true,closeOnOverlayClick:true,
      actions:[
        {text:T("gui$cancel")},
        {text:T("gui$confirm"),onClick:function(){var manifestFile=fileRead("manifest.json"),manifestJSON=JSON.parse(manifestFile.content);manifestJSON.header.uuid=get_uuid();manifestJSON.modules[0].uuid=get_uuid();manifestFile.content=JSON.stringify(manifestJSON);window.removeEventListener('beforeunload',confirmExit);deleteEmpty(fileStructure);downloadZip(fileStructure)}}
      ]
    })
  }
  function toMusic(){cv.skipRouter("/music")}
  function toVariables(){cv.skipRouter("/variables")}
  function toBg(){cv.skipRouter("/bg")}
  function card({icon,title,onClick}){
    const coming_soon=function(){mdui.snackbar({message:T("gui$coming"),closeable:true,autoCloseDelay:3000,closeOnOutsideClick:true,placement:"top"})}
    return cv.c("mdui-card",{onClick:onClick||coming_soon,style:"box-sizing:border-box;width:calc(50% - 10px);padding:10px;margin:5px;height:90px",clickable:"clickable"},
      cv.c("ion-icon",{style:"font-size:32px;",attr:{name:icon}}),
      cv.c("span",{style:"position:absolute;bottom:10px;left:10px;"},title)
    )
  }
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns mdui-container",style:"margin:8px"},
      cv.c("div",{className:"mdui-container"},
      cv.c("h1",null,T("custom$title")),
      cv.c("p",null,T("custom$items$desc")),
      cv.c("div",{style:"display:flex;flex-wrap: wrap;"},
        cv.c(card,{icon:"musical-notes",title:T("music$title"),onClick:toMusic}),
        cv.c(card,{icon:"image",title:T("bg$title"),onClick:toBg}),
        cv.c(card,{icon:"cog",title:T("setting$title"),onClick:toVariables}),
        cv.c(card,{icon:"brush",title:T("theme$title")})
      )),
    ),
    cv.c(bottomBtn,{leftFn:quitBtn,rightFn:downloadBtn,leftText:T("gui$exit"),rightText:T("gui$download")})
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
      if(key==="$cube_set_0a57c067"||(!key.startsWith("$cube_set_")&&!key.startsWith("$cube_dev_")))acc[key]=globalVariablesJSON[key];
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
    cv.c("div",{id:"content",className:"ns mdui-container",style:"margin:8px"},
      cv.c("div",{className:"mdui-container",style:"height:calc(100vh - 11.5rem);overflow-y:auto;border-radius:var(--mdui-shape-corner-medium)"},
      cv.c("h1",null,T("setting$title")),
      cv.c("div",{style:"margin:0 0 5px 0;position:sticky;top:0;z-index:10"},cv.c("mdui-text-field",{label:T("setting$search"),clearable:!0,onInput:search})),
      cv.c("div",{style:"background:rgba(var(--mdui-color-primary-dark), 0.2);border-radius:var(--mdui-shape-corner-medium);padding:0 5px;"},cv.c("mdui-list",null,cv.c("mdui-collapse",{accordion:!0},
        varObj.map(d=>cv.c(partition,{data:d})),
        isEmptyResult&&cv.c("b",{style:'display:flex;justify-content:center;width:100%'},T("setting$empty"))
      )))
    )),
    cv.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%;z-index:1000;padding:4px"},
      cv.c("mdui-button",{onClick:save,style:"box-sizing:border-box;width:calc(100% - 8px)",variant:"filled"},T("gui$save"))
    )
  )
}

// bg
function gaussBlur(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;r*=3;var a,o,e,n,f,u,h,s,i,d,p,c=new Uint8ClampedArray(t.data),l=t.width,v=t.height,M=[];r=Math.floor(r);var g=r/3;for(h=1/(Math.sqrt(2*Math.PI)*g),u=-1/(2*g*g),s=-r;s<=r;s++)M.push(h*Math.exp(u*s*s));for(e=0;e<v;e++)for(o=0;o<l;o++){for(n=f=u=h=a=0,i=-r;i<=r;i++)(d=o+i)>=0&&d<l&&(s=4*(e*l+d),p=M[i+r],n+=c[s]*p,f+=c[s+1]*p,u+=c[s+2]*p,h+=c[s+3]*p,a+=p);s=4*(e*l+o),t.data.set([n,f,u,h].map(function(t){return t/a}),s)}for(c.set(t.data),o=0;o<l;o++)for(e=0;e<v;e++){for(n=f=u=h=a=0,i=-r;i<=r;i++)(d=e+i)>=0&&d<v&&(s=4*(d*l+o),p=M[i+r],n+=c[s]*p,f+=c[s+1]*p,u+=c[s+2]*p,h+=c[s+3]*p,a+=p);s=4*(e*l+o),t.data.set([n,f,u,h].map(function(t){return t/a}),s)}return t}
function gaussBlur2(r,t,o){var a,f,h,e,s,u,i,n,M,d,g=r.data,l=r.width,c=r.height,p=[],q=0;for(t=Math.floor(t)||3,o=o||t/3,u=1/(Math.sqrt(2*Math.PI)*o),s=-1/(2*o*o),i=0,a=-t;a<=t;a++,i++)e=u*Math.exp(s*a*a),p[i]=e,q+=e;for(i=0,d=p.length;i<d;i++)p[i]/=q;for(f=0;f<c;f++)for(a=0;a<l;a++){for(h=e=s=u=0,q=0,n=-t;n<=t;n++)(M=a+n)>=0&&M<l&&(i=4*(f*l+M),h+=g[i]*p[n+t],e+=g[i+1]*p[n+t],s+=g[i+2]*p[n+t],q+=p[n+t]);i=4*(f*l+a),g[i]=h/q,g[i+1]=e/q,g[i+2]=s/q}for(a=0;a<l;a++)for(f=0;f<c;f++){for(h=e=s=u=0,q=0,n=-t;n<=t;n++)(M=f+n)>=0&&M<c&&(i=4*(M*l+a),h+=g[i]*p[n+t],e+=g[i+1]*p[n+t],s+=g[i+2]*p[n+t],q+=p[n+t]);i=4*(f*l+a),g[i]=h/q,g[i+1]=e/q,g[i+2]=s/q}return r.data=g,r}
function bgScreen(){
  var uploadFile=useRef(),frameArr=[],video=useRef(),previewVideo=useRef(),img=useRef(),progress=useRef(),progressDialog=useRef(),infoDialog=useRef(),delayInput=useRef(),durationInput=useRef(),engineInput=useRef();
  var liveSwitch=useRef();
  var timer=null,delay=100,duration=0.1,frameIndex=0,engine="engine1";
  var cancelBtn=function(){delayInput.current.disabled=false;durationInput.current.disabled=false;progressDialog.current.open=false;infoDialog.current.open=false;var cloneUpload=document.createElement("input");cloneUpload.type="file";cloneUpload.accept="image/*, video/*";cloneUpload.style="display:none";cloneUpload.addEventListener("change",fileHandle);uploadFile.current.parentNode.replaceChild(cloneUpload,uploadFile.current);uploadFile.current=cloneUpload}
  var continueBtn=function(){
    delay=Math.max(20,Math.min(Number.parseInt(delayInput.current.value),60000))
    duration=Math.max(0,Math.min(Number.parseFloat(durationInput.current.value),10))
    engine=engineInput.current.value||"engine1"
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
          if(engine=="engine1")ctx.putImageData(gaussBlur2(ctx.getImageData(0,0,canvas.width,canvas.height),10),0,0)
          else if(engine=="entity2")ctx.filter="blur(10px)"
          else ctx.putImageData(gaussBlur(ctx.getImageData(0,0,canvas.width,canvas.height),10),0,0)
          await new Promise(resolve=>canvas.toBlob(blob=>{addFileToFolder("textures/cube/bg","blur.jpg",blob);resolve()}))
          cancelBtn()
        }
        image.src=event.target.result
      }
      reader.readAsDataURL(uploadFile.current.files[0]);
      return
    }
    frameArr=[];
    progressDialog.current.description=T("bg$progress$extract")
    bgData.src=URL.createObjectURL(uploadFile.current.files[0])
    previewVideo.current.setAttribute("src",URL.createObjectURL(uploadFile.current.files[0]))
    video.current.setAttribute("src",URL.createObjectURL(uploadFile.current.files[0]))
    video.current.muted=true
    video.current.play()
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
    var width=video.current.videoWidth/2,height=video.current.videoHeight/2;
    liveSwitch.current.checked=true
    liveSwitchFn()
    fileRead("textures/cube")[0].children=[]
    fileRead("textures/cube")[1].children=[]
    timer=setInterval(()=>{
      var canvas=document.createElement("canvas"),ctx=canvas.getContext('2d');
      canvas.width=width;
      canvas.height=height;
      canvas.getContext('2d').drawImage(video.current,0,0,canvas.width,canvas.height)
      frameArr.push({index:frameIndex,time:video.current.currentTime,frame:canvas,blur:null})
      frameIndex++
      progress.current.value=video.current.currentTime/video.current.duration
    },delay)
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
          if(engine=="engine1")ctx.putImageData(gaussBlur2(ctx.getImageData(0,0,e.frame.width,e.frame.height),30),0,0)
          else if(engine=="entity2")ctx.filter="blur(10px)"
          else ctx.putImageData(gaussBlur(ctx.getImageData(0,0,e.frame.width,e.frame.height),10),0,0)
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
    liveState=liveSwitch.current.checked;
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
        cv.c("mdui-text-field",{label:T("bg$interval"),ref:delayInput,min:20,max:60000,type:"number",value:100,style:"margin-bottom:5px"}),
        cv.c("mdui-text-field",{label:T("bg$duration"),ref:durationInput,min:0,max:10,type:"number",value:0.1,style:"margin-bottom:5px"}),
        cv.c("mdui-select",{label:T("bg$blur"),ref:engineInput,value:"engine1",style:"line-height:normal;"},cv.c("mdui-menu-item",{value:"engine1"},T("bg$blur$1")),cv.c("mdui-menu-item",{value:"engine2"},T("bg$blur$2")),cv.c("mdui-menu-item",{value:"engine3"},T("bg$blur$3"))),
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
    cv.c(bottomBtn,{leftBtn:leftBtn,rightFn:save,leftText:T("gui$upload"),rightText:T("gui$save")})
  )
}

// music
function musicScreen(){
  var musicName=useRef(),musicAuthor=useRef(),addBtn=useRef(),dialog=useRef(),musicFile=useRef(),coverFile=useRef();
  var close=()=>{dialog.current.open=false},coverChange=function(e){var reader=new FileReader();reader.onload=function(r){var img=new Image();img.onload=function(){new SimpleCrop({src:r.target.result,cropSizePercent:0.8,size:{width:Math.min(img.width,img.height),height:Math.min(img.width,img.height)},cropCallback:function(result){coverFile.result=result}})};img.src=r.target.result;coverFile.name=e.target.files[0].name};if(e.target.files.length>0)reader.readAsDataURL(e.target.files[0])},musicChange=function(a){var b=a.target.files[0];if(b){var c=b.name.split(".").pop();return"ogg"===c?void(""===musicName.current.inputRef.value.value&&musicName.current.setRangeText(b.name.substring(0,b.name.lastIndexOf("."))),addBtn.current.disabled=!1):mdui.snackbar({message:T("music$oggTip"),closeable:!0,autoCloseDelay:3e3,closeOnOutsideClick:!0,placement:"top"})}};
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
      MusicArr.push(musicDetails)
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
    var firstKeys=Object.keys(item[i]),musicID=item[i][firstKeys]["$music_id"],coverPath=item[i][firstKeys]["$music_cover"],soundsDef=fileRead("sounds/sound_definitions.json"),soundsDefJson=JSON.parse(soundsDef.content),oggPath=soundsDefJson[musicID]["sounds"][0]["name"]+".ogg";MusicArr.splice(i,1),item.splice(i,1),
    coverPath!==''&&deleteFile("textures",coverPath.slice(coverPath.lastIndexOf('/')+1)),deleteFile("sounds",oggPath.slice(oggPath.lastIndexOf('/')+1)),setting.content=JSON.stringify(setJson),soundsDefJson["cube.music.custom"].sounds.splice(i,1),delete soundsDefJson[musicID],soundsDef.content=JSON.stringify(soundsDefJson),cv.forceUpdate()
  }
  var edit=(type,name,i)=>mdui.prompt({
    headline:T("gui$edit")+" "+name,closeOnEsc:true,cancelText:T("gui$cancel"),confirmText:T("gui$confirm"),
    onConfirm:value=>{if(type==="$music_name"&&value.trim()===""){mdui.snackbar({message:T("music$nameEmpty"),placement:"top",action:T("gui$know"),onActionClick:()=>{}});return}var firstKeys=Object.keys(item[i]);item[i][firstKeys][type]=value;setting.content=JSON.stringify(setJson);cv.forceUpdate()}
  })
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
                cv.c("mdui-menu-item",null,T("gui$edit")+" ["+T("music$longPress")+"]",
                  cv.c("mdui-menu-item",{onClick:()=>edit("$music_name",T("music$name"),index),slot:"submenu"},T("music$name")),
                  cv.c("mdui-menu-item",{onClick:()=>edit("$music_author",T("music$author"),index),slot:"submenu"},T("music$author"))
              ))
          ))
      })),cv.c("div",{style:"height:45px"})),
      item.length===0&&cv.c("div",{style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
        cv.c("div",{style:{fontSize:"32px"}},T("music$empty$title")),
        cv.c("div",{style:{fontSize:"14px",marginTop:"4px"}},T("music$empty$desc"))
    )),
    cv.c(bottomBtn,{leftFn:newBtn,rightFn:save,leftText:T("gui$add"),rightText:T("gui$save")}),
    cv.c("mdui-dialog",{ref:dialog,attr:{"close-on-esc":"close-on-esc"}},
      cv.c("span",{slot:"headline"},T("music$add")),
      cv.c("mdui-text-field",{maxlength:32,ref:musicName,counter:"counter",label:T("music$name")}),
      cv.c("mdui-text-field",{maxlength:32,ref:musicAuthor,counter:"counter",label:T("music$author")}),
      cv.c("mdui-segmented-button-group",{attr:{"full-width":"full-width"}},
        cv.c("mdui-segmented-button",{ondrop:e=>handleClickOrDrop(e,coverFile),onClick:e=>handleClickOrDrop(e,coverFile),ondragover:allowDrop},T("music$cover")),
        cv.c("mdui-segmented-button",{ondrop:e=>handleClickOrDrop(e,musicFile),onClick:e=>handleClickOrDrop(e,musicFile),ondragover:allowDrop},T("music$file"))),
      cv.c("input",{attr:{type:"file"/*,accept:"audio/*"*/},ref:musicFile,onChange:musicChange,style:"display:none"}),
      cv.c("input",{attr:{type:"file",accept:"image/*"},ref:coverFile,onChange:coverChange,style:"display:none"}),
      cv.c("mdui-button",{slot:"action",variant:"text",onClick:close},T("gui$cancel")),
      cv.c("mdui-button",{slot:"action",variant:"filled",onClick:addMusic,ref:addBtn,disabled:"disabled"},T("gui$add"))
    )
  )
}

function home(){
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      cv.c("div",{style:{fontSize:"32px"}},T("gui$coming")),
      cv.c("div",{style:{fontSize:"15px",marginTop:"4px"}},T("gui$comingDesc"))
    )
  )
}
function errorScreen(){
  return cv.c(cv.fragment,null,
    cv.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      cv.c("div",{style:{fontSize:"32px"}},"404"),
      cv.c("div",{style:{fontSize:"15px",marginTop:"4px"}},T("e$title")),
      cv.c("mdui-button",{href:"/",style:{marginTop:"8px"}},T("e$back"))
    )
  )
}
function App(){
  return cv.c(cv.fragment,null,cv.c(topBar),cv.c(cv.BrowserRouter,{errorComponent:errorScreen},
    cv.c(cv.router,{path:"/",component:home}),
    cv.c(cv.router,{path:"/custom",component:customScreen}),
    cv.c(cv.router,{path:"/item",component:itemScreen}),
    cv.c(cv.router,{path:"/music",component:musicScreen}),
    cv.c(cv.router,{path:"/variables",component:variablesScreen}),
    cv.c(cv.router,{path:"/bg",component:bgScreen}),
  ));
}
if(window.location.href.startsWith("https://wisebreeze.github.io")){cv.setInitialPath("/cv")}
document.addEventListener("DOMContentLoaded",function(){
  const container=document.getElementById("app")
  cv.root(App,container)
});
})()