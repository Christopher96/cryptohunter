/*
 * Angular routing provider for frontend routes
 */
angular.module('appRoutes', ['ngRoute'])
.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/pages/home.html',
            controller: 'homeCtrl',
            controllerAs: 'home'
        })
        .when('/signin', {
            templateUrl: 'app/views/pages/signin.html',
            controller: 'signInCtrl',
        })
        .when('/signup', {
            templateUrl: 'app/views/pages/signup.html',
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
