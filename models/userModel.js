

//user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage:{
    type:String,
    default:'profile.jpg'
},
  password: {
    type: String,
    required: true,
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'

}],  

  mobile: {
    type: Number,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  userStatus: {
    type: Boolean,
    default: false,
  },
  isVerified:{
  type:Boolean,
  default:false,
}, 
wishlist: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'WishList' // Reference the WishList model
},
  otp:String,
  resetPasswordToken: String,  
  resetPasswordExpires: Date, 
},{timestamps:true});

const User = mongoose.model('User', userSchema);

module.exports = User;