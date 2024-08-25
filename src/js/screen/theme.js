import {fileRead,mergeObjects,throttle} from "../main"
import themeObj from '../data/theme'

const tool = {
  addHandler(t,e,h){if(t.addEventListener)t.addEventListener(e,h,{passive:false});else if(t.attachEvent)t.attachEvent('on'+e,h);else t['on'+e]=h},
  removeHandler(t,e,h){if(t.removeEventListener)t.removeEventListener(e,h,false);else if(t.detachEvent)t.detachEvent('on'+e,h);else t['on'+e]=null},
  clamp(v,a,b){return v<a?a:(v>b?b:v)},
  trimZero(s){return s.replace(/\.?0*$/, '')},
  alphaFixed(a,b=0,c=255){return Math.min(c,Math.max(b,Number.parseFloat((a*255).toFixed())))},
  regex:{hex:/^#?([0-9A-F]{6}|[0-9A-F]{3})([0-9A-F]{2})?$/i,a:/^\d*$/,b:/^\d*$/,c:/^\d*$/,alpha:/^(0(\.\d+)?|1(\.0+)?)$/},
  color:{
    hsbtohsl(s,l,r){var t={h:s};return t.l=(2-l)*r,t.s=l*r,t.l<=1&&t.l>0?t.s/=t.l:t.s=t.s/(2-t.l)||0,t.l/=2,t.s>1&&(t.s=1),t},
    hsltorgb(r,n,t){r/=360;var e,u,i;if(0==n)e=u=i=t;else{var s=function(r,n,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+6*(n-r)*t:t<.5?n:t<2/3?r+(n-r)*(2/3-t)*6:r},c=t<.5?t*(1+n):t+n-t*n,f=2*t-c;e=s(f,c,r+1/3),u=s(f,c,r),i=s(f,c,r-1/3)}return{r:e,g:u,b:i}},
    rgbtohex(r,g,b){return"#"+(16777216|255*b|255*g<<8|255*r<<16).toString(16).slice(1)},
    hextohsb(t){var s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;t=t.replace(/^#/,""),t=3===t.length?t.replace(/(.)/g,"$1$1"):t,8===t.length&&(s=parseInt(t.substr(6,2),16)/255,t=t.substring(0,6));var r=parseInt(t.substr(0,2),16)/255,e=parseInt(t.substr(2,2),16)/255,a=parseInt(t.substr(4,2),16)/255,n=Math.max(r,e,a),u=n-Math.min(r,e,a),c=n?u/n:0;switch(n){case r:return[(e-a)/u%6*60||0,c,n,s];case e:return[60*((a-r)/u+2)||0,c,n,s];case a:return[60*((r-e)/u+4)||0,c,n,s]}},
    rgbtohsb(t){var r=t.r,a=t.g,n=t.b,b=Math.max(r,a,n),h=b-Math.min(r,a,n),i=0===h?0:h&&b===r?(a-n)/h:b===a?2+(n-r)/h:4+(r-a)/h;return[60*(i<0?i+6:i),b&&h/b*1,1*b]},
    hsltohsb(t){var s=t.h,h=t.s,n=t.l,r=s,i=h*Math.min(n,1-n)+n;return[r,i?2-2*n/i:0,i]}
  }
}
class DragContext {
  constructor({$context,$dragger,doms,name,direction,initX,initY}){
    this.doms = doms;
   	this.$context = $context;
    this.$dragger = $dragger;
    this.name = name;
    this.direction = direction;
    this.isDragging = false;
    this.addMousedown();
    this.addMousemove();
    this.addMouseup();
    this.x = initX || 0;
    this.y = initY || 0;
    this.$dragger.style.transform=`translate(${this.$context.getBoundingClientRect().width}px,0)`;
    this.x=this.$context.getBoundingClientRect().width
  }
  getName(){return this.name}
  addMousedown(){
    const event=e=>{e.preventDefault();this.setStyles(e);this.isDragging=true}
    this.downEvent=event;
    tool.addHandler(this.$context,'mousedown',event);
    tool.addHandler(this.$context,'touchstart',event);
  }
  addMousemove(){
    const event=e=>{if(this.isDragging)this.setStyles(e)};
    this.moveEvent=event;
    tool.addHandler(document,'mousemove',event);
    tool.addHandler(document,'touchmove',event);
  }
  addMouseup(){
    const event=e=>{this.isDragging=false};
    tool.addHandler(document,'mouseup',event);
    tool.addHandler(document,'touchend',event);
  }
  setStyles(e){this.setDraggerStyles(e);this.doms.render.adjust()}
  valueOf(){var t=this.$context.getBoundingClientRect().width,i=this.$context.getBoundingClientRect().height;switch(this.direction){case"horizontal":return"alpha"===this.name?this.x/t:1-this.x/t;case"vertical":return this.y/i;case"both":return[this.x/t,1-this.y/i]}}
  setValue(t){var i=this.$context.getBoundingClientRect().width,e=this.$context.getBoundingClientRect().height;switch(this.x=0,this.y=0,this.direction){case"horizontal":this.x="alpha"===this.name?i*t:(1-t/360)*i;break;case"vertical":this.y=(1-t/360)*e;break;case"both":this.x=i*t[0],this.y=e*(1-t[1])}this.$dragger.style.transform="translate("+this.x+"px, "+this.y+"px)"}
  setDraggerStyles(t){switch(this.x=tool.clamp((t.touches?t.touches[0].clientX:t.clientX)-this.$context.getBoundingClientRect().left,0,this.$context.getBoundingClientRect().width),this.y=tool.clamp((t.touches?t.touches[0].clientY:t.clientY)-this.$context.getBoundingClientRect().top,0,this.$context.getBoundingClientRect().height),this.direction){case"horizontal":this.$dragger.style.transform="translate("+this.x+"px, 0)";break;case"vertical":this.$dragger.style.transform="translate(0, "+this.y+"px)";break;case"both":this.$dragger.style.transform="translate("+this.x+"px, "+this.y+"px)"}}
}
class StyleRenderer {
  constructor(dom,doms,contexts,obj){
    this.select="hex";
    this.doms=doms;this.obj=obj;this.useAlpha=!obj.desc.endsWith("color");this.useColor=!obj.desc.endsWith("alpha");
    this.doms.preview=dom.querySelector('.preview');
    this.doms.uploadBtn=dom.querySelector('.upload-button');
    this.doms.uploadInput=dom.querySelector('.upload-input');
    if(!this.useColor){
      this.doms.alphaDom=dom.nextElementSibling;
      this.alpha=tool.alphaFixed(obj.a);
      this.doms.alphaInput=this.doms.alphaDom.querySelector(".colorInput");
      this.doms.alphaSlider=this.doms.alphaDom.querySelector(".alphaSlider");
      this.doms.alphaInput.value=this.alpha;this.doms.alphaSlider.value=this.alpha;
      this.doms.alphaDom.style.display="block";dom.style.display="none";var self=this;
      tool.addHandler(this.doms.alphaDom,"input",e=>{this.doms.alphaInput.value=e.target.value;this.doms.alphaSlider.value=e.target.value;self.setAlpha(e.target.value)});this.setAlpha(this.alpha);return
    }
    tool.addHandler(this.doms.uploadBtn,"click",_=>this.doms.uploadInput.click())
    tool.addHandler(this.doms.uploadBtn,"ondrop",e=>{e.preventDefault();this.doms.uploadInput.files=e.dataTransfer.files})
    tool.addHandler(this.doms.uploadBtn,"ondragover",e=>e.preventDefault())
    tool.addHandler(this.doms.uploadInput,"change",e=>this.imageExtract(e,doms))
    this.doms.result={hex:dom.querySelector('.hex'),rgb:dom.querySelector('.rgb'),hsl:dom.querySelector('.hsl')}
    this.contexts=contexts;
    if(obj.c){
      var hsb=tool.color.rgbtohsb({r:obj.c[0],g:obj.c[1],b:obj.c[2]});
      this.contexts.forEach(e=>{if(e.name=="alpha")return;e.setValue(e.name==="hue"?hsb[0]:[hsb[1],hsb[2]])})
    }
    if(obj.a)this.contexts.forEach(e=>{if(e.name=="alpha")e.setValue(obj.a)});
    if(!this.useAlpha)this.contexts.forEach(e=>{if(e.name=="alpha"){e.$context.style.opacity=0.4;tool.removeHandler(e.$context,"mousedown",e.downEvent);tool.removeHandler(e.$context,"touchstart",e.downEvent);tool.removeHandler(e.$context,"mousemove",e.moveEvent);tool.removeHandler(e.$context,"touchstart",e.moveEvent)}});
    this.doms.input=[...dom.querySelectorAll(".colorInputStack>*")].reduce((a,e)=>{a[e.getAttribute("type")]=e;a.arr.push(e);return a},{arr:[]})
    Object.keys(this.doms.input).forEach(k=>{if(k==="arr")return;var $this=this;tool.addHandler(this.doms.input[k].children[0],"change",function(e){$this.adjust(k,e.target.value,e.target)})})
    this.switchColor();
    Object.keys(this.doms.result).forEach(k=>{var $this=this;
      tool.addHandler(this.doms.result[k],'click',function(){$this.select=k;$this.switchColor(k==="hex",k)});
    });
    this.useColor&&this.adjust();
  }
  switchColor(isHex=true,a,s){
    this.doms.input.arr.forEach(e=>{if(e.getAttribute("type")!=="hex")e.style.display=isHex?"none":(!this.useAlpha&&e.getAttribute("type")==="alpha"?"none":"block");else e.style.display=isHex?"block":"none"});
    if(!isHex){var $this=this;
      function setText(b,c){$this.doms.input[b].children[1].childNodes[0].nodeValue=a.split("")[c]}
      setText("a",0);setText("b",1);setText("c",2)
      this.adjust()
    }
  }
  imageExtract(e,s){
    var f=e.target.files[0];s=s.render;
    if(!f.type.startsWith("image/"))return;
    var r=new FileReader();
    r.readAsDataURL(f);
    r.onload=function(){var i=new Image();i.src=r.result;mdui.getColorFromImage(i).then(c=>s.adjust("hex",c))}
  }
  adjust(type,value,target){
    if(!type){
      // 色相
      this.hue=360*this.contexts.filter(context=>context.getName()==='hue')[0].valueOf();
      // 饱和度和明度
      [this.saturation,this.brightness]=this.contexts.filter(context=>context.getName()==='color')[0].valueOf();
      // 不透明度
      this.alpha=this.contexts.filter(context=>context.getName()==='alpha')[0].valueOf();
    }else{var self=this;
      if(tool.regex[type].test(value)){
        if(type==="hex")[this.hue,this.saturation,this.brightness,this.alpha]=tool.color.hextohsb(value);
        else if(type==="alpha")this.alpha=Number.parseFloat(value);
        else{
          value=Math.min(this.select=="rgb"?255:type=="a"?360:100,Math.max(0,Number.parseFloat(value)))
          target.value=value
          this[this.select][this.select[type=="a"?0:type=="b"?1:2]]=(this.select=="hsl"&&type=="a"?360:(value/(this.select=="rgb"?255:100)))
          var hsb=this.select=="rgb"?tool.color.rgbtohsb(this.rgb):tool.color.hsltohsb(this.hsl)
          this.hue=hsb[0]
          this.saturation=hsb[1]
          this.brightness=hsb[2]
        }
      }else return
      this.contexts.forEach(e=>{if(e.name!=="color")e.setValue(self[e.name]);else e.setValue([self.saturation,self.brightness])})
    }
    // 计算出hex, rgb, hsl的值
    this.hsl=type&&this.select==="hsl"?this.hsl:tool.color.hsbtohsl(this.hue,this.saturation,this.brightness);
    this.rgb=type&&this.select==="rgb"?this.rgb:tool.color.hsltorgb(this.hsl.h,this.hsl.s,this.hsl.l);
    this.hex=type==="hex"?value:tool.color.rgbtohex(this.rgb.r,this.rgb.g,this.rgb.b);
    // hex值简化
    if(type!=="hex"&&this.useAlpha)this.hex=this.hex+Math.round(tool.trimZero(this.alpha.toFixed(2))*255).toString(16).padStart(2,'0');
    const simplifyHex=/^#(?:([da-f])1){3}$/.exec(this.hex);
    if(simplifyHex!==null)this.hex=`#${this.hex[1]}${this.hex[3]}${this.hex[5]}`;
    this.setStyles()
  }
  setInput(k,v){this.doms.input[k].children[0].value=v}
  setStyles(){
    const round = Math.round;
    const rgbValues = `${round(this.rgb.r * 255)}, ${round(this.rgb.g * 255)}, ${round(this.rgb.b * 255)}`;
    const alphaValue = tool.trimZero(this.alpha.toFixed(2));
    const hslaColor = `hsla(${round(this.hsl.h % 360)}, ${round(this.hsl.s * 100)}%, ${round(this.hsl.l * 100)}%${this.useAlpha?", "+alphaValue:""})`;
    const rgbColor = `rgb(${rgbValues})`;
    this.doms.preview.style.background =
      `linear-gradient(${hslaColor}, ${hslaColor}) 0 0 / cover,
      linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 12px 12px,
      linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 6px 6px / 12px 12px`;
    this.doms.$picker.parentNode.parentNode.parentNode.querySelector(".colorPreview").style.background=this.doms.preview.style.background;
    if(this.useAlpha)this.doms.$palletes
      .filter(element => element.getAttribute('name') === 'alpha')[0]
      .style.background =
        `linear-gradient(to right, rgba(0,0,0,0), ${rgbColor}) 0 0 / cover,
        linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 10px 10px,
        linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 5px 5px / 10px 10px`;
    this.doms.$picker.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`;
    // 结果
    this.setInput("hex",this.hex)
    var hslRegex=/hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)/;
    var hsl=hslaColor.match(hslRegex)
    this.setInput("a",round(this.select=="hsl"?hsl[1]:this.rgb.r*255))
    this.setInput("b",round(this.select=="hsl"?hsl[2]:this.rgb.g*255))
    this.setInput("c",round(this.select=="hsl"?hsl[3]:this.rgb.b*255))
    this.obj.modify=!(!this.obj.def||this.hex===this.obj.def);
    if(!this.obj.def)this.obj.def=this.hex;
    this.obj.c=[this.rgb.r,this.rgb.g,this.rgb.b].map(e=>Number.parseFloat(tool.trimZero(e.toFixed(3))));
    if(this.useAlpha){this.obj.a=Number.parseFloat(alphaValue);}
    this.setInput("alpha",alphaValue);
    this.doms.result.hex.innerHTML=this.hex;
    this.doms.result.rgb.innerHTML=`rgba(${round(this.rgb.r * 255)}, ${round(this.rgb.g * 255)}, ${round(this.rgb.b * 255)}${this.useAlpha?", "+alphaValue:""})`;
    this.doms.result.hsl.innerHTML=hslaColor;
  }
  setAlpha(alpha){
    alpha=Number.parseFloat(tool.trimZero((alpha/255).toFixed(2)))
    this.doms.alphaDom.parentNode.parentNode.querySelector(".colorPreview").style.background =
      `linear-gradient(rgba(0,0,0,${alpha}), rgba(0,0,0,${alpha})) 0 0 / cover,
      linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 12px 12px,
      linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 6px 6px / 12px 12px`;
    // 结果
    this.obj.modify=!(!this.obj.def||alpha===this.obj.def);
    if(!this.obj.def)this.obj.def=this.obj.a;
    this.obj.a=alpha;
  }
}
function kickPicker(e,r,t){var c=e.querySelector(".color-palette"),o=e.querySelector(".color-pointer");r.$picker=c,r.$indicator=o;var i=c.getAttribute("name"),n=new DragContext({$context:c,$dragger:o,doms:r,name:i,direction:"both"});t.push(n)}
function _toConsumableArray(r){if(Array.isArray(r)){for(var e=0,t=Array(r.length);e<r.length;e++)t[e]=r[e];return t}return Array.from(r)}function kickSliders(r,e,t){var a=Array.prototype.slice.call(r.querySelectorAll(".slider")),l=Array.prototype.slice.call(r.querySelectorAll(".sliderBox"));e.$palletes=a,e.$sliders=l;var n=a.map(function(r){var t=r.getAttribute("name"),a=l.filter(function(r){return r.getAttribute("name")===t})[0];return new DragContext({$context:r,$dragger:a,doms:e,name:t,direction:"horizontal",initX:0})});t.push.apply(t,_toConsumableArray(n))}

function ThemeScreen(){
  var {T,useState,useRef}=cv

  const [searchText,setSearchText]=useState("")
  var isOpenEl={},hasOption=item=>typeof item==="object"&&item!==null&&(item.hasOwnProperty('name')&&item.name.toLowerCase().includes(searchText.toLowerCase()))||(item.hasOwnProperty("desc")&&item.desc.toLowerCase().includes(searchText.toLowerCase())),
  isEmptyResult=searchText.trim()!==""&&!themeObj.some(item=>item.content.some(hasOption))
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
      cv.c("mdui-list-item",{slot:"header",description:data.desc,rounded:true},cv.c("b",null,data.title)),
      cv.c("mdui-list",null,
        data.content.map(function(e){
          var content=useRef();content.isOpen=false;content.uuid=e.name;
          function accordion(){
            if(!content.isInit){
              content.current.innerHTML=`
<div class="palettePanel">
  <div class="color-palette" name="color"><div class="color-pointer" name="color"></div></div>
  <div class="preview"></div>
  <div class="hue slider" name="hue"><div class="sliderBox" name="hue"></div></div>
  <div class="alpha slider" name="alpha"><div class="sliderBox" name="alpha"></div></div>
  <div class="colorInputPanel">
    <div class="colorInputStack">
      <div type="a"><input class="colorInput" name="a" type="number"><div>r</div></div>
      <div type="b"><input class="colorInput" name="b" type="number"><div>g</div></div>
      <div type="c"><input class="colorInput" name="c" type="number"><div>b</div></div>
      <div type="alpha"><input class="colorInput" name="alpha" type="number"><div>a</div></div>
      <div type="hex"><input class="colorInput" name="hex" maxlength="9" type="text"/><div>hex</div></div>
    </div>
    <mdui-dropdown><mdui-button variant="tonal" slot="trigger" style="padding:5px;height:3rem;width:1.8rem"><ion-icon style="font-size:1.5rem" name="chevron-expand-outline" /></mdui-button><mdui-menu dense><mdui-menu-item class="hex result">#ff0000</mdui-menu-item><mdui-menu-item class="rgb result">rgb(255, 255, 255)</mdui-menu-item><mdui-menu-item class="hsl result">hsl(0, 100%, 50%)</mdui-menu-item></mdui-menu></mdui-dropdown>
  </div>
  <mdui-button class="upload-button">上传图片并取色</mdui-button>
  <input class="upload-input" type="file" accept="image/*">
</div>
<div class="palettePanel" type="alpha"><div class="sliderFlex"><input class="colorInput" type="number" name="alpha" /><mdui-slider class="alphaSlider" max="255" nolabel></div></mdui-slider></div>`;
              const dom=content.current.children[0],doms={},context=[];
              kickPicker(dom,doms,context);
              kickSliders(dom,doms,context);
              doms.render=new StyleRenderer(dom,doms,context,e);
              content.isInit=true
            }
            content.current.style.height=!content.isOpen?content.current.scrollHeight+"px":0;
            if(content.uuid!==isOpenEl.uuid&&!content.isOpen){isOpenEl.isOpen=false;if(isOpenEl.current)isOpenEl.current.style.height=0;isOpenEl=content}
            content.isOpen=!content.isOpen
          }
          if(!e)return searchText.trim()===""&&cv.c("mdui-divider");
          else{var name=e.name+(e.desc.includes("default")?" (默认)":e.desc.includes("hover")?" (悬停)":e.desc.includes("pressed")?" (按下)":"");return (searchText.trim()===""||name.toLowerCase().includes(searchText.toLowerCase())||e.hasOwnProperty("desc")&&e.desc.toLowerCase().includes(searchText.toLowerCase()))&&cv.c("div",null,cv.c("mdui-list-item",{rounded:true,onClick:accordion,description:e.desc||""},name,cv.c("div",{slot:"end-icon",style:(function(){var c=(typeof e.c==="object"?e.c.map(e=>e*255):[0,0,0]).join(","),a=typeof e.a==="number"?e.a:1;return `background:linear-gradient(rgba(${c},${a}),rgba(${c},${a})) 0 0 / cover,linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 0 0 / 12px 12px,linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,0.25) 0) 6px 6px / 12px 12px`}).call(),className:"colorPreview"})
        ),cv.c("div",{ref:content,style:"overflow:hidden;height:0;transition: height 0.15s cubic-bezier(0.55, 0.06, 0.68, 0.19) 0s;"},"loading..."
        ))}})
      )
    )
  }
  function deployment(){
    let globalVariablesFile=fileRead("ui/_global_variables.json"),
    globalVariablesJSON=JSON.parse(globalVariablesFile.content),
    tempVar={},detect=[];
    themeObj.forEach(i=>i.content.forEach(e=>{
      if(e===0)return;
      var hasColor=e.desc.endsWith("color"),hasAlpha=e.desc.endsWith("alpha");
      if(e.modify){if(typeof e.c=="object")tempVar["$cube_"+e.desc+(hasColor?'':'_color')]=e.c;if(typeof e.a=="number")tempVar["$cube_"+e.desc+(hasAlpha?'':'_alpha')]=e.a}
      else if(e.modify===false){if(typeof e.c=="object")detect.push("$cube_"+e.desc+(hasColor?'':'_color'));if(typeof e.a=="number")detect.push("$cube_"+e.desc+(hasAlpha?'':'_alpha'))}
    }))
    globalVariablesJSON=Object.keys(globalVariablesJSON).reduce((acc,key)=>{
      if(!detect.includes(key))acc[key]=globalVariablesJSON[key];
      return acc
    },{})
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
      cv.c("h1",null,T("theme$title")),
      cv.c("div",{style:"margin:0 0 5px 0;position:sticky;top:0;z-index:10"},cv.c("mdui-text-field",{label:T("theme$search"),clearable:!0,onInput:search})),
      cv.c("div",{style:"background:rgba(var(--mdui-color-primary-dark), 0.2);border-radius:var(--mdui-shape-corner-medium);padding:0 5px;"},cv.c("mdui-list",null,cv.c("mdui-collapse",{accordion:!0},
        themeObj.map(d=>cv.c(partition,{data:d})),
        isEmptyResult&&cv.c("b",{style:'display:flex;justify-content:center;width:100%'},T("setting$empty"))
      )))
    )),
    cv.c("div",{style:"position: fixed;bottom: 0;display:flex;width: 100%;z-index:1000;padding:4px"},
      cv.c("mdui-button",{onClick:save,style:"box-sizing:border-box;width:calc(100% - 8px)",variant:"filled"},T("gui$save"))
    )
  )
}

export default ThemeScreen