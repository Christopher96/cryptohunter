angular.module('userControllers', [])
    .config(function() {
    })
    .controller('signUpCtrl', function(){
        console.log('signup');
    })
    .controller('signInCtrl', function(){
        console.log('signin');
    })
    .controller('homeCtrl', function($http, $scope, $location){

        $scope.holdings = {};
        $scope.coins = {};
        $scope.modal = {};

        $scope.tradeCoin = function(coin, sell = false) {
            $scope.modal.coin = coin;
            $scope.modal.sell = sell;

            var holding = findHolding(coin.name);
            if(holding) {
                $scope.modal.holding = holding.holding;
            }
            $scope.modal.holding = 0;
        }

        $scope.getCoins = function(){
            return new Promise(function(resolve, reject) {
                $http.get('/api/coins').then(function(res){
                    if(res.status == 200){
                        resolve(res.data);
                    } else {
                        reject();
                    }
                });
            });
        }

        $scope.getHoldings = function(user_id){
            $http.get('/api/holdings/'+user_id).then(function(res){
                if(res.status == 200){
                    var holdings = res.data;

                    for(var i = 0; i < holdings.length; i++) {
                        var holding = holdings[i];
                        holding.coin = $scope.findCoin(holding.coin_id);

                        if(holding.coin) {
                            holding.worth = (parseInt(holding.coin.price_usd) * parseInt(holding.holding));

                            if($scope.modal.coin) {
                                if(holding.coin_id == $scope.modal.coin.name) {
                                    $scope.modal.coin = holding.coin;
                                }
                            }
                        } else {
                            delete holdings[i];
                        }

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
            $scope.coins.forEach(function(coin, i) {
                if(coin.name == coin_id) {
                    return coin;
                }
            });

            return false;
        }

        $scope.findHolding = function(coin_id) {
            $scope.holdings.forEach(function(holding, i) {
                if(holding.coin_id == coin_id) {
                    return holding;
                }
            });

            return false;
        }

        $scope.sellCoin = function(holding) {
            console.log(holding);
        }
    });
