/**
 * Created by francois on 07/01/14.
 */
'use strict';

/* Services */

angular.module('scoreboard.services', []).
    value('version', '0.1').
    factory('socket',['socketFactory', function(socketFactory){
      return socketFactory();
    }]).
    factory('Board', ['$resource', function($resource){
      return $resource('/api/board/:boardId',
          {boardId: '@id'},
          {
            update: {method: 'PUT'},
            invite: {method: 'POST', url: '/api/board/:boardId/invite/:userId'},
            expel:  {method: 'POST', url: '/api/board/:boardId/expel/:userId'}
          }
      );
    }]).
    factory('Score', ['$resource', function($resource){
      return $resource('/api/score/:scoreId',
          {scoreId: '@id', boardId: '@boardId'},
          {
            update: {method: 'PUT'}
          })
    }]).
    factory('User', ['$resource', function($resource){
      return $resource('/api/user/:userId',
          {userId: '@id'},
          {
            update: {method: 'PUT'},
            search: {method: 'POST', url: '/api/user/search', isArray: true}
          })
    }]).
    factory('modalConfirmationCtrl', function(){
      // TODO Should rename object to subject
      return function ($scope, $modalInstance, object) {
        $scope.object = object;

        $scope.ok = function () {
          $modalInstance.close($scope.object);
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    });