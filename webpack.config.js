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

const config = {
  mode: process.env.NODE_ENV,
  entry: {
    app: ['@babel/polyfill', './js/main']
  },
  context: SRC_PATH,
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    //     API_ENV: JSON.stringify(process.env.API_ENV || 'local')
    //   }
    // }),
    new HtmlWebpackPlugin({
      publicPath: '/',
      template: 'index.html'
    }),
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts'],
    modules: ['node_modules', SRC_PATH]
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true // true outputs JSX tags
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot|otf|png|jpg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 20480,
              name: 'assets/[hash].[ext]'
            }
          }
        ]
      }
    ]
  }
}

module.exports = config
