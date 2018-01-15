angular.module('userControllers', [])
    .config(() => {
    })
    .controller('signInCtrl', function($scope) {
        $scope.showPassword = false;
        $scope.signIn = () => {

        }
    })
    .controller('signUpCtrl', function($scope) {
        $scope.showPassword = false;
        $scope.signUp = () => {

        }
    })
    .controller('homeCtrl', function($http, $scope, $location) {

        $scope.user = null;

        $scope.canTrade = false;
        $scope.isTrading = false;
        $scope.isSelling = false;

        $scope.modal = {};

        $scope.tradeCoin = (coin, sell = false) => {
            $scope.isSelling = sell;
            $scope.modal.coin = coin;

            var holding = $scope.findHolding(coin.id);
            if (holding) {
                console.log(holding);
                $scope.modal.holding = holding;
            } else {
                $scope.modal.holding = null;
            }

            $scope.tradeClear();
        }

        $scope.tradeUpdate = () => {
            $scope.modal.trade_price = $scope.modal.amount * $scope.modal.coin.price_usd;

            if ($scope.isSelling) {
                $scope.canTrade = !$scope.isTrading &&
                    $scope.modal.trade_price >= 1;
            } else {
                $scope.canTrade = !$scope.isTrading &&
                    $scope.user.balance_usd >= $scope.modal.trade_price &&
                    $scope.modal.trade_price >= 1;
            }
        }

        $scope.tradeMax = () => {
            if ($scope.isSelling) {
                $scope.modal.amount = $scope.modal.holding.amount;
            } else {
                $scope.modal.amount = $scope.user.balance_usd / $scope.modal.coin.price_usd;
                var pow = Math.pow(10, 5);
                $scope.modal.amount = Math.floor($scope.modal.amount * pow) / pow;
            }
            $scope.tradeUpdate();
        }

        $scope.tradeClear = () => {
            $scope.modal.amount = 0;
            $scope.tradeUpdate();
        }

        $scope.coins = {};

        $scope.getCoins = () => {
            return new Promise((resolve, reject) => {
                $http.get('/api/coins').then((res) => {
                    if (res.status == 200) {
                        resolve(res.data);
                    } else {
                        reject();
                    }
                });
            });
        }

        $scope.makeTrade = () => {
            $scope.isTrading = true;

            if ($scope.isSelling) {
                $scope.post('/api/sell', {
                    coin_id: $scope.modal.coin.id,
                    amount: $scope.modal.amount
                }).then((res) => {
                    $scope.user.balance_usd = res.data.balance;
                    $scope.modal.holding = res.data.holding;
                    $scope.getHoldings();
                    $scope.tradeClear();
                }).finally(() => {
                    $scope.isTrading = false;
                });
            } else {
                $scope.post('/api/buy', {
                    coin_id: $scope.modal.coin.id,
                    amount: $scope.modal.amount
                }).then((res) => {
                    $scope.user.balance_usd = res.data.balance;
                    $scope.modal.holding = res.data.holding;
                    $scope.getHoldings();
                    $scope.tradeClear();
                }).finally(() => {
                    $scope.isTrading = false;
                });
            }
        }

        $scope.holdings = {};
        $scope.net_worth = 0;

        $scope.getHoldings = () => {
            return new Promise((resolve, reject) => {
                $scope.post(
                    '/api/holdings'
                ).then((res) => {
                    if (res.status == 200) {
                        var holdings = res.data;
                        $scope.net_worth = 0;

                        for (var i = 0; i < holdings.length; i++) {
                            var holding = holdings[i];
                            holding.coin = $scope.findCoin(holding.coin_id);

                            if (holding.coin) {
                                holding.worth = (holding.coin.price_usd * holding.amount);
                                $scope.net_worth += holding.worth;

                                if ($scope.modal.coin) {
                                    if ($scope.modal.coin.id == holding.coin.id) {
                                        $scope.modal.coin = holding.coin;
                                    }
                                }
                            } else {
                                delete holdings[i];
                            }

                            holdings[i] = holding;
                        }
                        $scope.net_worth += $scope.user.balance_usd;
                        $scope.holdings = holdings;

                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        }

        $scope.findCoin = (coin_id) => {
            for (i in $scope.coins) {
                var coin = $scope.coins[i];
                if (coin.id == coin_id) {
                    return coin;
                }
            }
            return false;
        }

        $scope.findHolding = (coin_id) => {
            for (i in $scope.holdings) {
                var holding = $scope.holdings[i];
                if (holding.coin_id == coin_id) {
                    return holding;
                }
            }

            return false;
        }

        $scope.signIn = (username, password) => {
            return new Promise((resolve, reject) => {
                $scope.post('/api/signin', {
                    username: username,
                    password: password
                }).then((res) => {
                    if (res.status == 200) {
                        resolve(res.data);
                    } else {
                        reject();
                    }
                })
            });
        }

        $scope.post = (action, data = {}) => {
            if ($scope.user) {
                data.user_id = $scope.user._id;
            }

            var req = {
                method: 'POST',
                url: action,
                headers: {
                    'Content-Type': "application/json"
                },
                data: data
            }
            return $http(req);
        }

        $scope.refresh = () => {
            $scope.getCoins()
                .then((coins) => {
                    $scope.coins = coins;
                    $scope.getHoldings();
                });
        }

        $scope.signIn("123", "123")
            .then((user) => {
                $scope.user = user;
                setInterval($scope.refresh, 10000);
            })

        $scope.refresh();
    });
