/**
 * Created by francois on 07/01/14.
 */
'use strict';

/* Directives */

angular.module('scoreboard.directives', []).
    directive('appVersion', ['version', function(version) {
      return function(scope, elm) {
        elm.text(version);
      };
    }]).
    directive('activeLink', [ '$location', function ($location) {
      return {
        link: function postLink(scope, element, attrs) {
          var clazz = attrs.activeLink;
          var path = attrs.href;
          path = path.substring(1); //hack because path does not return including hashbang
          scope.location = location;
          scope.$on("$routeChangeSuccess", function () {
            var newPath = $location.path();
            if (path === newPath) {
              element.addClass(clazz);
            } else {
              element.removeClass(clazz);
            }
          });
        }
      };
    }]);