const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;
const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },  
  orderDate: {
    type: Date,
    default: Date.now,
},

  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product', // Assuming you have a Product model
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered','cancelled','returned'],
    default: 'pending'
  },
  
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'COD', 'failed', 'refunded', 'cancelled'],
    required: true,
},
razorpayTransactionId: {
  type: String,

  
},
grossTotal: {
  type: Number,
  required: true,
},

couponApplied: {
  type:String,
  default:""
},
discountAmount: {
  type: Number,
  default: 0
},
categoryDiscount: {
  type: Number,
  default: 0
},

finalPrice: {
  type: Number,
  required: true,
},
  paymentOption:{
    type:String,
    required: true
  },
  shippingAddress: {
    type: String,
    required: true
  },
  clientOrderProcessingCompleted: {
    type: Boolean,
    default: false
},
reason:[
  {
    details:{
      type:String,

    },
    date:{
      type:Date
    }

  }
]



  // You can add more fields as needed
}, { timestamps: true });

// Create a model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
