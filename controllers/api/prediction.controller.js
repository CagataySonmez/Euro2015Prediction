var config = require('config');
var express = require('express');
var router = express.Router();
var predictionService = require('services/prediction.service');
var allPointsCache = null;

// routes
router.post('/predictMatch', predictMatch);
router.get('/predictions/:username', getPredictions);
router.get('/getAllPoints/:username', getAllPoints);
router.get('/getTop25Points/:username', getTop25Points);

module.exports = router;

function predictMatch(req, res) {
    if (req.body.username !== req.user.un)
        return res.status(401).send('Sadece kendi hesabınız için tahmin girebilirsiniz!');

    predictionService.predictMatch(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getPredictions(req, res) {
    if (req.params.username !== req.user.un)
        return res.status(401).send('Sadece kendi hesabınız için tahminleri görebilirsiniz!');

    predictionService.getPredictions(req.params.username)
        .then(function (result) {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllPoints(req, res) {
    getPoints(req, res, false);
}

function getTop25Points(req, res) {
    getPoints(req, res, true);
}

function getPoints(req, res, isTop25) {
    if (req.params.username !== req.user.un)
        return res.status(401).send('Sadece kendi hesabınız için sonuçları görebilirsiniz!');

    predictionService.getPoint(req.params.username)
        .then(function (result) {
            if (result) {
                if(allPointsCache !== null){
                    res.send(preparePoints(allPointsCache,result,isTop25));
                }
                else{
                    predictionService.getPoints()
                        .then(function (points) {
                            if (points) {
                                allPointsCache = points;
                                res.send(preparePoints(points,result,isTop25));     
                            } else {
                                res.sendStatus(404);
                            }
                        })
                        .catch(function (err) {
                            res.status(400).send(err);
                        });
                }
                
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function preparePoints(allPoints, userPoint, isTop25) {
    var res = new Object();
    
    if(isTop25)
        res.points = allPoints.slice(0,25);
    else
        res.points = allPoints;

    res.yourPoint = userPoint;

    for(var i=0; i<allPoints.length; i++){
        if(allPoints[i].username === userPoint.username){
            res.yourPoint.place = i+1;
            break;
        }
    }

    return res;
}