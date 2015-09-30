var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require("gulp-util");
var WebpackDevServer = require("webpack-dev-server");

var webpackConfig = {};

// The development server (the recommended option for development)
gulp.task("default", ["webpack-dev-server"]);

gulp.task('webpack', function(done) {
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      // output options
    }));
    callback();

  })
});

gulp.task("webpack-dev-server", function(callback) {
  // Start a webpack-dev-server
  var compiler = webpack(webpackConfig);

  new WebpackDevServer(compiler, {
    // server and middleware options
  }).listen(8080, "localhost", function(err) {
      if (err) throw new gutil.PluginError("webpack-dev-server", err);
      // Server listening
      gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");

      // keep the server alive or continue?
      // callback();
    });
});

