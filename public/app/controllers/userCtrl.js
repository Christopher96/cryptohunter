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

        $scope.modal = {
            title: "Buy"
        }
        $scope.trade = function(coin, sell) {
            $scope.modal.title = (sell) ? 'Buy' : 'Sell';
            $scope.modal.title += ' ' + coin.symbol;
            $scope.modal.change = coin.percent_change_24h;
            $scope.modal.selling = sell;
            if(sell) {
            }
        }

        $scope.getCoins = function(){
            $http.get('/api/coins').then(function(res){
                if(res.status == 200){
                    var coins = res.data;
                    $scope.coins = coins;
                }
            });
        }
        $scope.getCoins();

        $scope.getHoldings = function(){
            $http.get('/api/holdings').then(function(res){
                if(res.status == 200){
                    var holdings = res.data;

                    for(var i = 0; i < holdings.length; i++) {
                        var holding = holdings[i];
                        holding.worth = (parseInt(holding.price_usd) * parseInt(holding.holding));
                    }

                    $scope.holdings = holdings;
                }
            });
        }
        $scope.getHoldings();

        $scope.sellCoin = function(holding) {
            console.log(holding);
        }
    });
