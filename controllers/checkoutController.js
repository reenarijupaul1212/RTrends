const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');
const Path = require('path');
const { error } = require('console');
const Address = require('../models/addressModel');
const Order = require('../models/ordermodel');
const WishList = require('../models/wishListModel');
const Coupon = require('../models/couponModel');
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const cors=require("cors");



module.exports = {
    renderPaymentPage: async (req, res, next) => {
        try {
            if (!req.user) {
                req.session.message = {
                    type: 'danger',
                    message: 'Session timed out. Please login to proceed to the payment page!',
                };
                return res.send(`
                    <script>
                        Swal.fire({
                            icon: 'error',
                            title: 'Session Timeout',
                            text: 'Please login to proceed to the payment page!',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false
                        }).then(() => {
                            window.location.href = '/';
                        });
                    </script>
                `);
            }

            const userID = req.user._id;
            const orderID = req.params.orderid;

            if (!orderID) {
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to process the order. Please try again!',
                };
                return res.redirect('/user/checkout');
            }

            const orderData = await Order.findById(orderID)
                .populate('user') // Populate user reference
                .populate({
                    path: 'products.product', // Populate products with their referenced products
                    model: 'Product' // Assuming your product model is named 'Product'
                })
                // Populate coupon reference
                .exec();

            if (orderData.status !== 'pending' || orderData.clientOrderProcessingCompleted === true) {
                req.session.message = {
                    type: 'danger',
                    message: 'That order has already been placed!',
                };
                return res.redirect('/user/checkout');
            }

            // Rest of your code...

            if (orderData) {
                return res.render('users/paymentPage.ejs', { orderData, user: req.user });
            } else {
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to process the order. Please try again!',
                };
                return res.redirect('/user/checkout');
            }
        } catch (err) {
            next(err);
        }
    },

    applyOffers: async (req, res) => {
        try {
            // Extract data from the request body
            const { selectedAddressId, userId, fullName, houseName, streetAddress, city, state, postcode, phone, email, orderNotes, couponCode, paymentOption, updatedCart } = req.body;
            const userCart = req.session.userCart;
            console.log('not session', userCart);
            console.log('hai selected id', selectedAddressId);
            const addressString = `${fullName}, ${houseName},${streetAddress}, ${city}, ${state}, ${postcode},${phone}`;
            const userid = req.user._id;
            console.log(selectedAddressId);
            if (selectedAddressId === 'new') {
                console.log('newaddress');
                // Add the address for the user
                const newAddress = new Address({
                    userId: userid,
                    fullName: fullName,
                    houseName: houseName,
                    email: email,
                    mobile: phone,
                    streetAddr: streetAddress,
                    city: city,
                    state: state,
                    country: 'YourCountryHere', // Provide the country as needed
                    pincode: postcode,
                    delivery: true, // Assuming this is a delivery address
                });
    
                const savedAddress = await newAddress.save();
                console.log('savedAddress', savedAddress);
                if (!savedAddress) {
                    console.log('addes is not saved');
                    throw new Error('Failed to save the new address');
                }
            }
    
            const cartid = userCart.items[0].cartID;
            console.log('cartid', cartid);
    
            // Retrieve cart items along with associated products and categories
            let cartItems = await CartItem.find({ cartID: cartid })
                .populate({
                    path: 'product',
                    match: { $expr: { $gt: ["$stock", "$quantity"] } }, // Ensure quantity is less than stock
                    populate: {
                        path: 'category',
                        model: Category,
                    },
                })
                .exec();
    
            console.log('cartItems', cartItems);
    
            // Check if cartItems is an array and not empty
            if (Array.isArray(cartItems) && cartItems.length > 0) {
                // Filter out items where quantity is less than product stock
                cartItems = cartItems.filter(item => item.product.stock > item.quantity);
                console.log('Cart items with quantity less than product stock:', cartItems);
            } else {
                console.log('No valid cart items found.');
            }
    
            // Initialize variables to hold the total discount amount and category IDs
            let totalCategoryDiscount = 0;
            const categoryIdsProcessed = new Set();
    
            // Iterate through each cart item to calculate category discounts
            for (const cartItem of cartItems) {
                const productCategory = cartItem.product.category;
    
                // Check if the category is not already processed and has a discount
                if (!categoryIdsProcessed.has(productCategory._id) && productCategory.onDiscount) {
                    categoryIdsProcessed.add(productCategory._id);
    
                    // Calculate discount amount for the cart item based on category discount percentage
                    const discountAmount = productCategory.discountAmount;
                    totalCategoryDiscount += discountAmount;
    
                    // Access offer price from the product object within each cart item
                    const offerPrice = cartItem.product.offerPrice;
                    console.log('Offer Price:', offerPrice);
    
                    // Other calculations or operations based on offer price...
                }
            }
    
            // Now totalCategoryDiscount holds the total discount amount for all cart items eligible for category discounts
            console.log('Total category discount amount:', totalCategoryDiscount);
    
            // Calculate total discount amount if coupon code is applied
            let totalAfterDis_codeApply = 0;
            if (couponCode !== '') {
                totalAfterDis_codeApply = req.session.discountAmount_codeApply ?? 0;
            }
            console.log('Total discount amount:', totalAfterDis_codeApply);
    
            // Calculate final price
            const totalPrice = req.session.totalPrice ?? 0;
            const finalPrice = totalPrice - totalCategoryDiscount - totalAfterDis_codeApply;
            console.log('Final Price:', finalPrice);
    
            console.log('cartereena', cartItems);
    
            // Create a new order object
            const order = new Order({
                user: userId,
                products: cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                status: 'pending',
                paymentStatus: 'pending',
                grossTotal: totalPrice,
                couponApplied: couponCode,
                discountAmount: totalAfterDis_codeApply,
                categoryDiscount: totalCategoryDiscount,
                finalPrice: finalPrice,
                paymentOption: paymentOption,
                shippingAddress: addressString,
            });
            console.log('ordersaved', order);
    
            // Save the order to the database
            const savedOrder = await order.save();
            if (savedOrder) {
                console.log('Order saved successfully:', savedOrder);
                let orderId = savedOrder._id;
                let url = `/paymentPage/${orderId}`;
                return res.status(201).json({ "success": true, "message": "created new order ", "url": url });
            } else {
                throw new Error('Failed to save the new order');
            }
        } catch (error) {
            console.log('error in place order ', error);
            return res.status(500).json({ "success": false, "message": "Failed to process address and coupon server facing some issues !" });
        }
    },
    


    checkOut: async (req, res) => {
        var addressString;
        try {
            // Retrieve user's addresses
            // const address = await Address.find({ userId: req.user._id }).select('fullName houseName streetAddr city state pincode mobile email');
            const address = await Address.find({ userId: req.user._id })
                .sort({ updatedAt: -1 }).limit(4)// Sort by createdAt field in descending order (-1)
                .select('fullName houseName streetAddr city state pincode mobile email')
                .exec();
            // Initialize an empty object to store the values

            console.log('address', address);
            // Iterate over each address object in the add array

            // Construct a string containing the values separated by commas
            addressString = `${address.fullName},${address.houseName} ,${address.streetAddr}, ${address.city}, ${address.state}, ${address.pincode},${address.pincode}`;

            // Add the string to the object with the address _id as the key


            const userid = req.user._id;

            // Retrieve user's cart from the database
            const userCart = await Cart.findOne({ userID: userid }).populate({
                path: 'items',
                model: CartItem,
                match: { quantity: { $gt: 0 }}, // Match items with quantity greater than one
                populate: {
                    path: 'product',
                    model: Product,
                    select: 'name image stock price'
                },
            });
            console.log('cartss',userCart);
            const updatedCart = userCart.items.filter(item => item.quantity <= item.product.stock);
            console.log('updateditem:', updatedCart);
            userCart.items=updatedCart;
            if (!userCart) {
                // Handle case whereser's cart is not found
                console.error('Error: User cart not found');
                return res.status(404).send('User carts from checkout not found');
            }

            // Retrieve total price from session
            const totalPrice = req.session.totalPrice;
            console.log('cartssssss', userCart);
            req.session.userCart= userCart;
            req.flash('sucess', 'added');
            const ca=req.session.userCart;
            console.log('sessioncart',ca);
            message = req.flash();
            // Render checkout page with data
            return res.status(200).render('users/checkout', { totalPrice, addressString, address: address, userid, user: req.user, userCart, message });
        } catch (error) {
            console.error('Error:', error);
            // Handle error response
            return res.status(500).send('Internal Server Error');
        }
    },
    proceedToBuy: async (req, res) => {
        try {

            const { total } = req.body;
            req.session.totalPrice = total;
            req.session.discountAmount_codeApply = 0.00;

            // Redirect the client to "/checkOut"
            return res.status(200).redirect('/checkOut');
        } catch (error) {
            console.error('Error:', error);
            // Handle error response
            return res.status(500).send('Internal Server Error');
        }
    },
    couponVerificationHandler: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ "success": false, "message": "Your session timed out. Please login to access checkout features.", "redirectUrl": '/login' });
            }

            const { couponCode } = req.body;
            const couponCod = couponCode.toLowerCase();
            console.log(couponCod)
            const couponData = await Coupon.findOne({ code: couponCod });


            if (!couponData) {

                return res.status(400).json({ "success": false, "message": "It was an invalid coupon code!" });
            }

            const currentDate = new Date();
            const expirationDate = new Date(couponData.expirationDate);

            if (currentDate > expirationDate || !couponData.isActive) {
                return res.status(200).json({ "success": false, "message": "The coupon has expired or is inactive!" });
            }

            // Calculate discount amount
            const TotalAmount = req.session.totalPrice;
            const discountAmount = calculateDiscount(couponData.rateOfDiscount, couponData.maximumDiscount, TotalAmount);
            const totalAfterDis = req.session.totalPrice - discountAmount;
            req.session.discountAmount_codeApply = discountAmount;

            return res.status(200).json({ "success": true, "message": "It is a valid Coupon!", "discount": discountAmount, "totalAfterDiscount": totalAfterDis });

        } catch (err) {
            console.error('Error verifying coupon:', err);
            return res.status(500).json({ "success": false, "message": "Failed to verify coupon. Server facing some issues!" });
        }
    },

};

// Function to calculate discount amount
function calculateDiscount(rateOfDiscount, maximumDiscount, TotalAmount) {

    const discount = Math.min((rateOfDiscount / 100) * TotalAmount, maximumDiscount);
    return discount;
}