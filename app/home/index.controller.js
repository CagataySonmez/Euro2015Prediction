(function () {
    'use strict';

    angular
        .module('app')
        .filter('day_filter', TitleDateFormatter)
        .filter('time_filter', MatchDateFormatter)
        .controller('Home.IndexController', Controller);

    function Controller($scope, UserService, ScheduleService, FlashService) {
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


            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                document.getElementById('user_info').innerHTML = '(' + vm.user.firstName + ' ' + vm.user.lastName + ')';

                // get schedule
                ScheduleService.GetAll(
                    function(schedule_result){
                        
                        vm.schedule = schedule_result.data;

                        vm.matchStatus = new Array();
                        for(var i=0; i<vm.schedule.Stages.length; i++){
                            for(var j=0; j<vm.schedule.Stages[i].length; j++){
                                for(var k=0; k<vm.schedule.Stages[i][j].length; k++){
                                    var matchDate = new Date(vm.schedule.Stages[i][j][k].date);
                                    var editable=true;
                                    if(matchDate < now)
                                        editable = false;

                                    vm.matchStatus[vm.schedule.Stages[i][j][k].match_id] = {"editable":editable};

                                    if(vm.schedule.Stages[i][j][k].finished){
                                        vm.matchStatus[vm.schedule.Stages[i][j][k].match_id]['finished']=true;
                                        vm.matchStatus[vm.schedule.Stages[i][j][k].match_id]['user_homescore'] = vm.schedule.Stages[i][j][k].team1_score;
                                        vm.matchStatus[vm.schedule.Stages[i][j][k].match_id]['user_awayscore'] = vm.schedule.Stages[i][j][k].team2_score;
                                    }
                                }
                            }
                        }

                        ScheduleService.GetPredictions(vm.user.username,
                            function(prediction_result){
                                var predictions = prediction_result.data;
                                console.log(predictions);
                                for(var i=0; i<predictions.length; i++){
                                    if(predictions[i].matchid){
                                        vm.matchStatus[predictions[i].matchid]['predicted_awayscore'] = predictions[i].awayscore;
                                        vm.matchStatus[predictions[i].matchid]['predicted_homescore'] = predictions[i].homescore;

                                        if(vm.matchStatus[predictions[i].matchid]['finished']){
                                            vm.matchStatus[predictions[i].matchid]['has_point'] = true;
                                            var real_homescore = vm.matchStatus[predictions[i].matchid]['user_homescore'];
                                            var real_awayscore = vm.matchStatus[predictions[i].matchid]['user_awayscore'];
                                            var predicted_homescore = vm.matchStatus[predictions[i].matchid]['predicted_homescore'];
                                            var predicted_awayscore = vm.matchStatus[predictions[i].matchid]['predicted_awayscore'];
                                            var point = 0;

                                            if(real_homescore === predicted_homescore && real_awayscore === predicted_awayscore)
                                            {
                                                point = 8;
                                            }
                                            else
                                            {
                                                if((real_homescore > real_awayscore && predicted_homescore > predicted_awayscore) ||
                                                    (real_homescore < real_awayscore && predicted_homescore < predicted_awayscore) ||
                                                    (real_homescore === real_awayscore && predicted_homescore === predicted_awayscore))
                                                {
                                                    point = 3;
                                                }
                                                if(real_homescore === predicted_homescore || real_awayscore === predicted_awayscore)
                                                {
                                                    point += 1;
                                                }
                                            }
                                            vm.matchStatus[predictions[i].matchid]['point'] = point;
                                        }
                                    }
                                }
                            },
                            function(err){
                                console.log(err);
                            }
                        );
                    },
                    function(err){
                        console.log(err);
                    }
                );
            });
        }

        $scope.handleClick = function(match_id, score1, score2){
            ScheduleService.SetPredictions(
                {username : vm.user.username, matchid : match_id, homescore : score1, awayscore : score2},
                function(result){
                    FlashService.Success('Tahmininiz başarıyla kaydedildi');
                    vm.matchStatus[match_id]['predicted_homescore'] = score1;
                    vm.matchStatus[match_id]['predicted_awayscore'] = score2;
                    vm.matchStatus[match_id]['user_homescore'] = "";
                    vm.matchStatus[match_id]['user_awayscore'] = "";
                    //$scope.$apply();
                },
                function(err){
                    FlashService.Error(err.data);
                }
            );
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