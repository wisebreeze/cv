import 'mdui/mdui.css'
import "../css/simpleCrop.scss"
import "../css/style.scss"

import icon from "../image/icon.png"
document.querySelector("link[rel='icon']").href=icon
document.querySelector("link[rel='shortcut icon']").href=icon
document.querySelectorAll("meta[name='apple-touch-icon-precomposed']").forEach(e=>e.href=icon)

import "./cv/index"
import "./main"
