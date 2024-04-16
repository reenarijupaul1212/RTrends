const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true

    },
    image: {
        type: String,
        required: true

    },
    active: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });
module.exports = mongoose.model('Banner', bannerSchema)