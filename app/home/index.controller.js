(function () {
    'use strict';


    angular
        .module('app')
        .filter('day_filter', TitleDateFormatter)
        .filter('time_filter', MatchDateFormatter)
        .controller('Home.IndexController', Controller);

    function Controller($scope, UserService, ScheduleService) {
        var vm = this;

        vm.user = null;
        vm.schedule = null;
        vm.TabTexts = ['1. Hafta','2. Hafta','3. Hafta','Son 16','Çeyrek Final','Yarı Final','Final'];
        vm.TabIndex = 0;
        vm.matchStatus = null;

        initController();

        function initController() {
            //set tab index
            var now = new Date();
            if(now > new Date('2016-06-14T21:00:00.000Z'))
                vm.TabIndex = 1;
            if(now > new Date('2016-06-18T21:00:00.000Z'))
                vm.TabIndex = 2;
            if(now > new Date('2016-06-22T21:00:00.000Z'))
                vm.TabIndex = 3;
            if(now > new Date('2016-06-27T21:00:00.000Z'))
                vm.TabIndex = 4;
            if(now > new Date('2016-07-03T21:00:00.000Z'))
                vm.TabIndex = 5;
            if(now > new Date('2016-07-07T21:00:00.000Z'))
                vm.TabIndex = 6;

            // get schedule
            vm.schedule = ScheduleService.GetAll();

            vm.matchStatus = new Array();
            for(var i=0; i<vm.schedule.Stages.length; i++){
                for(var j=0; j<vm.schedule.Stages[i].length; j++){
                    for(var k=0; k<vm.schedule.Stages[i][j].length; k++){
                        var matchDate = new Date(vm.schedule.Stages[i][j][k].date);
                        var editable=true;
                        if(matchDate < now)
                            editable = false;

                        vm.matchStatus[vm.schedule.Stages[i][j][k].match_id] = {"editable":editable};
                    }
                }
            }

            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                document.getElementById('user_info').innerHTML = '(' + vm.user.firstName + ' ' + vm.user.lastName + ')';
            });
        }

        $scope.handleClick = function(match_id, score1, score2){
            alert("match " + match_id + ", score " + score1 + "-" + score2);
        }
    }

    function TitleDateFormatter(){

        return function(input){
            var date = new Date(input);
            return date.toLocaleDateString();
        }
    }

    function MatchDateFormatter(){
        return function(input){
            var date = new Date(input);
            return date.toTimeString().substring(0,5);
        }
    }


})();