'use strict';

var $ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap');
var angular = require('angular');
var respoke = require('respoke');

var respokeTrainingApp = angular.module('respokeTrainingApp', []);

respokeTrainingApp.controller('RespokeTrainingCtrl', function($scope, $http, $timeout) {
  $scope.state = 'starting';
});
