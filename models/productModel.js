const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    groupingID: {
        type: Number,
        default:1
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand', // Reference to the Brand collection
    },
    
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category collection
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        
        default:'red'
    },
    price : {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    active:{
        type:Boolean,
        default:true
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    soldCount:{
        type:Number,
        default:0
    },
    onOffer: {
        type: Boolean,
        default: false
    },
    rateOfDiscount: {
        type: Number,
        default: 0
    },
    offerPrice: {
        type: Number,
        default: 0
    }, 
   
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]},
    {timestamps:true},
    { strict: false } ,
);

// // Create a middleware function to calculate offer price before updating
// productSchema.pre('findOneAndUpdate', function (next) {
//     const updateFields = this.getUpdate();

//     // Check if price or rate of discount is modified in the update fields
//     const isPriceModified = updateFields.price !== undefined;
//     const isRateOfDiscountModified = updateFields.rateOfDiscount !== undefined;

//     if (isPriceModified || isRateOfDiscountModified) {
//         const product = this.findOne();

//         if (product.rateOfDiscount > 0) {
//             const discountAmount = (product.price * product.rateOfDiscount) / 100;
//             product.offerPrice = product.price - discountAmount;
//             product.onOffer = true;
//         } else {
//             product.offerPrice = product.price; // Set offer price same as price when no discount
//             product.onOffer = false;
//         }
//     }

//     next(); // Call next to continue with the update operation
// });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
