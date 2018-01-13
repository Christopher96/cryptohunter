var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
mongoose.connect('mongodb://root:root@localhost:4001/test', {
    useMongoClient: true
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
    if (req.body.coin_id, req.body.user_id && req.body.amount) {
        return getUser(req.body.user_id).then((user) => {
            this.user = user;
            return getCoin(req.body.coin_id);
        }).then((coin) => {
            this.coin = coin;
            this.tradePrice = this.coin.price_usd * req.body.amount;
            if(this.tradePrice >= 1) {
                var decimalPlaces = 3;
                var pow = Math.pow(10, decimalPlaces);
                this.tradePrice = Math.round(this.tradePrice * pow) / pow;

                return Holding.findOne({
                    user_id: req.body.user_id,
                    coin_id: this.coin.id
                });
            }
        })
    } else {
        res.status(500).send();
    }
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
    initTrade(req, res).then((holding) => {
        if (this.user.balance_usd >= this.tradePrice) {
            this.user.balance_usd -= this.tradePrice;
            this.user.save();

            if (!holding) {
                var newHolding = new Holding();
                newHolding.amount = req.body.amount;
                newHolding.coin_id = req.body.coin_id;
                newHolding.user_id = req.body.user_id;
                newHolding.save();
            } else {
                holding.amount += req.body.amount;
                holding.save();
            }

            return res.status(200).json(this.user.balance_usd);
        }

        return res.status(406).send();
    });
});


router.post('/sell', (req, res) => {
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
                return res.status(200).json(this.user.balance_usd);

            }
        }

        return res.status(406).send();
    });
});

router.post('/signin', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({
        username: username,
        password: password
    }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }

        if (!user) {
            return res.status(400).send();
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

    var newuser = new User();
    newuser.username = username;
    newuser.password = password;
    newuser.balance_usd = 1000;
    newuser.networth_usd = 0;

    newuser.save((err, savedUser) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send();
    })
});


module.exports = router;
