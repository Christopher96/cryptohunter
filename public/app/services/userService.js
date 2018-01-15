angular.module('userService', [])
    .service('apiService', function($http) {
        this.user = null;

        this.signIn = (username, password) => {
            return new Promise((resolve, reject) => {
                this.post('/api/signin', {
                    username: username,
                    password: password
                }).then((res) => {
                    if (res.status == 200) {
                        this.user = res.data;
                        resolve();
                    } else {
                        reject();
                    }
                })
            });
        }

        this.signIn = (username, password) => {
            return new Promise((resolve, reject) => {
                this.post('/api/signin', {
                    username: username,
                    password: password
                }).then((res) => {
                    if (res.status == 200) {
                        this.user = res.data;
                        resolve();
                    } else {
                        reject();
                    }
                })
            });
        }

        this.post = (action, data = {}) => {
            if (this.user) {
                data.user_id = this.user._id;
            }

            var req = {
                method: 'POST',
                url: action,
                headers: {
                    'Content-Type': "application/json"
                },
                data: data
            }
            return $http(req);
        }
    });
