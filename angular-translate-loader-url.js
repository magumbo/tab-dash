/*!
 * angular-translate - v2.2.0 - 2014-06-03
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateUrlLoader', [
  '$q',
  '$http',
  function ($q, $http) {
    return function (options) {
      if (!options || !options.url) {
        throw new Error('Couldn\'t use urlLoader since no url is given!');
      }
      var deferred = $q.defer();
      $http({
        url: options.url,
        params: { language: options.key }, //changed lang to language for our service
        method: options.method || 'GET'
      }).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(options.key);
      });
      return deferred.promise;
    };
  }
]);