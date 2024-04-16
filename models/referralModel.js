// Import Mongoose
const mongoose = require('mongoose');

// Define the schema for the ReferralOffer model
const referralOfferSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true // Ensure uniqueness of referral codes
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0 // Minimum discount amount should be 0 or more
    },
    isActive: {
        type: Boolean,
        default: true // Set the offer as active by default
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the ReferralOffer model based on the schema
const ReferralOffer = mongoose.model('ReferralOffer', referralOfferSchema);

// Export the ReferralOffer model to be used in other parts of the application
module.exports = ReferralOffer;
