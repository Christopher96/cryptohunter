var app = angular.module('myapp', ['appRoutes', 'userControllers']);
app.filter('nComma', function() {
    return function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});
