import {wipFiber,forceUpdate} from "./index.js"

const hook={index:0}

const getHook=()=>wipFiber.alternate&&wipFiber.alternate.hooks&&wipFiber.alternate.hooks[hook.index];
const useEffect=(fn,deps)=>{wipFiber.hooks.push({tag:"EFFECT",fn,deps});hook.index++};
const useState=initial=>useReducer(null,initial);
const useReducer=(reducer,initial)=>{const oh=getHook(),h={tag:"REDUCER",state:oh?oh.state:initial,queue:[]};(oh?oh.queue:[]).forEach(i=>h.state=reducer?reducer(h.state,i):typeof i==="function"?i(h.state):i);const ss=i=>{h.queue.push(i);forceUpdate(wipFiber)};wipFiber.hooks.push(h);hook.index++;return[h.state,ss]};

const useCallback=(c,d)=>useMemo(()=>c,d);
const useMemo=(c,d)=>{let f=wipFiber,h=getHook(),isChange=d?(h&&h.input||[]).some((v,i)=>v!==d[i]):true,H={tag:"MEMO",fn:c,input:d},isMounted=h&&h.isMounted;if(d&&d.length===0){isChange=true;H.isMounted=true};f.hooks.push(H);hook.index++;return(isChange&&!isMounted)?(H.memo=c()):h&&h.memo};

export {hook,useEffect,useState,useReducer,useCallback,useMemo}