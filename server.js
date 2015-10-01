var express = require('express');
var morgan = require('morgan');
var ngrok = require('ngrok');
var path = require('path');
var webpack = require("webpack");

var compiler = webpack(require('./webpack.config.js'));

var app = module.exports.app = express();

app.use(morgan('combined'));

app.use(require('./app'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'webpack')));

var server = app.listen(3000, '127.0.0.1', function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

  if (process.env.NODE_ENV !== 'production') {
    ngrok.connect(port, function(err, url) {
      if (err) {
        console.error('ngrok error', err);
        return;
      }

      console.log('ngrok listening at %s', url);
    })
  }
});

server.on('close', function () { console.log('closing'); });
