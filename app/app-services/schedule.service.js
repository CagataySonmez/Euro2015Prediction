(function () {
    'use strict';

    angular
        .module('app')
        .factory('ScheduleService', Service);

    function Service($http) {

        var service = {};

        service.GetAll = GetAll;
        service.GetPoint = GetPoint;
        service.GetPredictions = GetPredictions;
        service.SetPredictions = SetPredictions;

        return service;

        function GetPoint(username,handleSuccess,handleError){
            $http.get('/api/prediction/getPoint/'+username).then(handleSuccess, handleError);
        }

        function GetPredictions(username,handleSuccess,handleError){
            $http.get('/api/prediction/predictions/'+username).then(handleSuccess, handleError);
        }

        function SetPredictions(matchParam,handleSuccess,handleError){
            $http.post('/api/prediction/predictMatch',matchParam).then(handleSuccess, handleError);
        }

        function GetAll(handleSuccess,handleError) {
          $http.get('/schedule').then(handleSuccess, handleError);
        }
    }
})();