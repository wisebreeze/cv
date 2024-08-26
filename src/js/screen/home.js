import logo from "../../image/icon.png"

var {T,useEffect}=cv
const HomeRef={current:{}}
const HomeContent={current:{}}
let contentHeight=0;
const setHomeHight=(init=!1)=>{
  if(!HomeContent.current.children)return;
  if(init)HomeContent.current.children[0].classList.add("current");
  //const header = document.querySelector("mdui-top-app-bar");
  contentHeight = window.innerHeight;//-header.offsetHeight
  HomeRef.current.style.height = `${contentHeight}px`;
  HomeContent.current.style.transition = "transform 0.25s ease";
  HomeContent.current.style.height = `${contentHeight*HomeContent.current.children.length}px`
}
window.addEventListener("resize",setHomeHight)

// 数据
let part = 0;

// 事件
let isSwiping = false;
let startPosition = 0;
let currentPosition = 0;
// 定义变量来存储起始触摸位置
var startY,endY;
function touchstart(e){
  e.preventDefault();
  if(e.touches.length>0){
    startY = e.touches[0].clientY;
  }
}
function updatePart(value){
  if(value > 60)part--;
  else if(value < -60)part++;
  else return;
  part = Math.max(0,Math.min(3,part));
  HomeContent.current.style.transform = `translateY(${-part*contentHeight}px)`
  HomeContent.current.children.forEach((e,i)=>{
    if(i===part)e.classList.add("current");
    else e.classList.remove("current")
  })
}
function touchend(event){
  if (event.changedTouches.length > 0) {
    endY = event.changedTouches[0].clientY;
    var displacement = endY - startY;
    updatePart(displacement)
  }
}
const wheel=e=>updatePart(e.deltaY);

function HomeScreen(){
  const useNewHome = false;
  if(useNewHome)useEffect(setHomeHight.bind(this,!0),[]);
  return useNewHome?(<>
    <div className="HomeScreen" onTouchstart={touchstart} onTouchend={touchend} onWheel={wheel} ref={HomeRef}><div className="Home" ref={HomeContent}>
    <div className="part">
      <img className="logo" src={logo} alt="logo"/>
      <p>测试</p>
      <mdui-button>下载</mdui-button>
      <mdui-button>自定义</mdui-button>
    </div>
    <div className="part" style="background:#eeffee;">测试</div>
    <div className="part"></div>
    <div className="part"></div>
  </div></div></>):
  (<>
    <div id="content" className="ns" style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}}>
      <div style={{fontSize:"32px"}}>{T("gui$coming")}</div>
      <div style={{fontSize:"15px",marginTop:"4px"}}>{T("gui$comingDesc")}</div>
    </div>
  </>)
}

export default HomeScreen