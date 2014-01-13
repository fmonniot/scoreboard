/**
 * Created by francois on 07/01/14.
 */
'use strict';

/* Controllers */

angular.module('scoreboard.controllers', []).
    controller('HomeCtrl', [function() {

    }]).
    controller('AboutCtrl', [function() {

    }]).
    controller('BoardListCtrl', ['$scope', '$location', 'Board', '$modal', function($scope, $location, Board, $modal){

      $scope.boards = Board.query();

      $scope.show = function(board){
        $location.path('/board/'+board.id);
      };

      $scope.del = function(board){

        var modalInstance = $modal.open({
          templateUrl: 'templates/board/modalDelete.html',
          scope: $scope,
          controller: function ($scope, $modalInstance) {
            $scope.board = board;

            $scope.ok = function () {
              $modalInstance.close();
            };

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          }
        });

        modalInstance.result.then(function () {
          Board.delete({}, board, function(){
            console.log('board', board, 'deleted');
          });
        });
      };
    }]).
    controller('BoardCreateCtrl', ['$scope', '$location', 'Board', function($scope, $location, Board){
      $scope.save = function(values){
        var board = new Board(values);
        board.$save(function(){
          console.log('board saved', board);
          $location.path('/board/'+board.id);
        })
      }
    }]).
    controller('BoardShowCtrl', [
      '$scope', '$routeParams', '$route', 'Board', 'Score', 'User', 'modalConfirmationCtrl', '$modal', 'socket',
      function($scope, $routeParams, $route, Board, Score, User, modalConfirmationCtrl, $modal, socket) {

        $scope.boardId = $routeParams.id;
        socket.on('connect', function(){
          socket.emit('get', JSON.stringify({url:'/api/board/'+$scope.boardId+'/subscription'}));
        });

        // Listen socket.io messages
        $scope.$on('socket:message', function(event, data){
          console.log('event socket:message with', data);
          if(data.uri == 'score/new') {
            $scope.scores.push(data.score);
          }

          if(data.uri == 'user/join'){
            $scope.users.push(data.user);
          }

          if(data.uri == 'user/leave'){
            var index = $scope.users.indexOf(data.user.name);
            $scope.users.splice(index, 1);
          }

        });

        // Store the tab selected
        $scope.currentTab = $route.current.tab;

        $scope.board = Board.get({boardId: $routeParams.id}, function(){}, function(response){
          var msg = {
            title: 'Error',
            message: 'An error have occured. Please try again later'
          };
          if(response.status == 404) {
            msg.title = 'Board not found';
            msg.message = "This board doesn't exist.";
          }
          $scope.networkError = msg;
        });

        $scope.users = User.search('{ "boards": {"contains": "'+$scope.boardId+'"}}');
        $scope.scores = Score.query({boardId: $scope.boardId});

        $scope.inviteUser = function(){
          console.log('board id is %s',$scope.board.id);
          // TODO abstract this in a custom method
          $scope.users_available = User.search('{ "boards": { "$not" : {"contains": "'+$scope.board.id+'"}}}');

          var modalInstance = $modal.open({
            templateUrl: 'templates/user/modalInvit.html',
            scope: $scope,
            resolve: { object: function(){return {}; } },
            controller: modalConfirmationCtrl
          });

          modalInstance.result.then(function (object) {
            Board.invite({boardId:$scope.boardId, userId: object.user.id}, {});
          });
        };

        $scope.createScore = function(){
          $scope.users_available = User.search('{ "boards": {"contains": "'+$scope.board.id+'"}}');

          var modalInstance = $modal.open({
            templateUrl: 'templates/score/modalCreate.html',
            scope: $scope,
            resolve: {
              object: function () {
                return {score: new Score({boardId: $scope.board.id})};
              }
            },
            controller: modalConfirmationCtrl
          });

          modalInstance.result.then(function (object) {
            var score = object.score;
            score.userId = object.user.id;

            score.$save();
          });
        }

        $scope.expel = function(user){

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
            Board.expel({boardId:$scope.boardId, userId: user.id}, {});
          });

        };
    }]).
    controller('ScoreGraphCtrl', ['$scope', '$q', function($scope, $q){
      // TODO Rewrite the directive to watch all the configuration

      var updateData = function(){
        // Collect players
        var players = [], findUserName = {};
        for(var i = 0; i < $scope.users.length; i++){
          players.push($scope.users[i].name);
          findUserName[$scope.users[i].id] = $scope.users[i].name;
        }

        // Match scores
        var scores = [], userPos;
        for(i = 0; i < $scope.scores.length; i++){
          userPos = players.indexOf(findUserName[$scope.scores[i].userId]);

          if(userPos == '-1') continue;

          if(undefined === scores[userPos]) scores[userPos] = 0;
          scores[userPos] += $scope.scores[i].value;
        }

        if($scope.users.length > 0 && $scope.scores.length > 0) {
          console.log('update graph with data');
          console.table([players, scores]);
        }

        $scope.xAxis.categories = players;
        $scope.series[0].data = scores;
      };

      // Watch for some changement
      $scope.$watch('[users,scores]', function(){
        updateData();
      }, true);

      // Wait until users and scores are available
      var promises = [];
      promises.push($scope.users);
      promises.push($scope.scores);
      $q.all(promises).then(function() {
        updateData();
      });

      // Init the graph
      $scope.xAxis = {
        categories: [],
        labels: {
          rotation: -45,
          align: 'right',
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      };

      $scope.series = [
        {
          name: "Total points",
          data: [],
          dataLabels: {
            enabled: true,
            color: 'white',
            y: 23,
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: '0 0 5px black'
            }
          }
        }
      ];

      $scope.chartScoreBarConfig = {
        options: {
          chart: {
            type: 'column'
          },
          plotOptions: {
            series: {
              stacking: ''
            }
          }
        },
        legend: {
          enabled: false
        },
        series: $scope.series,
        xAxis: $scope.xAxis,
        yAxis: {
          title: {
            text: 'Points'
          }
        },
        title: {
          text: 'Scores'
        },
        credits: {
          enabled: false
        }
      };
    }]).
    controller('UserListCtrl', [
      '$scope', '$modal', 'User', 'modalConfirmationCtrl',
      function($scope, $modal, User, modalConfirmationCtrl){
        $scope.users = User.query();

        $scope.create = function() {
          var modalInstance = $modal.open({
            templateUrl: 'templates/user/modalCreate.html',
            scope: $scope,
            resolve: {
              object: function () {
                return {user: new User()};
              }
            },
            controller: modalConfirmationCtrl
          });

          modalInstance.result.then(function (object) {
            var user = object.user;

            user.$save();
          });
        };

        $scope.del = function(user){

        var modalInstance = $modal.open({
          templateUrl: 'templates/user/modalDelete.html',
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
          User.delete({}, user, function(){
            console.log('user', user, 'deleted');
          });
        });
      };
    }]);