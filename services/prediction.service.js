var config = require('config');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var schedule = require('matches.json');
db.bind('predictions');

var service = {};

service.getPredictions = getPredictions;
service.predictMatch = predictMatch;

module.exports = service;


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
