angular.module('myapp', ['appRoutes', 'userControllers'])
    .filter('nComma', function() {
        return function(x) {
            if (x)
                return x.toLocaleString('en-US', { minimumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    });