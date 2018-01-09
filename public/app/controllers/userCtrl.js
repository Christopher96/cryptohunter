angular.module('userControllers', [])
    .config(function() {})
    .controller('signUpCtrl', function() {
        console.log('signup');
    })
    .controller('signInCtrl', function() {
        console.log('signin');
    })
    .controller('homeCtrl', function($http, $scope, $location) {

        $scope.balance = 1000;
        $scope.isTrading = false;

        $scope.modal = {};

        $scope.tradeCoin = function(coin, sell = false) {
            $scope.modal.coin = coin;
            $scope.modal.sell = sell;
            $scope.modal.holding = 0;

            var holding = $scope.findHolding(coin.id);
            if (holding) {
                $scope.modal.holding = holding.holding;
            }
        }

        $scope.tradeUpdate = function() {
            $scope.modal.trade_price = $scope.modal.amount * $scope.modal.coin.price_usd;
        }

        $scope.tradeMax = function() {
            if ($scope.modal.sell) {
                $scope.modal.amount = $scope.modal.holding;
            } else {
                $scope.modal.amount = $scope.balance / $scope.modal.coin.price_usd;
            }
            $scope.tradeUpdate();
        }

        $scope.tradeClear = function() {
            $scope.modal.amount = 0;
            $scope.tradeUpdate();
        }

        $scope.coins = {};

        $scope.getCoins = function() {
            return new Promise(function(resolve, reject) {
                $http.get('/api/coins').then(function(res) {
                    if (res.status == 200) {
                        resolve(res.data);
                    } else {
                        reject();
                    }
                });
            });
        }

        $scope.makeTrade = function() {
            $scope.isTrading = !$scope.isTrading;
        }

        $scope.holdings = {};

        $scope.getHoldings = function(user_id) {
            var req = {
                method: 'POST',
                url: '/api/holdings',
                headers: {
                    'Content-Type': "application/json"
                },
                data: { user_id: user_id }
            }
            $http(req).then(function(res) {
                if (res.status == 200) {
                    var holdings = res.data;

                    for (var i = 0; i < holdings.length; i++) {
                        var holding = holdings[i];
                        holding.coin = $scope.findCoin(holding.coin_id);

                        if (holding.coin) {
                            holding.worth = (parseInt(holding.coin.price_usd) * parseInt(holding.holding));
                        } else {
                            delete holdings[i];
                        }

                        holdings[i] = holding;
                    }
                    $scope.holdings = holdings;
                }
            });
        }

        $scope.refresh = function() {
            $scope.getCoins().then(function(coins) {
                $scope.coins = coins;
                $scope.getHoldings(123);
            });
        }

        $scope.refresh();

        $scope.findCoin = function(coin_id) {
            for (i in $scope.coins) {
                var coin = $scope.coins[i];
                if (coin.id == coin_id) {
                    return coin;
                }
            }
            return false;
        }

        $scope.findHolding = function(coin_id) {
            for (i in $scope.holdings) {
                var holding = $scope.holdings[i];
                if (holding.coin_id == coin_id) {
                    return holding;
                }
            }

            return false;
        }

    });