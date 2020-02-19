var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var ENTRY_PATH = path.resolve(ROOT_PATH, 'src/js/main.mjs');
var SRC_PATH = path.resolve(ROOT_PATH, 'src');
var JS_PATH = path.resolve(ROOT_PATH, 'src/js');
var TEMPLATE_PATH = path.resolve(ROOT_PATH, 'src/index.html');
var SHADER_PATH = path.resolve(ROOT_PATH, 'src/shaders');
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');

var debug = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'A terrible RTS game',
      template: TEMPLATE_PATH
    }),
    new ScriptExtHtmlWebpackPlugin({
      module: ['bundle.js']
    }),
    new webpack.DefinePlugin({
      __DEV__: debug
    })
  ],
  resolve: {
    root: [JS_PATH, SRC_PATH]
  },
  module: {
    loaders: [
      {
        test: /\.(js|mjs)$/,
        include: JS_PATH,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: ["@babel/preset-env", "@babel/preset-react"]
        }
      },
      {
        test: /\.glsl$/,
        include: SHADER_PATH,
        loader: 'webpack-glsl'
      }
    ]
  },
  debug: debug,
  devtool: debug ? 'eval-source-map' : 'source-map'
};
