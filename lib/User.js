const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String},
    last_signin: {type: String},
    balance_usd: {type: Number},
    networth_usd: {type: Number}
});

const UserData = mongoose.model('user', userSchema);
module.exports = UserData;
