'use strict';

var _ = require('lodash');
var respokeTrainingApp = require('./respokeTrainingApp');
var respoke = require('respoke');

respokeTrainingApp.controller('RespokeTrainingCtrl', function($scope, $http, $timeout, $q) {
  $scope.state = 'starting';

  function setState(newState) {
    console.log(newState);
    $scope.state = newState;
    $timeout();
  }

  function onErr(err) {
    $scope.state = 'error';
    $scope.err = err;
    console.error(err);
    $timeout();
  }

  var client = $scope.client = window.client = respoke.createClient();

  //
  // Brokered auth. Your server is responsible for creating tokens for
  // clients to use to connect with Respoke. This keeps your app credentials
  // secret, but requires a server component.
  //
  var connect = $http.get('/token')
    .then(function(res) {
      if (res.status !== 200) {
        throw new Error('Error acquiring token ' + JSON.stringify(res.data));
      }

      setState('connecting');
      return client.connect({token: res.data.token, baseURL: 'http://testing.digiumlabs.com:2000'});
    }).then(function() {
      setState('connected');
      return client.setPresence({presence: 'available'});
    }).catch(onErr);

  /*

  //
  // Peer to peer messages. The client receives a `message` event on incoming
  // messages.
  //
  var inbox = $scope.inbox = [];

  function receiveMessage(msg) {
    if (!msg.recipient) {
      msg.recipient = client.endpointId;
    }
    inbox.push(msg);
    while (inbox.length > 5) {
      inbox.shift();
    }
    $timeout();
  }

  client.listen('message', function(evt) {
    evt.message.timestamp = new Date(evt.message.timestamp);
    receiveMessage(evt.message);
    setState('got client message');
  });

  // To send a message
  var message = $scope.message = {
    endpointId: '',
    message: ''
  };
  var sendToEndpoint = $scope.sendMessage = function() {
    setState('sending message');
    var send = _.clone(message);
    delete message.message;

    client.sendMessage(send)
      .then(function() {
        setState('sent message');
      }).catch(onErr);
    delete message.message;
  };
  $scope.messageReady = function() {
    return !!(client && client.isConnected() && message.endpointId && message.message
    );
  };


  //
  // To send to a specific connection, you can set the connectionId on the
  // message you wish to send
  //
  $scope.message.connectionId = '';

  //
  // Often want to communicate in groups. Respoke can do that! For now, we'll
  // join a group named `global`, which we use an address book for sending
  // messages.
  //
  var joined = connect.then(function() {
    return client.join({
      id: 'global',
      onJoin: function(evt) {
        receiveMessage({
          timestamp: new Date(),
          endpointId: evt.connection.endpointId,
          recipient: 'global',
          message: '*joined*'
        });
        refreshGlobalMembers();
      },
      onLeave: function(evt) {
        console.log(JSON.stringify(evt, null, 2));
        receiveMessage({
          timestamp: new Date(),
          endpointId: evt.connection.endpointId,
          recipient: 'global',
          message: '*left*'
        });
        refreshGlobalMembers();
      }
    })
  }).then(function(group) {
    setState('joined global group');
    refreshGlobalMembers();
  }).catch(onErr);


  $scope.globalMembers = [];
  var refresh = $q.resolve();

  function refreshGlobalMembers() {
    refresh = refresh.then(function() {
      return client.getGroup({id: 'global'}).getMembers()
        .then(function(members) {
          console.log(JSON.stringify(members, null, 2));
          $scope.globalMembers = _(members).map(function(member) {
            return member.endpointId
          }).without(client.endpointId).uniq().valueOf();

          if (!_.includes($scope.globalMembers, message.endpointId)) {
            message.endpointId = '';
          }
          $timeout();
        }).catch(onErr);
    });
  }

  // So we can generate some leave events, here's a disconnect button
  $scope.disconnect = function() {
    connect.then(function() {
      return client.disconnect();
    }).then(function() {
      setState('disconnected');
    }).catch(onErr);
  };


  //
  // Not only that, often we want to be able to send messages to groups of
  // people. With respoke, sending a message to a group forwards that message
  // to all the members of that group
  //
  var groups = $scope.groups = ['Engineering', 'Break Room'];
  groups.forEach(function(group) {
    joined = joined.then(function() {
      return client.join({
        id: group
        // One could tie a callback directly to the message handler on the
        // group, but we'll just use the client message handler we already have
        //onMessage: function(evt) {}
      })
    }).catch(onErr);
  });

  joined.then(function() {
    // plug in a group-aware message sender
    $scope.sendMessage = function() {
      if (!_.startsWith(message.endpointId, 'group:')) {
        return sendToEndpoint();
      }
      var groupId = message.endpointId.replace(/^group:/, '');
      var msg = message.message;
      delete message.message;

      setState('sending group message');
      client.getGroup({id: groupId}).sendMessage({message: msg})
        .then(function() {
          setState('group message sent');
        }).catch(onErr);
    };
  });

  //
  // Respoke is more than just messaging. With respoke, you can make
  // peer-to-peer audio and video calls over WebRTC
  //
  $scope.call = null;

  $scope.showVideos = function() {
    return $scope.call && ($scope.call.incomingMediaStreams.hasVideo() || $scope.call.outgoingMediaStreams.hasVideo());
  };

  $scope.canCall = function() {
    return !$scope.call && message.endpointId && !_.startsWith(message.endpointId, 'group:');
  };

  var startVideoCall = $scope.startVideoCall = function() {
    setState('calling out');
    client.startVideoCall({
      endpointId: message.endpointId,
      videoLocalElement: document.getElementById('local-video'),
      videoRemoteElement: document.getElementById('remote-video'),
      onConnect: function() {
        setState('on call')
      }
    });
  };

  client.listen('call', function(evt) {
    evt.call.listen('hangup', function() {
      setState('hung up');
      $scope.call = null;
    });
    $scope.call = evt.call;

    if (evt.call.caller) {
      return;
    }
    setState('receiving call');

    // auto-answer, normally you would prompt for answer
    evt.call.answer({
      videoLocalElement: document.getElementById('local-video'),
      videoRemoteElement: document.getElementById('remote-video'),
      // Try using test media stream on answer side. FF allows this with the
      // fake: true constraint. Chrome requires --use-fake-device-for-media-stream
      // when launching the browser
      constraints: {audio: true, video: true, fake: true},
      onConnect: function() {
        setState('on call')
      }
    });
  });

  $scope.callAsterisk = function() {
    client.startAudioCall({
      endpointId: 'asterisk'
    })
  };

   * To simplify the app, move the start of comment further up sections
   * of code. The HTML should disable features that are commented out.
   */
});
