(function(){"use strict";const MAX_TIME=1000,
createElement=(type,props,...children)=>({type,props:{...props,children:children.flat()/*.filter(c=>c!=null&&c!==false)*/.map(child=>typeof child==="object"?child:createTextElement(child))}}),
createTextElement=t=>({type:"#text",props:{nodeValue:t}}),
createDom=fiber=>{const isEmpty=fiber.props&&typeof fiber.props.nodeValue=="boolean",dom=fiber.type=="#text"?document.createTextNode(""):document.createElement(typeof fiber.type=='string'?fiber.type:'div');isEmpty||updateDom(dom,{},fiber.props);return dom},
isRef=k=>k=="ref",isEvent=k=>k.startsWith("on"),isProperty=k=>k!=="children"&&!isEvent(k)&&!isRef(k),isNew=(p,n)=>k=>p[k]!==n[k],isGone=(p,n)=>k=>!(k in n);

function updateDom(dom,prev={},next={}){
  //Remove old or changed event listeners
  Object.keys(prev).filter(isEvent)
    .filter(k=>!(k in next)||isNew(prev,next)(k))
    .forEach(n=>dom.removeEventListener(n.toLowerCase().substring(2),prev[n]))
  // Remove old properties
  Object.keys(prev).filter(isProperty)
    .filter(isGone(prev,next))
    .forEach(n=>n==="attr"?Object.keys(prev.attr).forEach(key=>dom.removeAttribute(key)):dom[n]="")
  // Set new or changed properties
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
  // Add event listeners
  Object.keys(next).filter(isEvent)
    .filter(isNew(prev,next))
    .forEach(n=>dom.addEventListener(n.toLowerCase().substring(2),next[n]))
  // Set ref
  if(isNew(prev,next)("ref"))next.ref.current=dom;
  // anim
  if(typeof next.In==="boolean"&&isNew(prev,next)("In")){
    let t=next.In?'enter':'exit',f=!next.In?'enter':'exit';
    dom.classList.remove(next.transition+'-'+f+'-active');dom.classList.add(next.transition+'-'+t)
    setTimeout(()=>dom.classList.replace(next.transition+'-'+t,next.transition+'-'+t+'-active'),next.timeout||0)
  }
}

const
setStyle=(e,s)=>e.style=Object.keys(s).reduce((r,n)=>r+=`${n.replace(/[A-Z]/g,v=>'-'+v.toLowerCase())}:${s[n]};`,''),
setAttr=(e,s)=>Object.keys(s).forEach(key=>e.setAttribute(key,s[key])),
commitRoot=()=>{deletions.forEach(commitWork);commitWork(wipRoot.child);currentRoot=wipRoot;wipRoot=null;wipFiber.hooks.filter(e=>e.tag=="EFFECT").forEach(e=>Cube.useMemo(e.fn,e.deps))},
findLast=f=>{while((f=f.lastChild))if(typeof f.type!="function")return f.dom};

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
  else if(fiber.effectTag==="UPDATE"&&fiber.dom!=null)updateDom(fiber.dom,fiber.alternate.props,fiber.props);
  else if(fiber.effectTag==="DELETION"){if(fiber.type!="router"&&typeof fiber.props.In!=="boolean")commitDeletion(fiber,parent);else{const prop=fiber.props,rc=fiber.dom.classList;rc.remove(prop.transition+'-enter-active');rc.add(prop.transition+'-exit-active');setTimeout(()=>{rc.remove(prop.transition+'-exit-active');commitDeletion(fiber,parent)},prop.timeout||0)}return}
  commitWork(fiber.child,ip)
  commitWork(fiber.sibling,findLast(fiber))
}

const
commitDeletion=(f,p)=>{if(f.dom)p.removeChild(f.dom);else commitDeletionAll(f.child,p)},
commitDeletionAll=(f,p)=>{while(f){if(f.dom)p.removeChild(f.dom);else commitDeletionAll(f.child,p);f=f.sibling}},
root=(el,c)=>{wipRoot={dom:c,props:{children:[typeof el=="function"?Cube.c(el,null):el]},alternate:currentRoot};deletions=[];nextUnitOfWork=wipRoot};
let nextUnitOfWork=null,currentRoot=null,wipRoot=null,deletions=null,wipFiber=null,hookIndex=null,lastIdleTime=0,routerHistory=[],initialPath='';

function workLoop(dl){if(lastIdleTime-dl.timeStamp>MAX_TIME){nextUnitOfWork=null;wipRoot=null;return}let yi=false;while(nextUnitOfWork&&!yi){nextUnitOfWork=performUnitOfWork(nextUnitOfWork);lastIdleTime=dl.timeStamp;yi=dl.timeRemaining()<1}if(!nextUnitOfWork&&wipRoot)commitRoot();requestIdleCallback(workLoop)}
requestIdleCallback(workLoop)

function performUnitOfWork(fiber){
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

function updateFunctionComponent(fiber){
  if(fiber.type===fragment)return reconcileChildren(fiber,fiber.props.children);
  wipFiber=fiber
  hookIndex=0
  wipFiber.hooks=[]
  reconcileChildren(fiber,[fiber.type(fiber.props)])
}

const
getHook=()=>wipFiber.alternate&&wipFiber.alternate.hooks&&wipFiber.alternate.hooks[hookIndex],
useState=initial=>useReducer(null,initial),
useReducer=(reducer,initial)=>{const oh=getHook(),h={tag:"REDUCER",state:oh?oh.state:initial,queue:[]};(oh?oh.queue:[]).forEach(i=>h.state=reducer?reducer(h.state,i):typeof i==="function"?i(h.state):i);const ss=i=>{h.queue.push(i);forceUpdate()};wipFiber.hooks.push(h);hookIndex++;return[h.state,ss]},
useEffect=(fn,deps)=>{wipFiber.hooks.push({tag:"EFFECT",fn,deps});hookIndex++},
createContext=i=>{const context={value:i,set:v=>context.value=v};return context},useContext=c=>c&&c.value,
updateHostComponent=f=>{if(!f.dom)f.dom=createDom(f);f.props&&f.props.children&&reconcileChildren(f,f.props.children)};

function reconcileChildren(wipFiber,elements){
  let index=0,
  oldFiber=wipFiber.alternate&&wipFiber.alternate.child,
  prevSibling=null,insertPoint=null;wipFiber.childLen=elements.length;
  while(index<elements.length||oldFiber){
    const element=elements[index]
    let newFiber=null

    const sameType=oldFiber&&element&&element.type==oldFiber.type;
    if(sameType){
      newFiber={
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        insertPoint: insertPoint
      }
    }

    if(element&&!sameType){
      newFiber={
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
        insertPoint: insertPoint
      }
    }

    if(oldFiber&&!sameType){
      oldFiber.effectTag="DELETION"
      deletions.push(oldFiber)
    }

    if(oldFiber)oldFiber=oldFiber.sibling;
    if(index===elements.length-1)wipFiber.lastChild=newFiber;
    if(index===0){if(typeof wipFiber.type=="function"&&newFiber&&wipFiber.insertPoint)newFiber.insertPoint=wipFiber.insertPoint;wipFiber.child=newFiber}
    else if(element)prevSibling.sibling=newFiber;
    prevSibling=newFiber;
    insertPoint=newFiber;
    index++
  }
}

function pathToRegexp(path, matchKeys = [], matchOptions = {}) {
  if (path === "/") {
    return new RegExp("^/$", matchOptions.sensitive ? "" : "i");
  }
  const segments = path.split('/').filter(Boolean);
  let regexpStr = '^';
  segments.forEach(segment => {
    if (segment.startsWith(':')) {
      const key = segment.slice(1);
      matchKeys.push({ name: key });
      regexpStr += '/([^/]+)';
    } else {
      const escapedSegment = segment.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      regexpStr += '/' + escapedSegment;
    }
  });
  regexpStr += '/?$';
  const flags = matchOptions.sensitive ? '' : 'i';
  return new RegExp(regexpStr, flags);
}
function BrowserRouter({children:routers,errorComponent}){
  return routers.find(r=>pathToRegexp(window.location.pathname.slice(initialPath.length)).exec(r.props.path))||Cube.c(Cube.router,{component:errorComponent})
}

const
setInitialPath=path=>initialPath=path,
passRef=fn=>p=>{const{ref,...P}=p;return fn(P,ref)},
useRef=initial=>({current:initial})/*initial=>Cube.useMemo(()=>({current:initial}),[])*/,
useCallback=(c,d)=>useMemo(()=>c,d),
useMemo=(c,d)=>{let f=wipFiber,h=getHook(),isChange=d?(h&&h.input||[]).some((v,i)=>v!==d[i]):true,H={tag:"MEMO",fn:c,input:d},isMounted=h&&h.isMounted;if(d&&d.length===0){isChange=true;H.isMounted=true};f.hooks.push(H);hookIndex++;return(isChange&&!isMounted)?(H.memo=c()):h&&h.memo},
transition=({children,className,timeout,in:In})=>Cube.c("transition",{style:{transition:`all ${timeout}ms`},transition:className,In,timeout},children),
router=({path,component,transition,props})=>{let ts=transition&&{style:{transition:`all ${transition.timeout}ms`},timeout:transition.timeout,In:transition.in,timeout:transition.timeout,transition:transition.className};return Cube.c("router",ts,Cube.c(component,props))},
forceUpdate=()=>{wipRoot={dom:currentRoot.dom,props:currentRoot.props,alternate:currentRoot};nextUnitOfWork=wipRoot;deletions=[]},
useID=p=>p||'id_'+Date.now(),fragment=c=>c,
sleep=d=>{for(var t=Date.now();Date.now()-t<=d;){}},
skipRouter=path=>{history.pushState(null,null,path);forceUpdate()};
window.addEventListener("hashchange",()=>{forceUpdate()});
window.addEventListener('pushstate', function(e){forceUpdate()});
window.addEventListener('popstate', function(e){forceUpdate()});
document.addEventListener('click',e=>{if(typeof e.target.href === "string"){e.preventDefault();const url=new URL(e.target.getAttribute("href"),window.location.origin);if(url.hostname===window.location.hostname){skipRouter(url.pathname+url.search+url.hash)}else window.location.href=url.href}});
window.Cube={c:createElement,root,useState,useReducer,useEffect,forceUpdate,useID,router,transition,fragment,sleep,useMemo,useCallback,useRef,passRef,createContext,useContext,BrowserRouter,skipRouter,setInitialPath}})()