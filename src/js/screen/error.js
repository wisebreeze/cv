function ErrorScreen(){
  return (<>
    <div id="content" className="ns" style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"}}>
    <div style={{fontSize:"32px"}}>404</div>
    <div style={{fontSize:"15px",marginTop:"4px"}}>{T("e$title")}</div>
    <mdui-button href="/" style={{marginTop:"8px"}}>{T("e$back")}</mdui-button></div>
  </>)
}

export default ErrorScreen