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
      return function ($scope, $modalInstance, object) {
        $scope.object = object;

        $scope.ok = function () {
          $modalInstance.close($scope.object);
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    }).
    factory('modalBoard', ['$rootScope','$modal', 'Board', 'User', 'Score', 'modalConfirmationCtrl',
      function($rootScope, $modal, Board, User, Score, modalConfirmationCtrl){
        return {
          inviteUser: function(boardId){
            var $scope = $rootScope.$new(true);
            $scope.users_available = User.search('{ "boards": { "$not" : {"contains": "'+boardId+'"}}}');

            var modalInstance = $modal.open({
              templateUrl: 'templates/user/modalInvit.html',
              scope: $scope,
              resolve: { object: function(){ return {}; } },
              controller: modalConfirmationCtrl
            });

            modalInstance.result.then(function (object) {
              Board.invite({boardId:boardId, userId: object.user.id}, {});
            });
          },

          createScore: function(boardId){
            var $scope = $rootScope.$new(true);
            $scope.users_available = User.search('{ "boards": {"contains": "'+boardId+'"}}');

            var modalInstance = $modal.open({
              templateUrl: 'templates/score/modalCreate.html',
              scope: $scope,
              resolve: {
                object: function () {
                  return {score: new Score({boardId: boardId})};
                }
              },
              controller: modalConfirmationCtrl
            });

            modalInstance.result.then(function (object) {
              object.score.userId = object.user.id;
              object.score.$save();
            });
          },

          expel: function(boardId, user){
            var $scope = $rootScope.$new(true);
            var modalInstance = $modal.open({
              templateUrl: 'templates/user/modalExpel.html',
              scope: $scope,
              controller: function ($scope, $modalInstance) {
                $scope.user = user;

                $scope.ok = function () {
                  $modalInstance.close();
                };

                $scope.cancel = function () {
                  $modalInstance.dismiss('cancel');
                };
              }
            });

            modalInstance.result.then(function () {
              Board.expel({boardId:boardId, userId: user.id}, {});
            });
          }
        };
    }]);