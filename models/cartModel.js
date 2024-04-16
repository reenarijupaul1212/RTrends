const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItem'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });


module.exports = mongoose.model('Cart', cartSchema);