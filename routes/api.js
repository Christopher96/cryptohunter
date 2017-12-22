const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@localhost:4001/test', {
    useMongoClient: true
});

const db = mongoose.connection;

db.on('error', function(err){
    console.log(err);
})

const request = require('request');
const path = require('path');

const appRoot = path.dirname(require.main.filename);

// Schemas
const User = require(appRoot + '/lib/User');

router.get('/currencies', function(req, res, next){
    request({
        uri: 'https://api.coinmarketcap.com/v1/ticker/?limit=10',
        method: 'GET',
    }, function(error, response, body) {
        res.send("<pre>"+body);
    });
});

router.post('/signin', function(req, res){
    const username = req.body.username;
    const password = req.body.password;

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
    const username = req.body.username;
    const password = req.body.password;
    
    let newuser = new User();
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
    const task = req.body;
    const updTask = {};

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
