var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var mongoUri = process.env.MONGODB_URI || 'mongodb://root:root@localhost:4001/test';
mongoose.connect(mongoUri, {
    useMongoClient: true,
    replset: {
        auto_reconnect: false,
        poolSize: 10,
        socketOptions: {
            keepAlive: 1000,
            connectTimeoutMS: 30000
        }
    },
    server: {
        poolSize: 5,
        socketOptions: {
            keepAlive: 1000,
            connectTimeoutMS: 30000
        }
    }
});

var db = mongoose.connection;

db.on('error', function(err) {
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
//     holding: '1.5'
// }

// var holding = new Holding(newholding);
// holding.save();


getUser = (user_id) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            _id: user_id,
        }, (err, user) => {
            if (!err) {
                resolve(user);
            } else {
                reject(err);
            }
        });
    });
}

getCoin = (coin_id) => {
    return new Promise((resolve, reject) => {
        request({
            uri: tickerURL + '/' + coin_id,
            method: 'GET',
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body)[0]);
            } else {
                reject(error);
            }
        });
    });
}

initTrade = (req, res) => {
    return getUser(req.body.user_id).then((user) => {
        this.user = user;
        return getCoin(req.body.coin_id);
    }).then((coin) => {
        this.coin = coin;
        this.tradePrice = this.coin.price_usd * req.body.amount;
        if (this.tradePrice >= 1) {
            return Holding.findOne({
                user_id: req.body.user_id,
                coin_id: this.coin.id
            });
            resolve();
        } else {
            reject();
        }
    });
}

router.get('/coins', (req, res, next) => {
    request({
        uri: tickerURL + '?limit=10',
        method: 'GET',
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            return res.status(200).json(JSON.parse(body));
        } else {
            return res.status(500).send();
            console.log(error);
        }
    });
});

router.post('/holdings', (req, res, next) => {
    if (req.body.user_id) {
        Holding.find({ "user_id": req.body.user_id }, (err, holdings) => {
            if (holdings) {
                var newHoldings = [];
                holdings.forEach((holding, i) => {
                    newHoldings.push(holding._doc);
                });

                return res.status(200).json(newHoldings);
            }
        });
    }
});

router.post('/buy', (req, res) => {
    if (!req.body.coin_id || !req.body.user_id || !req.body.amount) {
        res.status(500).send();
    }

    initTrade(req, res).then((holding) => {
        if (this.user.balance_usd >= this.tradePrice) {
            this.user.balance_usd -= this.tradePrice;

            var returnObj = {};
            if (!holding) {
                var newHolding = new Holding();
                newHolding.amount = req.body.amount;
                newHolding.coin_id = req.body.coin_id;
                newHolding.user_id = req.body.user_id;
                newHolding.save().then(() => {
                    this.user.save();
                });
                returnObj.holding = newHolding;
            } else {
                holding.amount += req.body.amount;
                holding.save().then(() => {
                    this.user.save();
                });
                returnObj.holding = holding;
            }
            returnObj.balance = this.user.balance_usd;
            return res.status(200).json(returnObj);
        }

        return res.status(406).send();
    });
});


router.post('/sell', (req, res) => {
    if (req.body.coin_id, req.body.user_id && req.body.amount) {
        initTrade(req, res).then((holding) => {
            if (holding) {
                if (holding.amount >= req.body.amount) {
                    this.user.balance_usd += this.tradePrice;
                    holding.amount -= req.body.amount;

                    this.user.save();

                    if (holding.amount * this.coin.price_usd < 1) {
                        holding.remove();
                    } else {
                        holding.save();
                    }
                    return res.status(200).json({
                        balance: this.user.balance_usd,
                        holding: holding
                    });

                }
            }

            return res.status(400).send();
        });
    } else {
        res.status(500).send();
    }
});

router.post('/signin', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        return res.status(400).send('Fill in all fields.');
    }

    User.findOne({
        username: username,
        password: password
    }, (err, user) => {
        if (err) {
            return res.status(500).send();
            console.log(err);
        }

        if (!user) {
            return res.status(404).send('Wrong username or password.');
        }

        user.last_signin = Date.now();
        user.save((err, savedUser) => {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }

            return res.status(200).send(user);
        });
    });
})

router.post('/signup', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    if (!username || !password || !confirmPassword) {
        return res.status(400).send('Fill in all fields.');
    }

    if (password != confirmPassword) {
        return res.status(401).send('Passwords does not match.');
    }

    var newuser = new User();
    newuser.username = username;
    newuser.password = password;
    newuser.balance_usd = 1000;
    newuser.networth_usd = 0;

    newuser.save((err, savedUser) => {
        if (err) {
            if (err.code == 11000)
                return res.status(402).send('User already exists.');
            else
                return res.status(500).send();
        }

        return res.status(200).send(newuser);
    })
});


module.exports = router;