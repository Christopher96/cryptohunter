/*
 * Controllers for sign in, sign up, sign out, home
 */

angular.module('userCtrl', [])
    .controller('signInCtrl', function($window, $scope, apiService) {
        $scope.showPassword = false;

        // Redirects to home authenticated otherwise show error message
        $scope.signIn = () => {
            $scope.isLoading = true;
            apiService.signIn($scope.username, $scope.password).then(() => {
                $window.location.href = '/';
            }).catch((message) => {
                $scope.error = message;
                $scope.$apply();
            }).then(() => {
                $scope.isLoading = false;
                $scope.$apply();
            });
        }
    })
    .controller('signUpCtrl', function($window, $scope, apiService) {
        $scope.showPassword = false;

        // Redirects to home authenticated otherwise show error message
        $scope.signUp = () => {
            $scope.isLoading = true;
            apiService.signUp($scope.username, $scope.password, $scope.confirm_password).then(() => {
                $window.location.href = '/';
            }).catch((message) => {
                $scope.error = message;
                $scope.$apply();
            }).then(() => {
                $scope.isLoading = false;
                $scope.$apply();
            })
        }
    })
    .controller('signOutCtrl', function($location, apiService) {
        // Reset user and redirect to signin
        apiService.setUser('');
        $location.path('/signin');
    })
    .controller('homeCtrl', function($http, $scope, $window, apiService) {
        $scope.user = null;

        // If there is a user session apply it to the scope otherwise redirect to signin
        if(apiService.getUser()) {
            $scope.user = apiService.getUser();
        } else {
            apiService.setUser('');
            $window.location.href = '/signin';
        }

        $scope.canTrade = false;
        $scope.isTrading = false;
        $scope.isSelling = false;

        $scope.modal = {};

        // Whenever a new trade modal is opened
        $scope.tradeCoin = (coin, sell = false) => {
            $scope.isSelling = sell;
            $scope.modal.coin = coin;

            var holding = $scope.findHolding(coin.id);
            if (holding) {
                $scope.modal.holding = holding;
            } else {
                $scope.modal.holding = null;
            }

            $scope.tradeClear();
        }

        // Update tradeprice in modal, triggered when amount is changed
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

        // Sets the max amount tradable in modal
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

        // Fetches all coins from API
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

        // Request to API depending for a sell or buy trade
        $scope.makeTrade = () => {
            $scope.isTrading = true;

            if ($scope.isSelling) {
                apiService.post('/api/sell', {
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
                apiService.post('/api/buy', {
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

        // Fetches all holdings for user from the API
        $scope.getHoldings = () => {
            return new Promise((resolve, reject) => {
                apiService.post(
                    '/api/holdings'
                ).then((res) => {
                    if (res.status == 200) {
                        var holdings = res.data;
                        $scope.net_worth = 0;

                        // Iterates through all holdings and increments networth and applies the coindata
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
                }).catch((res) => {
                    console.log(res);
                })
            });
        }

        // Finds a coin from the coinlist
        $scope.findCoin = (coin_id) => {
            for (i in $scope.coins) {
                var coin = $scope.coins[i];
                if (coin.id == coin_id) {
                    return coin;
                }
            }
            return false;
        }

        // Finds a holding from the holdingslist
        $scope.findHolding = (coin_id) => {
            for (i in $scope.holdings) {
                var holding = $scope.holdings[i];
                if (holding.coin_id == coin_id) {
                    return holding;
                }
            }

            return false;
        }

        // Refreshes coinlist and holdingslist
        $scope.refresh = () => {
            $scope.getCoins()
                .then((coins) => {
                    $scope.coins = coins;
                    $scope.getHoldings();
                });
        }

        $scope.refresh();
    });
