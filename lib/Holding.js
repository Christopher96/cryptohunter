/*
 * Mongoose schema for Holdings
 */

var mongoose = require("mongoose");

var holdingSchema = new mongoose.Schema({
    user_id: { type: String },
    coin_id: { type: String },
    amount: { type: Number }
});

var HoldingData = mongoose.model('holding', holdingSchema);
module.exports = HoldingData;