var config = require('config');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

function authenticateUser(req, res) {
    console.log('------------user.controller -> authenticate---------------');
    console.log(req.body);
    console.log('--------------------------------------------');

    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                console.log('------------user.controller -> after resolve---------------');
                console.log(token);
                console.log('--------------------------------------------');
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {

    console.log('------------getCurrentUser-------------------');
    console.log(req.user);
    console.log('--------------------------------------------');

    console.log('------------getCurrentUser token in the heade-------------------');
    console.log(req.headers.authorization);
    console.log('--------------------------------------------');

    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                console.log('------------getCurrentUser -> after resolve-------------------');
                console.log(user);
                console.log('--------------------------------------------');
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('Sadece kendi hesabınızı güncelleyebilirsiniz!');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('Sadece kendi hesabınızı silebilirsiniz');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}