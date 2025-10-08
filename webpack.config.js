const path = require("path")
const { DefinePlugin } = require("webpack")
const { VueLoaderPlugin } = require("vue-loader")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { EsbuildPlugin } = require('esbuild-loader')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const distPath = path.resolve(__dirname, 'dist')

// const TerserPlugin = require('terser-webpack-plugin')
const pages = ['index','404']
function SPA(pages) {
  let htmlPath='index.html'
  return pages.map(page => {
    if (page.endsWith('/'))htmlPath = page+"index.html"
    else htmlPath=page.endsWith(".html")?page:page+".html"
    return new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, "dist", htmlPath),
      template: path.resolve(__dirname, "src", "index.html"),
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      chunks: [page]
    })
  })
}

module.exports = {
  mode: "production",// development
  devtool: process.env.NODE_ENV === 'production' 
    ? false 
    : 'source-map',
  entry: {
    index: path.resolve(__dirname, "src", "js/index.js")
  },
  output: {
    filename: "index_[contenthash:8].js",
    path: distPath,
    publicPath: process.env.PUBLIC_PATH || "/"
  },
  stats: {
    errorDetails: false,
    warnings: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@markdown': path.resolve(__dirname, 'src/markdown')
    },
    extensions: ['.js', '.jsx', '.vue'],
    modules: ['node_modules', 'plugins']
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader",
        {
          loader: "sass-loader",
          options: {
            implementation: require('sass-embedded')
          }
        }]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        include: path.resolve(__dirname, './src/js'),
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            isCustomElement: tag => (tag.startsWith('mdui-') || tag.startsWith('ion-')),
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.md$/,
        include: path.resolve(__dirname, './src/markdown'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                isCustomElement: tag => (tag.startsWith('mdui-') || tag.startsWith('ion-')),
                preserveWhitespace: false
              }
            }
          },
          {
            loader: path.resolve(__dirname, 'src/js/markdown-loader.js')
          }
        ]
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'jsx',
              target: 'es2020'
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|svg|gif)/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext][query]"
        }
      },
      {
        test: /\.json$/,
        loader: 'json5-loader',
        exclude: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.txt$/,
        loader: 'raw-loader'
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
    }),
    new VueLoaderPlugin(),
    ...SPA(pages),
    new EsbuildPlugin({
      css: true
    })
    /*new TerserPlugin({
      parallel: true,
      extractComments: false,
      terserOptions: {
        format: {
          comments: false
        }
      }
    }),*/
  ],
  devServer: {
    historyApiFallback: true,
    client: {
      overlay: false
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    },
    //open: ["/custom"],
    hot: true,
    host: "localhost",
    port: 8080,
  }
}