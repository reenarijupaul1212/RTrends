const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    
    name: {
    type:String,
    required: true,
    unique: true,
    },
  
    onDiscount: {
        type: Boolean,
        default: false
    },
    discountName: {
        type: String,
        default: 'Category Discount'
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    soldCount:{
        type:Number,
        default:0
    },
    status: Boolean,
},{timestamps:true});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
