import {forceUpdate} from "./index.js"

const initialPath="";
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
const BrowserRouter=({children:routers,errorComponent})=>{
  return routers.find(r=>pathToRegexp(window.location.pathname.slice(initialPath.length)).exec(r.props.path))||cv.c(cv.router,{component:errorComponent})
}
const Router=({path,component,transition,props})=>{let ts=transition&&{style:{transition:`all ${transition.timeout}ms`},timeout:transition.timeout,In:transition.in,timeout:transition.timeout,transition:transition.className};return cv.c("router",ts,cv.c(component,props))};
const skipRouter=path=>{history.pushState(null,null,initialPath+path);forceUpdate()};
const setInitialPath=path=>initialPath=path;

export {BrowserRouter,Router,skipRouter,setInitialPath}