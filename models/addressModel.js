// address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

fullName: {
    type: String,
    default:""
},
  houseName: {
    type: String,
    
    default:"",
  },
  email: {
    type: String,
    default:"",
  },
  mobile: {
    type: Number,
    default:0,
  },
  streetAddr: {
    type: String,
    
    default:"",
  },
  city: {
    type: String,
    
    default:"",
  },
  state: {
    type: String,
    
    default:"",
  },
  country: {
    type: String,
    
    default:"",
  },
  pincode: {
    type: Number,
    
    default:0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  delivery:{
    type:Boolean,
    required:true,
    default:false,
  }
},{timestamps: true });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
