(function(){
mdui.setColorScheme("#778BFF");
const data = localStorage.getItem('themeType');
typeof data == "string"&&mdui.setTheme(data);

function topBar({title}){
  const [theme,setTheme] = Cube.useState(localStorage.getItem('themeType'));
  return Cube.c("div",{className:"ns",style:"position: relative;overflow: hidden"},
    Cube.c("mdui-top-app-bar",{"scroll-behavior":"elevate","scroll-target":"#content"},
      Cube.c("mdui-top-app-bar-title",{style:"margin-left:8px"},Cube.c("a",{href:"/",style:"color: inherit; text-decoration: none;"},title||"立方之窗")),
      Cube.c("div",{style:"flex-grow: 1"}),
      Cube.c("mdui-dropdown",null,
        Cube.c("mdui-button-icon",{slot:"trigger"},Cube.c("ion-icon",{attr:{name:theme==="dark"?"moon-outline":"sunny-outline"}})),
        Cube.c("mdui-menu",{selects:"single",value:theme||"auto"},
          Cube.c("mdui-menu-item",{onClick:()=>{setTheme("light");mdui.setTheme('light');localStorage.setItem('themeType',"light");},value:"light"},"浅色"),
          Cube.c("mdui-menu-item",{onClick:()=>{setTheme("dark");mdui.setTheme('dark');localStorage.setItem('themeType',"dark");},value:"dark"},"深色"),
          Cube.c("mdui-divider"),
          Cube.c("mdui-menu-item",{onClick:()=>{setTheme("auto");mdui.setTheme('auto'),localStorage.setItem('themeType',"auto");},value:"auto"},"跟随系统")
        )
      )
    )
  )
}

function home(){
  return Cube.c(Cube.fragment,null,
    Cube.c(topBar),
    Cube.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      Cube.c("div",{style:{fontSize:"32px"}},"敬请期待"),
      Cube.c("div",{style:{fontSize:"15px",marginTop:"4px"}},"该网站正在完善中…")
    )
  )
}
function errorScreen(){
  return Cube.c(Cube.fragment,null,
    Cube.c(topBar),
    Cube.c("div",{id:"content",className:"ns",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}},
      Cube.c("div",{style:{fontSize:"32px"}},"404"),
      Cube.c("div",{style:{fontSize:"15px",marginTop:"4px"}},"该页面不存在"),
      Cube.c("mdui-button",{href:"/",style:{marginTop:"8px"}},"返回首页")
    )
  )
}
function App(){
  return Cube.c(Cube.BrowserRouter,{errorComponent:errorScreen},
    Cube.c(Cube.router,{path:"/",component:home}),
  );
}
document.addEventListener("DOMContentLoaded",function(){
  const container = document.getElementById("app")
  Cube.root(App,container)
});
})()