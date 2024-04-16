const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,

    },
  
    image: {
        type: String,
        required: true

    },
    soldCount:{
        type:Number,
        default:0
    },
    active: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });
module.exports = mongoose.model('Brand', brandSchema)