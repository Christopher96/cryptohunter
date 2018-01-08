var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@localhost:4001/test', {
    useMongoClient: true
});

var db = mongoose.connection;

db.on('error', function(err){
    console.log(err);
})

var request = require('request');
var path = require('path');

var appRoot = path.dirname(require.main.filename);
var tickerURL = 'https://api.coinmarketcap.com/v1/ticker';

// Schemas
var User = require(appRoot + '/lib/User');
var Holding = require(appRoot + '/lib/Holding');
//
// var newholding = {
//     user_id: '123',
//     coin_id: 'bitcoin',
//     holding: '123'
// }

// var holding = new Holding(newholding);
// holding.save();

router.get('/coins', function(req, res, next){
    request({
        uri: tickerURL + '?limit=10',
        method: 'GET',
    }, function(error, response, body) {
        if(!error && response.statusCode == 200){
            return res.status(200).json(JSON.parse(body));
        } else {
            console.log(error);
        }
    });
});

router.post('/holdings', function(req, res, next) {
    console.log(req.params);
    return;
    if(req.params.user_id) {
        Holding.find({user_id: req.params.user_id}, function(err, holdings) {
            if(!err) {
                var newHoldings = [];
                holdings.forEach(function(holding, i) {
                    // delete holding._doc.__v;
                    // delete holding._doc._id;
                    newHoldings.push(holding._doc);
                });

                res.status(200).json(newHoldings);
            } else {
                console.log(err);
            }
        });
    }
});

router.post('/buy/:coin', function(req, res) {

});

router.post('/signin', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({
        username: username,
        password: password
    }, function(err, user){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        if(!user){
            return res.status(404).send();
        }

        User.update(user, {$set: {last_signin: Date.now()}}, function(err, user){
            if(err) {
                console.log(err);
                return res.status(500).send();
            }

            return res.status(200).send(user);
        });
    });
})

router.post('/signup', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    var newuser = new User();
    newuser.username = username;
    newuser.password = password;

    newuser.save(function(err, savedUser){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send();
    })
});


// Get all tasks
router.get('/tasks', function(req, res, next){
    db.tasks.find(function(err, tasks){
        if(err){
            res.send(err);
        }
        res.json(tasks);
    });
});

// Get single task
router.get('/task/:id', function(req, res, next){
    db.tasks.findOne({_id: mongojs.ObjectId(req.params.id)}, function(err, task){
        if(err){
            res.send(err);
        }
        res.json(task);
    });
});

// Save a task
router.post('/task', function(req, res, next){
    var task = req.body;
    if(!task.title || !(task.isDone + '')){
        res.status(400);
        res.json({
            "error": "Bad Data"
        });
    } else {
        db.tasks.save(task, function(err, task){
            if(err){
                res.send(err);
            }
            res.json(task);
        });
    }
});

// Delete a task
router.delete('/task/:id', function(req, res, next){
    db.tasks.remove({_id: mongojs.ObjectId(req.params.id)}, function(err, task){
        if(err){
            res.send(err);
        }
        res.json(task);
    });
});

// Update a task
router.put('/task/:id', function(req, res, next){
    var task = req.body;
    var updTask = {};

    if(task.isDone){
        updTask.isDone = task.isDone;
    }

    if(task.title){
        updTask.title = task.title;
    }

    if(!updTask){
        res.status(400);
        res.json({
            "error": "Bad Data"
        })
    } else {
        db.tasks.update({_id: mongojs.ObjectId(req.params.id)}, updTask, {}, function(err, task){
            if(err){
                res.send(err);
            }
            res.json(task);
        });
    }
});

module.exports = router;
