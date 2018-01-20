/*
 * API service for user, contains sign in, signup and session management
 */
angular.module('userService', [])
    .service('apiService', function($window, $http) {

        // Sets a user to localstorage
        this.setUser = (user) => {
            return $window.localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Gets the user from localstorage
        this.getUser = () => {
            try {
                return JSON.parse($window.localStorage.getItem('user'));
            } catch(e) {
                return false;
            }
        }

        // Signs the user in with the API
        this.signIn = (username, password) => {
            return new Promise((resolve, reject) => {
                this.post('/api/signin', {
                    username: username,
                    password: password
                }).then((res) => {
                    if (res.status == 200) {
                        this.setUser(res.data);
                        resolve();
                    } else {
                        reject();
                    }
                }).catch((res) => {
                    reject(res.data);
                })
            });
        }

        // Signs up the user with the API
        this.signUp = (username, password, confirmPassword) => {
            return new Promise((resolve, reject) => {
                this.post('/api/signup', {
                    username: username,
                    password: password,
                    confirmPassword: confirmPassword
                }).then((res) => {
                    if (res.status == 200) {
                        this.setUser(res.data);
                        resolve();
                    } else {
                        reject();
                    }
                }).catch((res) => {
                    reject(res.data);
                });
            });
        }

        // Helper function for API posts
        this.post = (action, data = {}) => {
            if (this.getUser()) {
                data.user_id = this.getUser()._id;
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
