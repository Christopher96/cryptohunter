angular.module('appRoutes', ['ngRoute'])
.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/pages/home.html'
        })
        .when('/signup', {
            templateUrl: 'app/views/pages/signup.html'
            controller: 'signUpCtrl'
        })
        .when('/signin', {
            templateUrl: 'app/views/pages/signin.html'
            controller: 'signInCtrl'
        })
        .otherwise({
            redirectTo: '/'
        })

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    })
})
