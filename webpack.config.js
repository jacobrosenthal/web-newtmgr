'use strict';

var path = require('path');

module.exports = {
  entry: {
    main: path.join(__dirname, './src/main.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, './')
  },
  resolve: {
    alias: {
      noble$: path.join(__dirname, './noble.js'),
    }
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
