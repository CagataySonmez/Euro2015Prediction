var config = require('config');
var express = require('express');
var router = express.Router();
var predictionService = require('services/prediction.service');

// routes
router.post('/predictMatch', predictMatch);
router.get('/predictions/:username', getPredictions);
router.get('/getPoint/:username', getPoint);

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


function getPoint(req, res) {
    if (req.params.username !== req.user.un)
        return res.status(401).send('Sadece kendi hesabınız için sonuçları görebilirsiniz!');

    predictionService.getPoint(req.params.username)
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