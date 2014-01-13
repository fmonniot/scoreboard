/**
 * Created by francois on 07/01/14.
 */
'use strict';

/* Application configuration */

angular.module('scoreboard', [
      'ngRoute',
      'ngResource',
      'ui.bootstrap',
      'btford.socket-io',
      'highcharts-ng',
      'scoreboard.controllers',
      'scoreboard.directives',
      'scoreboard.services'
    ]).
    config(['$routeProvider', function($routeProvider) {


      $routeProvider.when('/boards', {
        templateUrl: 'templates/board/list.html',
        controller: 'BoardListCtrl'
      });
      $routeProvider.when('/board/create', {
        templateUrl: 'templates/board/create.html',
        controller: 'BoardCreateCtrl'
      });
      $routeProvider.when('/board/:id', {
        templateUrl: 'templates/board/show.html',
        controller: 'BoardShowCtrl',
        tab: 'graph'
      });
      $routeProvider.when('/board/:id/entries', {
        templateUrl: 'templates/board/show.html',
        controller: 'BoardShowCtrl',
        tab: 'entries'
      });
      $routeProvider.when('/board/:id/users', {
        templateUrl: 'templates/board/show.html',
        controller: 'BoardShowCtrl',
        tab: 'users'
      });

      $routeProvider.when('/users', {
        templateUrl: 'templates/user/list.html',
        controller: 'UserListCtrl'
      });

      $routeProvider.when('/about', {
        templateUrl: 'templates/about.html',
        controller: 'AboutCtrl'
      });

      // Waiting to create a real home page
      $routeProvider.otherwise({redirectTo: '/boards'});
    }]).
    run(['socket', function(socket){
      var logSocket = function(name){
        socket.on(name, function(message){
          console.log('New comet message received:', message);
        });
      };
      logSocket('message');
      socket.forward('connect');
      socket.forward('message');
    }]);