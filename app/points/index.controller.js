(function () {
    'use strict';

    angular
        .module('app')
        .filter('capitalizer', UserFormetter)
        .controller('Points.IndexController', Controller);

    function Controller(UserService, ScheduleService) {
        var vm = this;

        vm.user = null;
        vm.points = null;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                getPoint(vm.user.username);
            });

        }

        function getPoint(username) {
            ScheduleService.GetPoint(username,
                function(result){
                    vm.points = result.data;
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