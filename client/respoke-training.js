'use strict';

var respokeTrainingApp = angular.module('respokeTrainingApp', []);

respokeTrainingApp.controller('RespokeTrainingCtrl', function($scope, $http, $timeout) {
  $scope.state = 'starting';
});
