const currentTask = process.env.npm_lifecycle_event
const path = require("path")
const Dotenv = require("dotenv-webpack")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const fse = require("fs-extra")

//prettier-ignore
const postCSSPlugins = [
  require("postcss-import"),
  require("postcss-simple-vars"),
  require("postcss-nested"),
  require('postcss-extend'),
  require("postcss-color-mod-function"),
  require("autoprefixer")
]

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy files", function () {
      fse.copySync("./app/assets/fonts", "./dist/assets/fonts")
      fse.copySync("./app/favicon.ico", "./dist/favicon.ico")
    })
  }
}

let cssConfig = {
  test: /\.css$/,
  exclude: /(node_modules)/,
  use: ["css-loader?url=false", {loader: "postcss-loader", options: {postcssOptions: {plugins: postCSSPlugins}}}]
}

let config = {
  entry: "./app/Main.js",
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "app"),
    filename: "bundled.js"
  },
  plugins: [new Dotenv(), new HtmlWebpackHarddiskPlugin()],
  mode: "development",
  module: {
    rules: [
      cssConfig,
      {
        test: /\.(woff|woff2|eot|ttf|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader"
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react", ["@babel/preset-env", {targets: {node: "12"}}]]
          }
        }
      }
    ]
  }
}

if (currentTask == "dev" || currentTask == "webpackDev") {
  cssConfig.use.unshift("style-loader")
  config.devtool = "source-map"
  config.devServer = {
    port: 3000,
    contentBase: path.join(__dirname, "app"),
    hot: true,
    historyApiFallback: {index: "index.html"}
  }
  config.plugins.push(
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "app/index-dev-template.html",
      alwaysWriteToDisk: true
    })
  )
}

if (currentTask == "build" || currentTask == "webpackBuild") {
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({filename: "styles.[chunkhash].css"}),
    new RunAfterCompile(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "app/index-build-template.html",
      alwaysWriteToDisk: true
    })
  )
  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  config.mode = "production"
  config.output = {
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js"
  }
  config.optimization = {
    splitChunks: {chunks: "all"},
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()]
  }
}

module.exports = config
