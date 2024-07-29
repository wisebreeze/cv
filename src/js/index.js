import 'mdui/mdui.css'
import "../res/css/simpleCrop.scss"
import "../res/css/style.scss"

import icon from "../res/image/icon.png"
document.querySelector("link[rel='icon']").href=icon
document.querySelector("link[rel='shortcut icon']").href=icon
document.querySelectorAll("meta[name='apple-touch-icon-precomposed']").forEach(e=>e.href=icon)

import "./cv.js"
import "./main.js"