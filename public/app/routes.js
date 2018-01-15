angular.module('appRoutes', ['ngRoute'])
.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/pages/home.html',
            controller: 'homeCtrl',
            controllerAs: 'home'
        })
        .when('/signin', {
            templateUrl: 'app/views/pages/login.html',
            controller: 'signInCtrl',
        })
        .when('/signup', {
            templateUrl: 'app/views/pages/login.html',
            controller: 'signUpCtrl',
        })
        .when('/signout', {
            template: '',
            controller: 'signOutCtrl',
        })
        .otherwise({
            redirectTo: '/'
        })

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
})
