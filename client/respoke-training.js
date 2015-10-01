'use strict';

var respokeTrainingApp = angular.module('respokeTrainingApp', []);

respokeTrainingApp.controller('RespokeTrainingCtrl', function($scope, $http, $timeout) {
  $scope.state = 'starting';

  var client = $scope.client = respoke.createClient();

  /*
  //
  // Dev mode. By setting `developmentMode` to `true`, we don't have to have
  // a server to authenticate the client. The downside is that there is no
  // security; anyone with your `appId` can connect to your application.
  //
  client.connect({
    //baseURL: 'http://testing.digiumlabs.com',
    appId: '642235ef-9647-4204-86f4-ec0e0ce7acb1',
    endpointId: 'some endpoint',
    developmentMode: true
  }).then(function(connection) {
    $scope.state = 'connected';
    $timeout();
  }, function(err) {
    $scope.err = err;
  });
   */

  //
  // Brokered auth. Your server is responsible for creating tokens for
  // clients to use to connect with Respoke. This keeps your app credentials
  // secret, but requires a server component.
  //
  $http.get('/token')
    .then(function(res) {
      if (res.status !== 200) {
        throw new Error('Error acquiring token ' + JSON.stringify(res.data));
      }

      $scope.state = 'connecting';
      return client.connect({ token: res.data.token });
    }).then(function() {
      $scope.state = 'connected';
      $timeout();
    }).catch(function(err) {
      $scope.err = err;
      console.error(err);
      $timeout();
    });

  //
  // Peer to peer messages
  //
  var inbox = $scope.inbox = [];
  client.listen('message', function(evt) {
    evt.message.timestamp = new Date(evt.message.timestamp);
    inbox.push(evt.message);
    $timeout();
  });
  $scope.message = {
    //ccSelf: true
  };
  $scope.sendMessage = function() {
    $scope.state = 'sending message';
    $timeout();
    client.sendMessage(JSON.parse(JSON.stringify($scope.message)));
    delete $scope.message.message;
  };
  $scope.canSendMessage = function() {
    return client.isConnected();
  };
  $scope.messageReady = function() {
    return !!($scope.message.endpointId && $scope.message.message);
  };



  /*
   * To simplify the app, move the start of comment further up sections
   * of code. The HTML should disable features that are commented out.
   */
});
