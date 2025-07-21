const path = require("path");
const { DefinePlugin } = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const distPath = path.resolve(__dirname, 'dist');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const pages = ['index','404'];
function SPA(pages) {
  let htmlPath='index.html';
  return pages.map(page => {
    if (page.endsWith('/'))htmlPath = page+"index.html";
    else htmlPath=page.endsWith(".html")?page:page+".html";
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
    });
  });
}

module.exports = {
  mode: "production",// development
  devtool: "eval-cheap-module-source-map",
  entry: {
    index: path.resolve(__dirname, "src", "js/index.js")
  },
  output: {
    filename: "index_[contenthash:8].js",
    path: distPath,
    publicPath: "/"
  },
  stats: {
    errorDetails: false,
    warnings: false
  },
  resolve: {
    extensions: ['.js', '.jsx', '.vue'],
    modules: ['node_modules', 'src']
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          compilerOptions: {
            isCustomElement: tag => (tag.startsWith('mdui-') || tag.startsWith('ion-')),
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
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
    new TerserPlugin({
      extractComments: false,
      terserOptions: {
        format: {
          comments: false
        }
      }
    }),
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
};