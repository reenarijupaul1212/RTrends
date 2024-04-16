9// For Register Page
const passport = require("passport");
const User = require("../models/userModel");
const session = require("express-session");
const { homepageView } = require("./userController");
const Product=require('../models/productModel');
const Banner=require('../models/bannerModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Order=require('../models/ordermodel');
//const Product = require('../models/productModel');
const Path=require('path');
const Category = require("../models/categoryModel");
const Brand=require('../models/brandModel');

const dashboardView = async (req, res) => {
    const user = req.user;

    try {
        if (user.role === 'admin') {
            // Fetch count of active products
            const users=await User.countDocuments({userStatus:true,role:'user'});
            const productsCount = await Product.countDocuments({ active: true });
            const orders = await Order.countDocuments({
                paymentStatus: { $in: ['paid', 'cod'] },
                status: { $in: ['processing', 'shipped'] }
            });
            const bestSellproduct=await Product.find({active:true}).sort({soldCount:-1}).limit(10);
           bestSellproduct.forEach(product => {
                console.log(product.name); // Display the name of each product
              });
              const bestSellCategory=await Category.find({status:true}).sort({soldCount:-1}).limit(10);
              bestSellCategory.forEach(category=>{console.log(category.name);});

            const bestSellBrand=await Brand.find({active:true}).sort({soldCount:-1}).limit(10);
              bestSellBrand.forEach(brand=>{console.log(brand.name);});
              const calculateTotalPaidAmount = async () => {
                try {
                    // Use aggregation pipeline to filter orders with paymentStatus: "paid" and calculate sum of finalPrice
                    const result = await Order.aggregate([
                        // Match orders with paymentStatus: "paid"
                        { $match: { paymentStatus: "paid" } },
                        // Group the matched orders and calculate sum of finalPrice for each group
                        {
                            $group: {
                                _id: null, // Group all documents together
                                totalPaidAmount: { $sum: "$finalPrice" } // Calculate sum of finalPrice
                            }
                        }
                    ]);
            
                    // If there are no orders with paymentStatus: "paid", return 0
                    if (result.length === 0) {
                        return 0;
                    }
            
                    // Extract the total paid amount from the result
                    const totalPaidAmount = result[0].totalPaidAmount;
            
                    return totalPaidAmount;
                } catch (error) {
                    console.error("Error calculating total paid amount:", error);
                    throw error;
                }
            };
            
            // Example usage
            calculateTotalPaidAmount()
                .then(totalPaidAmount => {
                    console.log("Total paid amount:", totalPaidAmount);
                    res.render("admin/admindashboard", { user, productsCount,users,orders,totalPaidAmount,bestSellproduct,bestSellCategory, bestSellBrand});
                })
                .catch(error => {
                    console.error("Error:", error);
                });


            // Render admin dashboard with product count
           
        } else {
            req.session.role = user.role;

            try {
                // Fetch all products and banners
                const products = await Product.find();
                const banners = await Banner.find();
                const message = req.flash() || '';

                // Render user's index view with products, banners, user information, and flash messages
                res.render('users/index', { products, user, message, banners });
            } catch (error) {
                console.error('Error fetching products and banners:', error);
                res.status(500).send("Internal Server Error");
            }
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    dashboardView,
};
