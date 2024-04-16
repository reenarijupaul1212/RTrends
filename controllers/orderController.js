const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');
const Path = require('path');
const { error } = require('console');
const Address = require('../models/addressModel');
const Order = require('../models/ordermodel');
const WishList = require('../models/wishListModel');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const pdf=require('pdf-creator-node');
const Wallets=require('../models/walletModel');
const Brand=require('../models/brandModel');

const fs = require('fs');
const ejs = require('ejs');
const Category = require('../models/categoryModel');

require('dotenv').config();
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


module.exports = {
 // ! razor pay create order 

razorPayCreateOrder : async (req, res, next) => {

    try {

        if (!req.user) {

            return res.status(401).json({ 'success': false, "message": 'session timeout login to continue purchasing' });


        }

        const orderID = req.params.orderID;

        const userID = req.user._id;

        const orderData = await Order.findById(orderID);

        if (!orderData) {

            return res.status(500).json({ 'success': false, "message": ' server facing issue getting order data' });



        }

        const cartdel = Cart.find({ userID: userID});
        await CartItem.deleteMany({ cartID: cartdel._id });
        await Cart.deleteOne({ userID: userID });
        
        const amount = orderData.finalPrice * 100;

        const receipt = orderData._id.toString();

        const currency = 'INR';

        const options = {
            amount: amount,
            currency: currency,
            receipt: receipt
        };

        razorpay.orders.create(options, (err, order) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ 'success': false, "message": 'server facing issues when creating order' });
            }


            return res.status(200).json({ 'success': true, "message": 'continue', order });
        });


    }
    catch (err) {


        return res.status(500).json({ 'success': false, "message": 'server facing issues when creating order' })
    }
},
// !payment Success Handler

paymentSuccessHandler : async (req, res, next) => {


    try {

        const userID = req.user._id;

        const { receipt, id } = req.body;

        const orderID = new mongoose.Types.ObjectId(receipt);

        // Find the order by IDrazorpayTransactionId
    const order = await Order.findByIdAndUpdate(orderID, { paymentStatus: 'paid', status: 'processing' , clientOrderProcessingCompleted:true,razorpayTransactionId: id}, { new: true });
    if(order)
    {
// Deduct product stock
for (const item of order.products) {
    const productId = item.product;
    const quantityOrdered = item.quantity;

    // Fetch the product from the database
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error(`Product with ID ${productId} not found.`);
    }

     // Deduct the quantity ordered from the product stock
     product.stock -= quantityOrdered;
     product.soldCount+=quantityOrdered;
     const category=await Category.findById(product.category);
     category.soldCount+=quantityOrdered;
     await category.save();
     // Save the updated product with deducted stock
     const brand=await Brand.findById(product.brand);
     brand.soldCount+=quantityOrdered;
     await brand.save();
     await product.save();

} //clear cart
const cartdel = Cart.find({ userID: userID});
await CartItem.deleteMany({ cartID: cartdel._id });
await Cart.deleteOne({ userID: userID });

// Return success response
res.status(200).json({ 'success': true,"messag":'order placed successfully' });
    }else{
        return res.status(500).json({ 'success': false, "message": ' Payment successful but server facing error updating order info contact customer service' }) 
    }
    
 

    }
    catch (err) {

console.log('error from razorpay payment sucessHandler',err);
        return res.status(500).json({ 'success': false, "message": ' Payment successful but server facing error updating order info contact customer service' })
    }
},



   
   
placeOrderCod:async(req,res)=>{
try{
const orderId=req.body.orderId;
console.log('orderis',orderId);
const userId=req.user._id;
    // Find the order by ID
    
    const order = await Order.findByIdAndUpdate(orderId, { paymentStatus: 'COD', status: 'processing' , clientOrderProcessingCompleted:true}, { new: true });
  // Deduct product stock
        for (const item of order.products) {
            const productId = item.product;
            const quantityOrdered = item.quantity;
            

            // Fetch the product from the database
            const product = await Product.findById(productId);

            if (!product) {
                throw new Error(`Product with ID ${productId} not found.`);
            }

            // Deduct the quantity ordered from the product stock
            product.stock -= quantityOrdered;
            product.soldCount+=quantityOrdered;
            const category=await Category.findById(product.category);
            category.soldCount+=quantityOrdered;
            await category.save();
            // Save the updated product with deducted stock
            const brand=await Brand.findById(product.brand);
            brand.soldCount+=quantityOrdered;
            await brand.save();
            await product.save();

} //clear cart
const cartdel = Cart.find({ userId: userId });
await CartItem.deleteMany({ cartID: cartdel._id });
await Cart.deleteOne({ userID: userId });
// Return success response

res.status(200).json({ success: true,message:'order placed successfully' });

}
catch(error){
   console.log('error in delete',error) ;
}
},


// placeOrder: async (req, res) => {
//     try {
//         const { userId, fullName, houseName, streetAddress, apartment, city, state, postcode, phone, email, orderNotes, paymentOption } = req.body;
//         const cart = req.session.cart;
//         const addressString = `${fullName},
//         ${houseName} House, 
//         ${streetAddress}, 
//         ${apartment}, 
//         ${city}, 
//         ${state},
//         PIN: ${postcode},
//         Mob:${phone}`;

//         // Create a new order object
//         const order = new Order({
//             user: userId,
//             products: cart.items.map(item => ({
//                 product: item.product._id,
//                 name: item.product.name,
//                 quantity: item.quantity,
//                 price: item.price
//             })),
//             status: 'pending',
//             totalPrice: req.session.totalPrice,
//             paymentStatus:'pending',
//             paymentOption: paymentOption,
//             shippingAddress: addressString
//         });

//         // Save the order to the database
//         const savedOrder = await order.save();

//         if (savedOrder.paymentOption === 'RazorPay') {
//             // Create Razorpay order
//             const orderAmount = savedOrder.totalPrice * 100; // Convert to paise
//             const currency = 'INR';
//             const receipt=savedOrder._id.toString();
//             const options = {
//                 amount: orderAmount,
//                 currency: currency,
//                 receipt: receipt
//             };
//             razorpay.orders.create(options, (err, razorpayOrder) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).json({ success: false, message: 'Server facing issues when creating order' });
//                 }
//             req.session.order=savedOrder;
//                 // Pass the Razorpay order details to the client-side
//                 res.status(200).json({ success: true, order: savedOrder, razorpayOrder: razorpayOrder });
//             });


            
//         } else {
//             // Proceed with other payment methods (e.g., COD)
//             // Finalize order placement
                        
//             // substract product qty from product stock.

//             for (const item of cart.items) {
//                 const productId = item.product._id;
//                 const quantity = item.quantity;

//                 // Find the product by its ID
//                 const product = await Product.findById(productId);

//                 // If the product is found, deduct the ordered quantity from its stock
//                 if (product) {
//                      // Deduct the quantity ordered from the product stock
//             product.stock -= quantityOrdered;
//             product.soldCount+=quantityOrdered;
//             const category=await Category.findById(product.category);
//             category.soldCount+=quantityOrdered;
//             await category.save();
//             // Save the updated product with deducted stock
//             await product.save();
//                 } else {
//                     console.error(`Product with ID ${productId} not found`);
//                 }
//             }
//             //clear cart
//             const cartdel = Cart.find({ userId: userId });
//             await CartItem.deleteMany({ cartID: cartdel._id });
//             await Cart.deleteOne({ userID: userId });
//             // Return success response

//             res.status(200).json({ success: true, order: savedOrder });
//         }
//     } catch (error) {
//         console.error('Error placing order:', error);
//         res.status(500).json({ success: false, error: 'Failed to place order' });
//     }
// },
// paymentSuccess: async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const orders = req.session.order;
//         const { orderid, receipt } = req.body;

//         // Find the order by ID
//         const order = await Order.findByIdAndUpdate(orders._id, { paymentStatus: 'paid', status: 'processing' }, { new: true });

//         // Deduct product stock
//         for (const item of order.products) {
//             const productId = item.product;
//             const quantityOrdered = item.quantity;

//             // Fetch the product from the database
//             const product = await Product.findById(productId);

//             if (!product) {
//                 throw new Error(`Product with ID ${productId} not found.`);
//             }

//             // Deduct the quantity ordered from the product stock
//             product.stock -= quantityOrdered;
//             product.soldCount+=quantityOrdered;
//             const category=await Category.findById(product.category);
//             category.soldCount+=quantityOrdered;
//             await category.save();
//             // Save the updated product with deducted stock
//             const brand=await Brand.findById(product.brand);
//             brand.soldCount+=quantityOrdered;
//             await brand.save();
//             await product.save();
//         }

//         // Clear cart
//         const cart = await Cart.findOne({ userID: userId });
//         if (cart) {
//             await CartItem.deleteMany({ cartID: cart._id });
//             await Cart.deleteOne({ _id:cart._id }); // Use remove() to delete the cart
//         }

//         // Return success response
//         res.status(200).json({ success:true});

//     } catch (error) {
//         console.error('Error processing payment:', error);
//         res.status(500).json({ success: false, error: 'Failed to process payment' });
//     }
// },



    displayOrders: async (req, res) => {
        async function getOrders() {
            try {
                id = req.user._id;
                // Retrieve orders from the database
                const orders = await Order.find({ user: id }).populate('user products.product').sort({ createdAt: -1 });

                // Return the retrieved orders
                return orders;
            } catch (error) {
                // Handle errors
                console.error('Error fetching orders:', error);
                throw error;
            }
        };

        try {
            // Retrieve orders
            const orders = await getOrders();
            const message = req.flash() || '';
            // Render the 'orders' view and pass the orders data
            res.render('users/orders', { orders, user: req.user, message });
        } catch (error) {
            // Handle errors
            console.error('Error displaying orders:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    changeOrderStatus: async (req, res) => {
        
        const { orderId, confirmationReason } = req.body;
    
        try {
            // Find the order by ID
            const order = await Order.findById(orderId);
            console.log('orde show.........',order);
            // Check if the order exists
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
    
            // Determine the action based on the order's current status
            var newStatus = '';
            if (order.status === 'pending' || order.status === 'processing') {
                newStatus = 'cancelled';
                
                if(order.paymentStatus==='paid'){
                 
                    // Define the user ID to check and update
                    const userIdToCheck = order.user; // Replace this with the actual user ID
                    
                    // Find the wallet document with the specified user ID
                    Wallets.findOne({ userId: userIdToCheck })
                      .then((wallet) => {
                        if (wallet) {
                          // Wallet found, update the walletBalance and add a new transaction
                          const amountToAdd = order.finalPrice; // Example amount to add
                          const newTransaction = {
                            transactionDate: new Date(), // Current date
                            transactionAmount: amountToAdd,
                            transactionType: 'credit', // Example transaction type
                          };
                    
                          wallet.walletBalance += amountToAdd;
                          wallet.walletTransaction.push(newTransaction);
                    
                          // Save the updated wallet document
                          return wallet.save();
                        } else {
                          // Wallet not found for the specified user ID
                          throw new Error('Wallet not found');
                        }
                      })
                      .then((updatedWallet) => {
                        order.paymentStatus='refunded';
                        order.save();
                        console.log('Wallet updated successfully:', updatedWallet,order);
                      })
                      .catch((error) => {
                        console.error('Error updating wallet:', error);
                      });
                       
                }else{
                    order.paymentStatus='cancelled'
                }
            } else if (order.status === 'shipped' || order.status === 'delivered') {
                newStatus = 'returned';

             
                if(order.paymentStatus==='paid'){
                 
                    // Define the user ID to check and update
                    const userIdToCheck = order.user; // Replace this with the actual user ID
                    
                    // Find the wallet document with the specified user ID
                    Wallets.findOne({ userId: userIdToCheck })
                      .then((wallet) => {
                        if (wallet) {
                          // Wallet found, update the walletBalance and add a new transaction
                          const amountToAdd = order.finalPrice; // Example amount to add
                          const newTransaction = {
                            transactionDate: new Date(), // Current date
                            transactionAmount: amountToAdd,
                            transactionType: 'credit', // Example transaction type
                          };
                    
                          wallet.walletBalance += amountToAdd;
                          wallet.walletTransaction.push(newTransaction);
                    
                          // Save the updated wallet document
                          return wallet.save();
                        } else {
                          // Wallet not found for the specified user ID
                          throw new Error('Wallet not found');
                        }
                      })
                      .then((updatedWallet) => {
                        order.paymentStatus='refunded';
                        order.save();
                        console.log('Wallet updated successfully:', updatedWallet,order);
                      })
                      .catch((error) => {
                        console.error('Error updating wallet:', error);
                      });
                       
                }
                else{
                    order.paymentStatus='cancelled';
                }
            } else {
                console.log('erroris:',error)
                return res.status(400).json({ error: 'Invalid request or order status' });
            }
    
            // Update the order status to the new status
            order.status = newStatus;
    
            // Add the reason details and date to the reason array
            order.reason.push({
                details: confirmationReason,
                date: new Date() // Add the current date
            });
            console.log('updateorder',order);
            // Save the updated order
            await order.save();
    
            // Respond with a success message
            res.status(200).json({ message: `Order ${newStatus} successfully` });
    
        } catch (error) {
            // Handle errors
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    orderDetails:async(req,res)=>{
        try{

            if (!req.user._id) {


                req.session.message = {
                    type: 'danger',
                    message: 'session time out login to got to order details page  !',
    
                };
    
                return res.redirect('/');
    
    
            }
    
            const userID = new mongoose.Types.ObjectId(req.user._id);
    
    
            const orderID = new mongoose.Types.ObjectId(req.params.orderId);
    
            if (!orderID) {
    
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to Fetch order Details  !',
    
                };
    
                return res.redirect('/orders');
    
    
            }
    
    
    
            const orders = await Order.findById(orderID).populate('user products.product');
    

            if (orders) {
    
    
    
    
    
                return res.render('users/orderDetailsPage', { orders, user:req.user});
    
    
    
    
            } else {
    
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to Fetch order Details  !',
    
                };
    
                return res.redirect('/orders');
    
    
    
    
            }
    
        }
    
        catch (err) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    renderInvoicePage: async(req,res,next)=>{
        try{

            if (!req.user._id) {


                req.session.message = {
                    type: 'danger',
                    message: 'session time out login to got to order details page  !',
    
                };
    
                return res.redirect('/');
    
    
            }
    
            const userID = new mongoose.Types.ObjectId(req.user._id);
    
    
            const orderID = new mongoose.Types.ObjectId(req.params.orderId);
    
            if (!orderID) {
    
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to Fetch order Details  !',
    
                };
    
                return res.redirect('/orders');
    
    
            }
    
    
    
            const orders = await Order.findById(orderID).populate('user products.product');
    

            if (orders) {
    
    
    
    
    
                return res.render('users/invoicePage', { orders, user:req.user});
    
    
    
    
            } else {
    
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to Fetch order Details  !',
    
                };
    
                return res.redirect('/orders');
    
    
    
    
            }
    
        }
    
        catch (err) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    downloadInvoice:async (req, res, next) => {

        try {
    
    
            if (!req.user._id) {
    
    
                req.session.message = {
                    type: 'danger',
                    message: 'session time out login to got to render invoice  !',
    
                };
    
                return res.redirect('/');
    
    
            }
    
    
            const orderID = new mongoose.Types.ObjectId(req.params.orderID);
    
            if (!orderID) {
    
                req.session.message = {
                    type: 'danger',
                    message: 'Failed to Fetch order Details  !',
    
                };
    
                return res.redirect('/user/orders');
    
    
            }
    
            const orders = await Order.findById(orderID).populate('user products.product');
    
         
    
    
    
            if (orders) {
    
                const logoUrl ="'/img/logo.png"
                const options = {
                    formate: 'A3',
                    orientation: 'portrait',
                    border: '2mm',
                    header: {
                        height: '15mm',
                        contents: '<h4 style=" color: red;font-size:20;font-weight:800;text-align:center;">CUSTOMER INVOICE</h4>'
                    },
                    footer: {
                        height: '20mm',
                        contents: {
                            first: 'Cover page',
                            2: 'Second page',
                            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
                            last: 'Last Page'
                        }
                    }
                }
    
                const data = { orders,logoUrl}
    
                const html = ejs.render(fs.readFileSync(Path.join(__dirname, '..', 'views', 'users', 'invoicePage.ejs'), 'utf-8'), data);
    
    
                const filename = Math.random() + '_doc' + '.pdf';
    
    
                const document = {
                    html: html,
                    data,
                    path: './docs/' + filename
                }
    
    
                pdf.create(document, options)
                    .then(re => {
                        console.log(re);
    
                        const filepath = Path.join(__dirname, '..', 'docs', filename);
    
    
    
    
    
                        res.download(filepath, function (err) {
    
                            if (err) {
                                console.log(err)
                            }
                        })
    
                    }).catch(error => {
                        console.log(error);
                    });
    
    
            }
    
    
    
    
    
    
    
    
    
 
           
    
    
    
    
    
        }
        catch (err) {
    
            next(err);
        }
    }
}