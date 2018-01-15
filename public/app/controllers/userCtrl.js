angular.module('userCtrl', [])
    .config(() => {
    })
    .controller('signInCtrl', function($location, $scope, apiService) {
        $scope.showPassword = false;
        $scope.tipTxt = 'Don\'t have a user?';
        $scope.titleTxt = 'Sign in';
        $scope.linkTxt = 'Sign up';
        $scope.link = '/signup';
        $scope.signIn = () => {
            $scope.signIn($scope.username, $scope.password).then(() => {
                $location.path('/');
            }).catch((message) => {
                $scope.error = message;
            })
        }
    })
    .controller('signUpCtrl', function($scope, apiService) {
        $scope.showPassword = false;
        $scope.tipTxt = 'Already have a user?';
        $scope.titleTxt = 'Sign up';
        $scope.linkTxt = 'Sign in';
        $scope.link = '/signin';
        $scope.signUp = () => {
            $scope.signUp($scope.username, $scope.password).then(() => {
                $location.path('/signin');
            }).catch((message) => {
                $scope.error = message;
            })
        }
    })
    .controller('signOutCtrl', function($location, apiService) {
        apiService.user = null;
        $location.path('/signin');
    })
    .controller('homeCtrl', function($http, $scope, $location, apiService) {

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
                    apiService.user.balance_usd >= $scope.modal.trade_price &&
                    $scope.modal.trade_price >= 1;
            }
        }

        $scope.tradeMax = () => {
            if ($scope.isSelling) {
                $scope.modal.amount = $scope.modal.holding.amount;
            } else {
                $scope.modal.amount = apiService.user.balance_usd / $scope.modal.coin.price_usd;
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
                apiService.post('/api/sell', {
                    coin_id: $scope.modal.coin.id,
                    amount: $scope.modal.amount
                }).then((res) => {
                    apiService.user.balance_usd = res.data.balance;
                    $scope.modal.holding = res.data.holding;
                    $scope.getHoldings();
                    $scope.tradeClear();
                }).finally(() => {
                    $scope.isTrading = false;
                });
            } else {
                apiService.post('/api/buy', {
                    coin_id: $scope.modal.coin.id,
                    amount: $scope.modal.amount
                }).then((res) => {
                    apiService.user.balance_usd = res.data.balance;
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
                apiService.post(
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
                        $scope.net_worth += apiService.user.balance_usd;
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


        $scope.refresh = () => {
            $scope.getCoins()
                .then((coins) => {
                    $scope.coins = coins;
                    $scope.getHoldings();
                });
        }

        apiService.signIn("123", "123")
            .then((user) => {
                $scope.user = apiService.user;
                setInterval($scope.refresh, 10000);
            })

        $scope.refresh();
    });
