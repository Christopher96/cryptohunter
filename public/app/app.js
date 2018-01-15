angular.module('myapp', ['appRoutes', 'userControllers', 'apiService'])
    .filter('nComma', function() {
        return function(x) {
            if (x != null)
                // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return x.toLocaleString('en-US', { minimumFractionDigits: 5 });
        }
    });
