(function () {
    'use strict';

    angular
        .module('app')
        .factory('ScheduleService', Service);

    function Service($http) {

        var service = {};

        service.GetAll = GetAll;
        service.GetAllPoints = GetAllPoints;
        service.GetTop25Points = GetTop25Points;
        service.GetPredictions = GetPredictions;
        service.SetPredictions = SetPredictions;

        return service;

        function GetAllPoints(username,handleSuccess,handleError){
            $http.get('/api/prediction/getAllPoints/'+username).then(handleSuccess, handleError);
        }

        function GetTop25Points(username,handleSuccess,handleError){
            $http.get('/api/prediction/getTop25Points/'+username).then(handleSuccess, handleError);
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