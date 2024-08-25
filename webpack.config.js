const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const distPath = path.resolve(__dirname, 'dist');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const pages = ['index','404','custom/','item/','music/','theme/','variables/','bg/'];
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
      }
    });
  });
}

module.exports = {
  mode: "production",// development
  entry:{index:path.resolve(__dirname, "src", "js/index.js")},
  output:{filename:"index_[contenthash:8].js",path:distPath,publicPath:"/"},
  stats:{errorDetails:false,warnings:false},
  resolve:{extensions:['.js','.jsx']},
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(jpe?g|png|svg|gif)/i,
        type: "asset/resource",
        generator: {
          filename: 'assets/[name][ext][query]'
        }
      }
    ]
  },
  optimization: {
    splitChunks: {chunks:"all"}
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...SPA(pages),
    new TerserPlugin({
      extractComments: false,
      terserOptions: {
        format: {comments:false}
      }
    }),
  ],
  devServer: {
    historyApiFallback: true,
    client:{overlay:false},
    open: ["/custom"],
    hot: true,
    host: "localhost",
    port: 8080,
  }
};
