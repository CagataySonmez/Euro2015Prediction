(function () {
    'use strict';

    angular
        .module('app')
        .filter('capitalizer', UserFormetter)
        .controller('Points.IndexController', Controller);

    function Controller($scope, UserService, ScheduleService) {
        var vm = this;

        vm.user = null;
        vm.score = null;
        vm.hideAllScoreButton = false;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                getTop25Points(vm.user.username);
            });
        }

        function getTop25Points(username) {
            ScheduleService.GetTop25Points(username,
                function(result){
                    vm.score = result.data;
                },
                function(err){
                    console.log(err);
                }
            );
        }

        $scope.gelAllPoints = function() {
            vm.hideAllScoreButton = true;
            ScheduleService.GetAllPoints(vm.user.username,
                function(result){
                    vm.score = result.data;
                },
                function(err){
                    console.log(err);
                }
            );
        }
    }

    function UserFormetter(){
        return function(input){
            var result = input
                .replace(/i/g,'İ')
                .replace(/I/g,'ı')
                .split(' ')
                .map(function(word){
                    if(word==='')
                        return '';
                    else
                        return word[0].toUpperCase() + word.substring(1).toLowerCase();
                })
                .join(' ')
                .replace(/i̇/g,'i');
            return result;
        }
    }
})();