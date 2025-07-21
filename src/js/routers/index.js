import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/custom'
  },
  {
    path: '/custom',
    name: 'Custom',
    component: () => import('./Custom'),
    meta: {
      i: 2
    }
  },
  {
    path: '/editor',
    name: "Editor",
    redirect: "/editor/home",
    component: () => import('./Editor'),
    children: [
      {
        path: "home",
        name: "EditorHome",
        component: () => import('./EditorSidebar'),
        meta: {
          i: 4
        }
      },
      {
        path: "music",
        name: "MusicEditor",
        component: () => import('./EditorMusic'),
        meta: {
          i: 5
        }
      },
      {
        path: "bg",
        name: "BgEditor",
        component: () => import('./EditorBg'),
        meta: {
          i: 5
        }
      },
      {
        path: "settings",
        name: "SettingsEditor",
        component: () => import('./EditorSettings'),
        meta: {
          i: 5
        }
      },
      {
        path: "panel",
        name: "PanelEditor",
        component: () => import('./EditorPanel'),
        meta: {
          i: 5
        }
      },
      {
        path: "theme",
        name: "ThemeEditor",
        component: () => import('./EditorTheme'),
        meta: {
          i: 5
        }
      },
      {
        path: "word",
        name: "WordEditor",
        component: () => import('./EditorWord'),
        meta: {
          i: 5
        }
      }
    ],
    meta: {
      i: 3
    }
  },
  {
    path: '/toolbox/cps',
    name: 'CPS',
    component: () => import('./ToolboxCPS'),
    meta: {
      i: 4
    }
  },
  {
    path: '/toolbox/picture',
    name: 'PictureEditor',
    component: () => import('./ToolboxPicture'),
    meta: {
      i: 4
    }
  },
  {
    path: '/toolbox/stopwatch',
    name: 'StopWatch',
    component: () => import('./ToolboxStopWatch'),
    meta: {
      i: 4
    }
  },
  {
    path: '/toolbox/ua',
    name: 'UA',
    component: () => import('./ToolboxUA'),
    meta: {
      i: 4
    }
  },
  {
    path: '/toolbox/units',
    name: 'UintsConversion',
    component: () => import('./ToolboxUnits'),
    meta: {
      i: 4
    }
  },
  {
    path: '/toolbox/uuid',
    name: 'UUID',
    component: () => import('./ToolboxUUID'),
    meta: {
      i: 4
    }
  },
  {
    path: '/toolbox',
    name: 'Toolbox',
    component: () => import('./Toolbox'),
    meta: {
      i: 3
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./NotFound'),
    meta: {
      i: 0
    }
  }
]

const getBasePath = () => {
  return window.location.href.startsWith("https://wisebreeze.github.io") ? "/cv" : "/"
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router