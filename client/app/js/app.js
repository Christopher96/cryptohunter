angular.module('todo', []).
controller('todoController', ["$scope", function($scope){
    $scope.todos = [
        {
            "description": "Ta ut hunden",
            "isDone": false
        },
        {
            "description": "Rulla tummarna",
            "isDone": false
        },
        {
            "description": "Ring ett samtal till mamma",
            "isDone": false
        }
    ];

    $scope.reverse = true;

    $scope.sortBy = function(value) {
        $scope.reverse = (value == "new");
    }

    $scope.addTodo = function() {
        this.todos.push({
            description: $scope.newtodo,
            timestamp: Math.floor(Date.now()),
            isDone: false
        });
        $scope.newtodo = "";
    }

    $scope.clearCompleted = function() {
        this.todos = this.todos.filter(function(item) {
            return !item.isDone
        });
    }

}]);