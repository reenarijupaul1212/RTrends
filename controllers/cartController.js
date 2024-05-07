const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');
const Path = require('path');
const { error } = require('console');
const Address = require('../models/addressModel');
const Order = require('../models/ordermodel');
const WishList = require('../models/wishListModel');
const { session } = require('passport');

module.exports = {


    // viewCartPage: async (req, res) => {
    //     try {
    //         let userId = req.user;

    //         // Fetch the cart details for the user
    //         const cart = await getCartDetails(userId);

    //         if (!cart || !cart.items || cart.items.length === 0) {
    //             // If the cart is empty, render the view with a message
    //             return res.render('users/cart', { cart: null, user: req.user, message: 'Your cart is empty' });
    //         }

    //         // If the cart is not empty, render the view with the cart details
    //         return res.render('users/cart', { cart: cart, user: req.user });
    //     } catch (error) {
    //         console.error('Error fetching cart details:', error);
    //         // Handle the error and render the view with an error message
    //         return res.status(500).render('error', { error: 'Failed to fetch cart details' });
    //     }
    // },

    addWishListToCart: async (req, res) => {
        try {
            const { productId,  quantity } = req.body;
            if (!req.user._id) {
                res.render('/login', error)
            }
            const userid = req.user._id;
            console.log('addto cart', productId, quantity);
            // Find the user's cart
            let userCart = await Cart.findOne({ userID: userid });
            var product = await Product.findOne({ _id: productId });
            console.log(product);
            // If the user doesn't have a cart, create a new one
            if (!userCart) {
                userCart = await Cart.create({ userID: userid });
            }

            // Check if the item is already in the cart
            const existingCartItem = await CartItem.findOne({
                cartID: userCart._id,
                product: productId,
            });

            if (existingCartItem) {
                // If the item is already in the cart, update the quantity
                existingCartItem.quantity += parseInt(quantity, 10) || 1;
                if (existingCartItem.quantity > product.stock)
                    existingCartItem.quantity = product.stock;
                await existingCartItem.save();

            } else {
                // If the item is not in the cart, create a new cart item

                const productPrice = product.offerPrice; // Replace with the actual way to get the product price
                const newCartItem = new CartItem({
                    cartID: userCart._id,
                    product: productId,
                    quantity: parseInt(quantity, 10) || 1,
                    price: productPrice,
                });

                await newCartItem.save();
                userCart.items.push(newCartItem._id);
                await userCart.save();
            }
            await WishList.findOneAndUpdate({userId:userid},{$pull:{products:productId}});
            req.flash('success','Item added to the cart successfully.');
        
            res.status(200).json();
        } catch (error) { 
            console.error('Error adding to cart:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    viewCartPage: async (req, res) => {
        const message=req.flash()||'';
        try {
            let userId = req.user;
            
            // Fetch the cart details for the user
            const cart = await getCartDetails(userId);
            let outOfStockItems = [];
            if (!cart || !cart.items || cart.items.length === 0) {
                // If the cart is empty, render the view with a message
                return res.render('users/cart', { cart: null, user: req.user, message: 'Your cart is empty', outOfStockItems });
            }
            // Check if any item quantity in the cart exceeds the product stock

            for (const item of cart.items) {
                if (item.quantity > item.product.stock) {

                    outOfStockItems.push(item.product.name);

                }

            }
            // Remove out-of-stock items from the cart
            const updatedCartItems = cart.items.filter(item => item.quantity <= item.product.stock);

            // Update the cart with the filtered items
            cart.items = updatedCartItems;
            console.log('cart cartpage',cart)
            // If there are out of stock items, render the view with a message
            if (outOfStockItems.length > 0) {

                return res.render('users/cart', { cart: cart, user: req.user, outOfStockItems: outOfStockItems,message });
            }
            

            // If the cart is not empty and all items are in stock, render the view with the cart details
            return res.render('users/cart', { cart: cart, user: req.user, outOfStockItems: [],message });
            // If the cart is not empty, render the view with the cart details
            return res.render('users/cart', { cart: cart, user: req.user });
        } catch (error) {
            console.error('Error fetching cart details:', error);
            // Handle the error and render the view with an error message
            return res.status(500).render('error', { error: 'Failed to fetch cart details' });
        }


        async function getCartDetails(userId) {
            try {
                // Find the user's cart and populate the items with product details
                const cart = await Cart.findOne({ userID: userId }).populate({
                    path: 'items',
                    model: CartItem,
                    populate: {
                        path: 'product',
                        model: Product,
                        select: 'name images stock offerPrice'
                    },
                });

                return cart;
            } catch (error) {
                console.error('Error fetching cart details:', error);
                throw error;
            }
        }
    },


    addToCart: async (req, res) => {
        try {
            const { productId, size, quantity } = req.body;
            if (!req.user._id) {
                res.render('/login', error)
            }
            const userid = req.user._id;
            console.log('addto cart', productId, quantity);
            // Find the user's cart
            let userCart = await Cart.findOne({ userID: userid });
            var product = await Product.findOne({ _id: productId });
            console.log(product);
            // If the user doesn't have a cart, create a new one
            if (!userCart) {
                userCart = await Cart.create({ userID: userid });
            }

            // Check if the item is already in the cart
            const existingCartItem = await CartItem.findOne({
                cartID: userCart._id,
                product: productId,
            });

            if (existingCartItem) {
                // If the item is already in the cart, update the quantity
                existingCartItem.quantity += parseInt(quantity, 10) || 1;
                if (existingCartItem.quantity > product.stock)
                    existingCartItem.quantity = product.stock;
                await existingCartItem.save();

            } else {
                // If the item is not in the cart, create a new cart item
                 if (product.offerPrice == 0) { 
                    var productPrice = product.price;
                 } else {
                    var productPrice = product.offerPrice;
                 }   
                // Replace with the actual way to get the product price
                const newCartItem = new CartItem({
                    cartID: userCart._id,
                    product: productId,
                    quantity: parseInt(quantity, 10) || 1,
                    price: productPrice,
                });

                await newCartItem.save();
                userCart.items.push(newCartItem._id);
                await userCart.save();
            }

            res.status(200).json({ success: true, message: 'Item added to the cart successfully.' });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    removeItemFormCart: async (req, res) => {
        const itemId = req.params.id;

        try {
            // Find the cart item by ID and remove it
            const cartItem = await CartItem.deleteOne({ _id: itemId });
            if (!cartItem) {
                return res.status(404).json({ success: false, message: 'Cart item not found.' });
            }

            // Remove the item ID from the cart's items array
            const cart = await Cart.findOneAndUpdate(
                { items: itemId },
                { $pull: { items: itemId } },
                { new: true }
            );

            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found.' });
            }

            res.status(200).json({ success: true, message: 'Item removed from cart successfully.' });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

    },
    updateIncQuantityOfCartItem: async (req, res) => {
        const productId = req.params.id;
        const userId = req.user._id;
        try {
            let userCart = await Cart.findOne({ userID: userId });

            const existingCartItem = await CartItem.findOne({
                _id: productId
            });
            var product = await Product.findOne({ _id: existingCartItem.product });
            console.log('hiiiiiiiiiiiiiiiiiiiiiiiiii');
            console.log(existingCartItem, product);
            existingCartItem.quantity += 1;
            if (existingCartItem.quantity>10){
                existingCartItem.quantity=10;
            }
            if (existingCartItem.quantity > product.stock)
                existingCartItem.quantity = product.stock;
            await existingCartItem.save();

            res.status(200).json({ success: true, message: 'Item add t cart souccessfully.' });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

    },
    updateDecQuantityOfCartItem: async (req, res) => {
        const productId = req.params.id;
        const userId = req.user._id;
        try {
            let userCart = await Cart.findOne({ userID: userId });

            const existingCartItem = await CartItem.findOne({
                _id: productId
            });
            var product = await Product.findOne({ _id: existingCartItem.product });
            console.log('hiiiiiiiiiiiiiiiiiiiiiiiiii');
            console.log(existingCartItem, product);
            existingCartItem.quantity -= 1;
            // Ensure the quantity doesn't go below 0
            if (existingCartItem.quantity < 0) {
                existingCartItem.quantity = 0;
            }


            if (existingCartItem.quantity > product.stock)
                existingCartItem.quantity = product.stock;
            await existingCartItem.save();

            res.status(200).json({ success: true, message: 'Item add t cart souccessfully.' });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

}


