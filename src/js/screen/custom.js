import project from "../main"
import {fileStructure,fileRead} from "../main"

function fetchImage(url,callback){fetch(url).then(response=>response.blob()).then(blob=>{const icon=fileStructure.find(item=>item.name==='pack_icon.png');if(icon)icon.content=blob;if(typeof callback==='function')callback(blob);}).catch(error=>console.error('Fetching image failed:',error));}

function CustomScreen(){
  var {T,useRef} = cv;

  const dialog=useRef();
  const nextBtn=useRef();
  const nameInput=useRef();
  const customBtn=function(){
    dialog.current.open=true;
    setTimeout(()=>{document.body.style.width="auto"},1)
  }
  const closeBtn=function(){dialog.current.open=false}
  const checkInput=function(e){project.name=e.target.inputRef.value.value;e.target.inputRef.value.value.trim().length>0?nextBtn.current.removeAttribute("disabled"):nextBtn.current.setAttribute("disabled","disabled")}
  const descInput=function(e){project.desc=e.target.inputRef.value.value;}
  const next=function(){
    fetchImage("https://cv-erd.pages.dev/assets/icon.png");
    let manifest=fileStructure.find(item=>item.name==='manifest.json'),
    manifestJSON=JSON.parse(manifest.content);
    manifestJSON.header.name=project.name;
    manifestJSON.header.description=project.desc;
    manifest.content=JSON.stringify(manifestJSON);
    let globalVariablesFile=fileRead("ui/_global_variables.json"),
    globalVariablesJSON=JSON.parse(globalVariablesFile.content)
    globalVariablesJSON["$cube_custom_name"]=project.name;globalVariablesJSON["$cube_custom_desc"]=project.desc;globalVariablesJSON["$cube_custom_uuid"]=manifestJSON.header.uuid;globalVariablesJSON["$cube_custom_version"]=0;globalVariablesJSON["$cube_custom_target_api"]=4000
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

export default CustomScreen