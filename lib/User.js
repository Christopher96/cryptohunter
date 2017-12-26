var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String},
    last_signin: {type: String},
    balance_usd: {type: Number},
    networth_usd: {type: Number}
});

var UserData = mongoose.model('user', userSchema);
module.exports = UserData;
