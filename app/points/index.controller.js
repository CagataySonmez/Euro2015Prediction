(function () {
    'use strict';

    angular
        .module('app')
        .controller('Points.IndexController', Controller);

    function Controller(UserService, ScheduleService) {
        var vm = this;

        vm.user = null;
        vm.point = null;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                getPoint(vm.user.username);
            });

            //TODO: get top 10 scores here!
        }

        function getPoint(username) {
            ScheduleService.GetPoint(username,
                function(result){
                    vm.point = result.data;
                },
                function(err){
                    console.log(err);
                }
            );
        }
    }
})();