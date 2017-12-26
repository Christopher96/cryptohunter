angular.module('appRoutes', ['ngRoute'])
.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/pages/home.html',
            controller: 'homeCtrl',
            controllerAs: 'home'
        })
        .when('/signup', {
            templateUrl: 'app/views/pages/signup.html',
            controller: 'signUpCtrl',
            controllerAs: 'signup'
        })
        .when('/signin', {
            templateUrl: 'app/views/pages/signin.html',
            controller: 'signInCtrl',
	    controllerAs: 'signin'
        })
        .otherwise({
            redirectTo: '/'
        })

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
})
