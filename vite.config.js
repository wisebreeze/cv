import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import JSON5 from 'json5'
import markdownPlugin from './src/js/markdownPlugin.js'

function json5Plugin() {
  return {
    name: 'cubevisage-json5',
    enforce: 'pre',
    configResolved(config) {
      const jsonPlugin = config.plugins.find(p => p.name === 'vite:json')
      if (jsonPlugin) {
        jsonPlugin.transform = undefined
        jsonPlugin.load = undefined
      }
    },
    load(id) {
      if (!id.endsWith('.json')) return null
      const raw = readFileSync(id, 'utf-8')
      const parsed = JSON5.parse(raw)
      return `export default ${JSON.stringify(parsed)}`
    }
  }
}

export default defineConfig({
  plugins: [
    json5Plugin(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => (tag.startsWith('mdui-') || tag.startsWith('ion-')),
          preserveWhitespace: false
        }
      }
    }),
    markdownPlugin(),
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@markdown': resolve(__dirname, 'src/markdown')
    },
    extensions: ['.js', '.jsx', '.vue', '.json', '.md']
  },
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: {
    host: 'localhost',
    port: 8080,
    strictPort: true
  },
  base: process.env.PUBLIC_PATH || '/'
})
