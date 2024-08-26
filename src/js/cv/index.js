import {lazy} from "./lazy.js"
import {hook,useEffect,useState,useReducer,useCallback,useMemo,useID} from "./hook.js"
import {T,setLocale,setLocalizationData} from "./local.js"
import {BrowserRouter,Router,skipRouter,setInitialPath} from "./router.js"

// 空闲时渲染
const requestIdleCallback = window.requestIdleCallback||function(handler){var startTime=Date.now();return setTimeout(function(){handler({didTimeout:false,timeRemaining:function(){return Math.max(0,50.0-(Date.now()-startTime))}})},1)};
const cancelIdleCallback = window.cancelIdleCallback||function(id){clearTimeout(id)};

const MAX_TIME = 1000;// 最大执行时间
let nextWork = null,// 下一个工作
currentRoot = null,// 当前更改
rootFiber = null,// 根节点
deletions = null,// 删除标记
currentFiber = null,// 当前节点
lastIdleTime = 0;// 上次空闲时间

const createElement = (type, props, ...children) => ({// 创建虚拟 DOM 元素
  type,
  props: {
    ...props,
    children: children.flat().map(child=>typeof child==="object"?child:createTextElement(child))
  }
});
const createTextElement=t=>({type:"#text",props:{nodeValue:t}});// 创建文本节点的DOM元素

const createDom=fiber=>{// 虚拟 DOM 转真实 DOM
  const isEmpty=fiber.props&&typeof fiber.props.nodeValue == "boolean",
  dom = fiber.type == "#text" ?
    document.createTextNode("") :
    document.createElement(typeof fiber.type=='string' ? fiber.type : 'div');
  isEmpty || updateDom(dom,{},fiber.props);
  return dom
};
const isRef=k=>k=="ref",// 是否为 ref 属性
isEvent=k=>k.startsWith("on"),// 是否为事件
isProperty=k=>k!=="children"&&!isEvent(k)&&!isRef(k),// 是否为普通属性
isNew=(p,n)=>k=>p[k]!==n[k],// 是否为新属性
isGone=(p,n)=>k=>!(k in n);// 是否为删除的属性

// 更新 DOM 的属性
function updateDom(dom,prev={},next={}){
  // 移除旧的或更改的事件监听器
  Object.keys(prev).filter(isEvent)
    .filter(k=>!(k in next)||isNew(prev,next)(k))
    .forEach(n=>dom.removeEventListener(n.toLowerCase().substring(2),prev[n]))
  // 移除旧属性
  Object.keys(prev).filter(isProperty)
    .filter(isGone(prev,next))
    .forEach(n=>n==="attr"?Object.keys(prev.attr).forEach(key=>dom.removeAttribute(key)):dom[n]="")
  // 设置新的或更改属性
  Object.keys(next).filter(isProperty)
    .filter(isNew(prev,next))
    .forEach(n=>{
      if(n==="style")typeof(next.style)==="string"?dom.setAttribute("style",next.style):setStyle(dom,next.style);
      else if(n==="attr")setAttr(dom,next.attr);
      else if(n==="className"){
        prev.className&&dom.classList.remove(...prev.className.split(/\s+/));
        dom.classList.add(...next.className.split(/\s+/))
      }
      else dom[n]=next[n];
    })
  // 添加事件监听器
  Object.keys(next).filter(isEvent)
    .filter(isNew(prev,next))
    .forEach(n=>dom.addEventListener(n.toLowerCase().substring(2),next[n]))
  // 设置 ref
  if(isNew(prev,next)("ref"))next.ref.current=dom;
  // 动画处理 (临时)
  if(typeof next.In==="boolean"&&isNew(prev,next)("In")){
    let t=next.In?'enter':'exit',f=!next.In?'enter':'exit';
    dom.classList.remove(next.transition+'-'+f+'-active');dom.classList.add(next.transition+'-'+t)
    setTimeout(()=>dom.classList.replace(next.transition+'-'+t,next.transition+'-'+t+'-active'),next.timeout||0)
  }
}

// 设置样式和属性
const setStyle=(e,s)=>e.style=Object.keys(s).reduce((r,n)=>r+=`${n.replace(/[A-Z]/g,v=>'-'+v.toLowerCase())}:${s[n]};`,'');
const setAttr=(e,s)=>Object.keys(s).forEach(key=>e.setAttribute(key,s[key]));

// 提交根节点的变更
const commitRoot = () => {
  deletions.forEach(commitWork);// 删除所有标记的节点
  commitWork(rootFiber.child);// 执行子节点的提交工作
  currentRoot=rootFiber;// 将当前的工作根设为根
  rootFiber=null;// 重置根为 null，为下一次更新做准备
  // 遍历标记为 EFFECT 的 Hook
  currentFiber.hooks.filter(e=>e.tag=="EFFECT").forEach(e=>cv.useMemo(e.fn,e.deps))
};
// 寻找最后一个非函数类型的子节点
const findLast = f => {
  while ((f = f.lastChild))
    if (typeof f.type != "function")return f.dom
};

// 提交工作并更新 DOM
function commitWork(fiber,ip){
  if(!fiber)return;
  let domParentFiber=fiber.parent
  while(!domParentFiber.dom)domParentFiber=domParentFiber.parent;
  const parent=domParentFiber.dom;
  if(fiber.effectTag==="PLACEMENT"&&fiber.dom!=null){
    const point=fiber.insertPoint&&fiber.insertPoint.dom||ip,
    after=point?point.nextSibling:parent.firstChild;
    try{after?parent.insertBefore(fiber.dom,after):parent.appendChild(fiber.dom)}catch{parent.appendChild(fiber.dom)}
  }
  else if(fiber.effectTag==="UPDATE"&&fiber.dom!=null)updateDom(fiber.dom,fiber.oldFiber.props,fiber.props);
  else if(fiber.effectTag==="DELETION"){if(fiber.type!="router"&&typeof fiber.props.In!=="boolean")commitDeletion(fiber,parent);else{const prop=fiber.props,rc=fiber.dom.classList;rc.remove(prop.transition+'-enter-active');rc.add(prop.transition+'-exit-active');setTimeout(()=>{rc.remove(prop.transition+'-exit-active');commitDeletion(fiber,parent)},prop.timeout||0)}return}
  commitWork(fiber.child,ip)
  commitWork(fiber.sibling,findLast(fiber))
}

const commitDeletion = (f,p) => {// 提交删除节点
  if(f.dom)p.removeChild(f.dom);
  else commitDeletionAll(f.child,p)
};
const commitDeletionAll = (f,p) => {// 递归删除所有子节点
  while(f){
    if(f.dom)p.removeChild(f.dom);
    else commitDeletionAll(f.child,p);
    f=f.sibling
  }
};

const Root = (el,c) => {// 创建根组件
  rootFiber = {
    dom: c,
    props: {
      children: [typeof el=="function" ? cv.c(el,null) : el]
    },
    oldFiber: currentRoot
  };
  deletions = [];
  nextWork = rootFiber
};

function workLoop(dl){
  // 如果上一帧的工作时间超过限制，则中断工作循环
  if (lastIdleTime - dl.timeStamp > MAX_TIME) {
    nextWork=null;
    rootFiber=null;
    return
  }
  let yi = false;// 是否需要在当前空闲时间结束时退出循环
  while (nextWork && !yi) {// 当有工作时且当前空闲时间片内还有剩余时间，就就行工作
    nextWork = performWork(nextWork);// 执行下一个工作，更新虚拟 DOM
    lastIdleTime = dl.timeStamp;// 更新为当前时间戳，表示我们正在处理工作
    yi = dl.timeRemaining() < 1// 检查是否还需要继续工作，如果空闲时间片即将结束，则 yi 设为 true
  }
  // 如果没有更多工作，并且存在一个工作进度树，则提交根节点
  // 这会将所有变更提交在 DOM 上，并完成渲染
  if (!nextWork && rootFiber)commitRoot();
  requestIdleCallback(workLoop)// 请求下一次空闲时间进行工作循环
}
requestIdleCallback(workLoop)// 首次请求空闲时间工作

function performWork(fiber){// 执行单个工作
  const isFunctionComponent=fiber.type instanceof Function
  if(isFunctionComponent)updateFunctionComponent(fiber);
  else updateHostComponent(fiber);
  if(fiber.child)return fiber.child;
  let nextFiber=fiber
  while(nextFiber){
    if(nextFiber.sibling)return nextFiber.sibling;
    nextFiber=nextFiber.parent
  }
}

function updateFunctionComponent(fiber){// 更新函数组件
  if(fiber.type===fragment)return reconcileChildren(fiber,fiber.props.children);
  currentFiber=fiber
  hook.index=0
  currentFiber.hooks=[]
  reconcileChildren(fiber,[fiber.type(fiber.props)])
}

// 上下文 (临时)
const createContext=i=>{const context={value:i,set:v=>context.value=v};return context},useContext=c=>c&&c.value,
updateHostComponent=f=>{if(!f.dom)f.dom=createDom(f);f.props&&f.props.children&&reconcileChildren(f,f.props.children)};

function reconcileChildren(currentFiber,elements){
  let index=0,
  oldFiber=currentFiber.oldFiber&&currentFiber.oldFiber.child,
  prevSibling=null,insertPoint=null;currentFiber.childLen=elements.length;
  while(index<elements.length||oldFiber){
    const element=elements[index]
    let newFiber=null

    const sameType=oldFiber&&element&&element.type==oldFiber.type;
    if(sameType){
      newFiber={
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: currentFiber,
        oldFiber: oldFiber,
        effectTag: "UPDATE",
        insertPoint: insertPoint
      }
    }

    if(element&&!sameType){
      newFiber={
        type: element.type,
        props: element.props,
        dom: null,
        parent: currentFiber,
        oldFiber: null,
        effectTag: "PLACEMENT",
        insertPoint: insertPoint
      }
    }

    if(oldFiber&&!sameType){
      oldFiber.effectTag="DELETION"
      deletions.push(oldFiber)
    }

    if(oldFiber)oldFiber=oldFiber.sibling;
    if(index===elements.length-1)currentFiber.lastChild=newFiber;
    if(index===0){if(typeof currentFiber.type=="function"&&newFiber&&currentFiber.insertPoint)newFiber.insertPoint=currentFiber.insertPoint;currentFiber.child=newFiber}
    else if(element)prevSibling.sibling=newFiber;
    prevSibling=newFiber;
    insertPoint=newFiber;
    index++
  }
}

const forceUpdate=()=>{// 强制更新
  rootFiber={
    dom:currentRoot.dom,
    props:currentRoot.props,
    oldFiber:currentRoot
  };
  nextWork=rootFiber;
  deletions=[]
}

// 小工具
const
passRef=fn=>p=>{const{ref,...P}=p;return fn(P,ref)},
useRef=initial=>({current:initial}),
transition=({children,className,timeout,in:In})=>cv.c("transition",{style:{transition:`all ${timeout}ms`},transition:className,In,timeout},children),
fragment=c=>c,
sleep=d=>{for(var t=Date.now();Date.now()-t<=d;){}};

// 路由事件
window.addEventListener("hashchange",()=>{forceUpdate()});
window.addEventListener('pushstate',function(e){forceUpdate()});
window.addEventListener('popstate',function(e){forceUpdate()});
document.addEventListener('click',e=>{if(typeof e.target.href === "string"){e.preventDefault();const url=new URL(e.target.getAttribute("href"),window.location.origin);if(url.hostname===window.location.hostname){skipRouter(url.pathname+url.search+url.hash)}else window.location.href=url.href}});

window.cv={c:createElement,createElement,useState,useReducer,useEffect,forceUpdate,useID,transition,fragment,sleep,useMemo,useCallback,useRef,passRef,createContext,useContext,skipRouter,setInitialPath,T,setLocale,setLocalizationData,lazy}

export {currentFiber,Root,forceUpdate,createElement,BrowserRouter,Router,useID}