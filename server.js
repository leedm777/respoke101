var Chance = require('chance');
var express = require('express');
var ngrok = require('ngrok');
var request = require('request').defaults({json: true});
var session = require('express-session');
var uuid = require('uuid');

var chance = new Chance();

var respoke = {
    baseURL: process.env.BASE_URL || 'https://api.respoke.io',
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET
};

var app = module.exports.app = express();

app.use(session({secret: process.env.SESSION_SECRET || uuid.v4(), cookie: {}}));

app.get('/token', function (req, res) {
    if (!req.session.name) {
        req.session.name = chance.first();
    }

    var timeout;
    var postReq = request.post({
        uri: respoke.baseURL + '/v1/tokens',
        headers: {
            'App-Secret': respoke.appSecret
        },
        body: {
            appId: respoke.appId,
            endpointId: req.session.name,
            roleName: 'all',
            ttl: 3600
        }
    }, function (err, postRes) {
        clearTimeout(timeout);

        if (err) {
            console.error('Error requesting token', err.stack);
            res.status(500).send({error: 'Could not acquire token'});
            return;
        }

        res.send({
            token: postRes.body.tokenId,
            endpointId: postRes.body.endpointId,
            baseURL: postRes.body.baseURL
        });

    });

    timeout = setTimeout(function () {
        postReq.abort();
        res.status(500).send({error: 'Timeout acquiring token'});
    }, 5000);
});

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
