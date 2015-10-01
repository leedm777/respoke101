var path = require('path');
var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
  entry: [
    './client/respoke-training.js'
  ],
  output:  {
    path: path.resolve(__dirname, 'webpack/'),
    filename: 'respoke-training.min.js',
    publicPath: '/'
  },
  devtool: 'source-map',
  plugins: [
    //new ngAnnotatePlugin({add: true}),
    //new webpack.optimize.UglifyJsPlugin()
  ]
};
