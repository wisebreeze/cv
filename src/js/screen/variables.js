import {fileRead,mergeObjects,throttle} from "../main"
import varObj from '../data/var'

function arraysEqual(arr1,arr2){if(!Array.isArray(arr1)&&!Array.isArray(arr2))return arr1===arr2;if(arr1.length!==arr2.length)return false;return arr1.every((v,i)=>v===arr2[i])}

function VariablesScreen(){
  var {T,useState}=cv
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

export default VariablesScreen