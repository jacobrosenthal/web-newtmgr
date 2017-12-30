'use strict';

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var path = require('path');

module.exports = {
  plugins: [
    new UglifyJsPlugin()
  ],
  entry: {
    main: path.join(__dirname, './src/main.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, './')
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  },
  bail: true
};
