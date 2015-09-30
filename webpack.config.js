var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: './client/connect.js',
  output:  {
    path: path.resolve(__dirname, 'webpack/'),
    filename: 'connect.min.js',
    publicPath: '/js'
  },
  devtool: 'source-map'
};
