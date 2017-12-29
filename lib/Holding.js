var mongoose = require("mongoose");

var holdingSchema = new mongoose.Schema({
    user_id: {type: Number},
    coin_id: {type: String},
    holding: {type: Number}
});

var HoldingData = mongoose.model('holding', holdingSchema);
module.exports = HoldingData;
