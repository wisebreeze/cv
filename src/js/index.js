import 'mdui/mdui.css'
import "../css/style.scss"
import "../css/simpleCrop.scss"

import icon from "../image/icon.png"
document.querySelector("link[rel='icon']").href=icon
document.querySelector("link[rel='shortcut icon']").href=icon
document.querySelectorAll("meta[name='apple-touch-icon-precomposed']").forEach(e=>e.href=icon)

import { createApp } from 'vue'
import App from './routers/App'
import i18n from './i18n'
import router from './routers/index'
import * as mdui from 'mdui'
window.mdui = mdui

const app = createApp(App);
app.use(i18n).use(router).mount('#app');