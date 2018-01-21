/*
 * Main file for initializing application
 */
angular.module('myapp', ['appRoutes', 'userCtrl', 'userService'])
    .filter('nComma', function() {
        return function(x) {
            if (x != null)
            // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return x.toLocaleString('en-US', { minimumFractionDigits: 5 });
        }
    })
    .filter('unix2date', function() {
        return function(x) {
            if (x != null) {
                var dt = new Date(x * 1000);
                return dt.getFullYear() + '/' + dt.getMonth() + '/' + dt.getDay();
            }
        }
    })