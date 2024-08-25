import {fileStructure,fileRead,downloadZip,deleteEmpty,get_uuid} from "../main"

function BottomBtn({leftFn,rightFn,leftText,rightText,leftBtn}){
  return cv.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%;padding:4px;background:rgba(var(--mdui-color-background-light),0.25)"},
    leftBtn?leftBtn:cv.c("mdui-button",{onClick:leftFn,style:"margin-right:8px;box-sizing:border-box;width:calc(50% - 8px);",variant:"outlined"},leftText),
    cv.c("mdui-button",{onClick:rightFn,style:"width:50%;box-sizing:border-box;width:calc(50% - 8px)",variant:"filled"},rightText)
  )
}

function ItemScreen(){
  var {T} = cv

  const confirmExit=function(e){e.returnValue="你确定要退出表单提交吗？";return "你确定要退出表单提交吗？"}
  window.addEventListener('beforeunload',confirmExit);
  const quitBtn=function(){
    mdui.dialog({
      headline:T("custom$exit$title"),
      description:T("custom$exit$desc"),
      closeOnEsc:true,closeOnOverlayClick:true,
      actions:[{text:T("gui$cancel")},{text:T("gui$exit"),onClick:function(){window.removeEventListener('beforeunload',confirmExit);cv.skipRouter("/custom")}}]
    })
  }
  const downloadBtn=function(){
    mdui.dialog({
      headline:T("gui$download"),
      description:T("custom$download$desc"),
      closeOnEsc:true,closeOnOverlayClick:true,
      actions:[{text:T("gui$cancel")},{text:T("gui$confirm"),onClick:async function(){var uuid=get_uuid(),manifestFile=fileRead("manifest.json"),manifestJSON=JSON.parse(manifestFile.content);manifestJSON.header.uuid=uuid;manifestJSON.modules[0].uuid=get_uuid();manifestFile.content=JSON.stringify(manifestJSON);var globalVariablesFile=fileRead("ui/_global_variables.json"),globalVariablesJSON=JSON.parse(globalVariablesFile.content);globalVariablesJSON["$cube_custom_uuid"]=uuid;globalVariablesFile.content=JSON.stringify(globalVariablesJSON);window.removeEventListener('beforeunload',confirmExit);deleteEmpty(fileStructure);await downloadZip(fileStructure)}}]
    })
  }
  function toMusic(){cv.skipRouter("/music")}
  function toVariables(){cv.skipRouter("/variables")}
  function toTheme(){cv.skipRouter("/theme")}
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
        cv.c(card,{icon:"brush",title:T("theme$title"),onClick:toTheme})
      )),
    ),
    cv.c(BottomBtn,{leftFn:quitBtn,rightFn:downloadBtn,leftText:T("gui$exit"),rightText:T("gui$download")})
  )
}

export {ItemScreen as default,BottomBtn}