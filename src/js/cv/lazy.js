import {createElement} from './index.js'
import {useState,useEffect} from './hook.js'

function lazy(loadComponent){
  return function Component({loading,error,...props}){
    const [Component, setComponent] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [errorStr, setError] = useState(null);
    useEffect(() => {
      const load = async () => {
        try {
          const module = await loadComponent();
          setLoading(false);
          setComponent(()=>module.default(props))
        } catch (e) {
          setLoading(false);
          setError(e)
        }
      };
      load();
    }, []);
    if(isLoading){
      return loading?loading:createElement("div",null,"loading...");
    }else if(errorStr){
      return error?error:createElement("div",null,"Failed to load component: "+errorStr.message);
    }
    return Component?Component:null
  }
}

export {lazy}