var config = require('config');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var schedule = require('matches.json');
db.bind('predictions');

var service = {};

service.getPoint = getPoint;
service.getPredictions = getPredictions;
service.predictMatch = predictMatch;

module.exports = service;

function getPoint(userName) {
    var deferred = Q.defer();

    db.predictions.find({ username : userName }).toArray(
        function (err, result) {
            if (err){
                deferred.reject(err);
            }
            else {
                var predictions = result;
                var scores = new Array();
                var point = 0;
                var numOfPredictions = 0;

                //prepare results for ended mached
                for(var i=0; i<schedule.Stages.length; i++){
                    for(var j=0; j<schedule.Stages[i].length; j++){
                        for(var k=0; k<schedule.Stages[i][j].length; k++){
                            scores[schedule.Stages[i][j][k].match_id] = new Object();
                            if(schedule.Stages[i][j][k].finished){
                                scores[schedule.Stages[i][j][k].match_id].finished = true;
                                scores[schedule.Stages[i][j][k].match_id].homescore = schedule.Stages[i][j][k].team1_score;
                                scores[schedule.Stages[i][j][k].match_id].awayscore = schedule.Stages[i][j][k].team2_score;
                            }
                            else{
                                scores[schedule.Stages[i][j][k].match_id].finished = false;
                            }
                        }
                    }
                }

                for(var i=0; i<predictions.length; i++){
                    if(predictions[i].matchid){
                        if(scores[predictions[i].matchid].finished){
                            var real_homescore = scores[predictions[i].matchid].homescore;
                            var real_awayscore = scores[predictions[i].matchid].awayscore;
                            var predicted_homescore = predictions[i].homescore;
                            var predicted_awayscore = predictions[i].awayscore;
                            
                            if(real_homescore === predicted_homescore && real_awayscore === predicted_awayscore)
                            {
                                point += 8;
                            }
                            else
                            {
                                if((real_homescore > real_awayscore && predicted_homescore > predicted_awayscore) ||
                                    (real_homescore < real_awayscore && predicted_homescore < predicted_awayscore) ||
                                    (real_homescore === real_awayscore && predicted_homescore === predicted_awayscore))
                                {
                                    point += 3;
                                }
                                if(real_homescore === predicted_homescore || real_awayscore === predicted_awayscore)
                                {
                                    point += 1;
                                }
                            }
                            numOfPredictions += 1;
                        }
                    }
                }
                deferred.resolve({'point':point,'numOfPredictions':numOfPredictions});
            }
        }
    );

    return deferred.promise;
}

function getPredictions(userName) {
    var deferred = Q.defer();

    db.predictions.find({ username : userName }).toArray(
        function (err, result) {
        if (err) deferred.reject(err);

        deferred.resolve(result);
    });

    return deferred.promise;
}

function predictMatch(matchParam) {
    var deferred = Q.defer();

    var shouldSave = false;
    for(var i=0; i<schedule.Stages.length; i++){
        for(var j=0; j<schedule.Stages[i].length; j++){
            for(var k=0; k<schedule.Stages[i][j].length; k++){
                if(schedule.Stages[i][j][k].match_id === matchParam.matchid){
                    var matchDate = new Date(schedule.Stages[i][j][k].date);
                    var now = new Date();

                    if(matchDate > now)
                        shouldSave = true;
                }
            }
        }
    }
    if (!shouldSave){
        deferred.reject('Maç başladı, tahmin yapamazsınız!');
        return deferred.promise;
    }

    // validation
    db.predictions.findOne(
        { username : matchParam.username,
          matchid : matchParam.matchid },
        function (err, result) {
            if (err) deferred.reject(err);

            if (result) {
                update(result._id);
            } else {
                create();
            }
        });

    function create() {
        var record = {username : matchParam.username, matchid : matchParam.matchid, homescore : matchParam.homescore, awayscore : matchParam.awayscore}

        db.predictions.insert(
            record,
            function (err, doc) {
                if (err) deferred.reject(err);

                deferred.resolve();
            });
    }

    function update(_id) {
        // fields to update
        var set = {
            homescore : matchParam.homescore,
            awayscore : matchParam.awayscore,
        };

        db.predictions.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
