const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "development",
  entry:{index:path.resolve(__dirname, "src", "index.js")},
  stats:{errorDetails:false,warnings:false},
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.(jpe?g|png|svg|gif)/i,
        type: "asset/resource",
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      }
    ]
  },
  optimization: {
    splitChunks: {chunks:"all"}
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      }
    }),
    new TerserPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    client:{overlay:false},
    open: ["/custom"],
    hot: true,
    host: "localhost",
    port: "8080",
  }
};