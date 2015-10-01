var WebpackDevServer = require('webpack-dev-server');
var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

webpackConfig.entry.unshift("webpack-dev-server/client?http://localhost:3000");

// The development server (the recommended option for development)
gulp.task("default", ["webpack-dev-server"]);

gulp.task('webpack', function(done) {
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      // output options
    }));
    done();
  })
});

gulp.task("webpack-dev-server", function(callback) {
  // Start a webpack-dev-server
  var compiler = webpack(webpackConfig);

  new WebpackDevServer(compiler, {
    contentBase: path.join(__dirname, 'public'),
    setup: function(app) {
      app.use(require('./app'));
    }
  }).listen(3000, "localhost", function(err) {
      if (err) throw new gutil.PluginError("webpack-dev-server", err);
      gutil.log("[webpack-dev-server]", "http://localhost:3000/webpack-dev-server/index.html");

      callback();
    });
});

