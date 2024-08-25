import 'mdui/mdui.global.js';
import language from './data/language'

// screen
import ErrorScreen from './screen/error'
import HomeScreen from './screen/home'
import CustomScreen from './screen/custom'
import ItemScreen from './screen/item'
import MusicScreen from './screen/music'
import VariablesScreen from './screen/variables'
import BgScreen from './screen/bg'
import ThemeScreen from './screen/theme'

mdui.setColorScheme("#778BFF");
var data=localStorage.getItem('themeType');
typeof data == "string"&&mdui.setTheme(data);
var saveAs=saveAs||"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(a){if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f=!a.externalHost&&"download"in e,g=a.webkitRequestFileSystem,h=a.requestFileSystem||g||a.mozRequestFileSystem,i=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},j="application/octet-stream",k=0,l=[],m=function(){for(var a,b=l.length;b--;)a=l[b],"string"==typeof a?d.revokeObjectURL(a):a.remove();l.length=0},n=function(a,b,c){var d,e;for(b=[].concat(b),d=b.length;d--;)if(e=a["on"+b[d]],"function"==typeof e)try{e.call(a,c||a)}catch(f){i(f)}},o=function(d,i){var m,o,p,q,r=this,s=d.type,t=!1,u=function(){var a=c().createObjectURL(d);return l.push(a),a},v=function(){n(r,"writestart progress write writeend".split(" "))},w=function(){(t||!m)&&(m=u(d)),o?o.location.href=m:window.open(m,"_blank"),r.readyState=r.DONE,v()},x=function(a){return function(){return r.readyState!==r.DONE?a.apply(this,arguments):void 0}},y={create:!0,exclusive:!1};return r.readyState=r.INIT,i||(i="download"),f?(m=u(d),b=a.document,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),e.href=m,e.download=i,q=b.createEvent("MouseEvents"),q.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(q),r.readyState=r.DONE,v(),void 0):(a.chrome&&s&&s!==j&&(p=d.slice||d.webkitSlice,d=p.call(d,0,d.size,j),t=!0),g&&"download"!==i&&(i+=".download"),(s===j||g)&&(o=a),h?(k+=d.size,h(a.TEMPORARY,k,x(function(a){a.root.getDirectory("saved",y,x(function(a){var b=function(){a.getFile(i,y,x(function(a){a.createWriter(x(function(b){b.onwriteend=function(b){o.location.href=a.toURL(),l.push(a),r.readyState=r.DONE,n(r,"writeend",b)},b.onerror=function(){var a=b.error;a.code!==a.ABORT_ERR&&w()},"writestart progress write abort".split(" ").forEach(function(a){b["on"+a]=r["on"+a]}),b.write(d),r.abort=function(){b.abort(),r.readyState=r.DONE},r.readyState=r.WRITING}),w)}),w)};a.getFile(i,{create:!1},x(function(a){a.remove(),b()}),x(function(a){a.code===a.NOT_FOUND_ERR?b():w()}))}),w)}),w),void 0):(w(),void 0))},p=o.prototype,q=function(a,b){return new o(a,b)};return p.abort=function(){var a=this;a.readyState=a.DONE,n(a,"abort")},p.readyState=p.INIT=0,p.WRITING=1,p.DONE=2,p.error=p.onwritestart=p.onprogress=p.onwrite=p.onabort=p.onerror=p.onwriteend=null,a.addEventListener("unload",m,!1),q.unload=function(){m(),a.removeEventListener("unload",m,!1)},q}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);
var {T,useState}=cv

var fileStructure=[
  {type:'folder',name:'assets',children:[{type:'folder',name:'cube',children:[{type:'file',name:'frame.ui',content:null}]}]},
  {type:'folder',name:'sounds',children: [{type:'file',name:'sound_definitions.json',content:null}]},
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
  {type:'file',name:'manifest.json',content:'{"format_version":2,"header":{"description":"","name":"CubeVisage Custom Pack","uuid":"","version":[1,0,0],"min_engine_version":[1,13,0]},"modules":[{"type":"resources","uuid":"","version":[1,0,0]}]}'},
  {type:'file',name:'pack_icon.png',content:null}
];
var project={
  name:"",
  desc:""
};

cv.setLocalizationData(language);
var urlObj = new URL(window.location.href);cv.setLocale(localStorage.getItem('language')||urlObj.searchParams.get("lang")||"zh-cn");
function mergeObjects(){return Array.from(arguments).reduce((target,source)=>(Object.keys(source).forEach(key=>target[key]=source[key]),target),{})}
function deleteEmpty(e){for(var t=e.length-1;t>=0;t--){var l=e[t];"folder"===l.type?(deleteEmpty(l.children),0===l.children.length&&e.splice(t,1)):"file"!==l.type||l.content&&""!==l.content||e.splice(t,1)}}
function deleteFile(r,e){var t=r.split("/"),n=fileStructure,i=!0,f=!1,o=void 0;try{for(var l,u=t[Symbol.iterator]();!(i=(l=u.next()).done);i=!0)!function(){var r=l.value,e=n.find(function(e){return"folder"===e.type&&e.name===r});if(!e)throw new Error("the path does not exist");n=e.children}()}catch(r){f=!0,o=r}finally{try{!i&&u.return&&u.return()}finally{if(f)throw o}}var a=n.findIndex(function(r){return"file"===r.type&&r.name===e});if(-1===a)throw new Error("the file does not exist");n.splice(a,1)}
function fileRead(n){for(var r=n.split("/"),t=fileStructure,e=0;e<r.length;e++)!function(e){var i=r[e];if(!i)return"continue";var o=t.find(function(n){return n.name===i});if(!o)throw new Error("Path "+n+" not found");if(!(t=o.children||o))throw new Error("Path "+n+" not found")}(e);if(null!==t.content||null!==t.children)return t;throw new Error("Invalid path "+n)}
function findFileByName(a,b){var c=!0,d=!1,e=void 0;try{for(var g,h,f=a[Symbol.iterator]();!(c=(g=f.next()).done);c=!0){if(h=g.value,h.name===b)return h;if('folder'===h.type){var i=findFileByName(h.children,b);if(i)return i}}}catch(h){d=!0,e=h}finally{try{!c&&f.return&&f.return()}finally{if(d)throw e}}return null}
function addFileToFolder(a,b,c,d){var f,g,i,j,k,l,m,n,e=a.split("/");for(d||(d=fileStructure),f=0;f<d.length;f++)if(g=d[f],"folder"===g.type&&g.name===e[0]){if(g.children||(g.children=[]),1===e.length){for(i=b.substring(0,b.lastIndexOf(".")),j=b.substring(b.lastIndexOf(".")),k=g.children.filter(function(a){return"file"===a.type}).map(function(a){return a.name}),l=1;k.includes(b);)b=i+"_"+l+j,l++;return g.children.push({type:"file",name:b,content:c}),b}if(m=e.slice(1).join("/"),n=addFileToFolder(m,b,c,g.children))return n}return console.error('Unable to find folder at path "'+a+'"'),null}
function addFilesToZip(folder,zip){folder.forEach(item=>{if(item.type==='file'){zip.file(item.name,item.content);}else if(item.type==='folder'){const newFolder=zip.folder(item.name);addFilesToZip(item.children,newFolder);}});}
function get_uuid(){var a=(new Date).getTime();return window.performance&&"function"==typeof window.performance.now&&(a+=performance.now()),"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(b){var c=0|(a+16*Math.random())%16;return a=Math.floor(a/16),("x"==b?c:8|3&c).toString(16)})}
function debounce(func,delay){let timerId;return function(){const context=this;const args=arguments;clearTimeout(timerId);timerId=setTimeout(function(){func.apply(context,args);},delay)}}
function throttle(func,interval){let lastTime=0;return function(...args){const now=Date.now();if(now-lastTime>=interval){lastTime=now;func.apply(this,args)}}}
async function downloadZip(a){return new Promise(resolve=>{const b=new JSZip;addFilesToZip(a,b),b.generateAsync({type:"blob"}).then(function(a){saveAs(a,(project.name||"立方之窗_自定义包")+".mcpack");resolve()})})}

function setVariables(obj){var globalVariablesFile=fileRead("ui/_global_variables.json"),globalVariablesJSON=JSON.parse(globalVariablesFile.content);Object.assign(globalVariablesJSON,obj);globalVariablesFile.content=JSON.stringify(globalVariablesJSON)}
function removeVariables(str){var globalVariablesFile=fileRead("ui/_global_variables.json"),globalVariablesJSON=JSON.parse(globalVariablesFile.content),propArr=str.split(",").map(prop=>prop.trim());globalVariablesJSON=Object.keys(globalVariablesJSON).filter(key=>!propArr.includes(key)).reduce((obj,key)=>{obj[key]=globalVariablesJSON[key];return obj},{});globalVariablesFile.content=JSON.stringify(globalVariablesJSON)}

function TopBar({title}){
  const [language,setLanguage]=useState(localStorage.getItem('language')||urlObj.searchParams.get("lang")||"zh-cn");
  const [theme,setTheme]=useState(localStorage.getItem('themeType'));
  return (<div className="ns" style="position: relative;overflow: hidden">
    <mdui-top-app-bar scroll-behavior="elevate" scroll-target="#content">
      <mdui-top-app-bar-title style="margin-left:8px"><a href="/" style="color: inherit;text-decoration:none">{title||T("gui$packName")}</a></mdui-top-app-bar-title>
      <div style="flex-grow:1"/>
      <mdui-dropdown>
        <mdui-button-icon slot="trigger"><ion-icon name="language-outline"/></mdui-button-icon>
        <mdui-menu selects="single" value={language||"zh-cn"}>
          <mdui-menu-item value="en-us" onClick={()=>{setLanguage("en-us");cv.setLocale('en-us');localStorage.setItem('language',"en-us")}}>English</mdui-menu-item>
          <mdui-menu-item value="zh-cn" onClick={()=>{setLanguage("zh-cn");cv.setLocale('zh-cn');localStorage.setItem('language',"zh-cn")}}>简体中文</mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>
      <mdui-dropdown>
        <mdui-button-icon slot="trigger"><ion-icon name={theme==="dark"?"moon-outline":"sunny-outline"}/></mdui-button-icon>
        <mdui-menu selects="single" value={theme||"auto"}>
          <mdui-menu-item value="light" onClick={()=>{setTheme("light");mdui.setTheme('light');localStorage.setItem('themeType',"light")}}>{T("gui$light")}</mdui-menu-item>
          <mdui-menu-item value="dark" onClick={()=>{setTheme("dark");mdui.setTheme('dark');localStorage.setItem('themeType',"dark")}}>{T("gui$dark")}</mdui-menu-item>
          <mdui-divider />
          <mdui-menu-item value="auto" onClick={()=>{setTheme("auto");mdui.setTheme('auto');localStorage.setItem('themeType',"auto")}}>{T("gui$system")}</mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>
    </mdui-top-app-bar>
  </div>)
}

function App(){
  const BrowserRouter = cv.BrowserRouter;
  const Router = cv.router;
  return (<>
    <TopBar/>
    <BrowserRouter errorComponent={ErrorScreen}>
      <Router path="/" component={HomeScreen}/>
      <Router path="/custom" component={CustomScreen}/>
      <Router path="/item" component={ItemScreen}/>
      <Router path="/music" component={MusicScreen}/>
      <Router path="/theme" component={ThemeScreen}/>
      <Router path="/variables" component={VariablesScreen}/>
      <Router path="/bg" component={BgScreen}/>
    </BrowserRouter>
  </>)
}
if(window.location.href.startsWith("https://wisebreeze.github.io")){cv.setInitialPath("/cv")}
document.addEventListener("DOMContentLoaded",function(){
  const container=document.getElementById("app")
  cv.root(App,container)
});

export {project as default}// data
export {get_uuid,mergeObjects,throttle,setVariables,removeVariables}// tool
export {fileStructure,fileRead,findFileByName,addFileToFolder,deleteFile,downloadZip,deleteEmpty}// file