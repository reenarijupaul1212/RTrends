var express=require('express');
var router=express.Router();
const profileMuter=require('../multer/profile');
const authMiddleware = require('../middleware/authMiddleware');
const { protectRoute, ensureAuthenticated,allowIf } = require("../auth/protect");
const {homepageView,registerView, loginView, registerUser, loginUser,verifyOtp,adminRegisterUser } = require('../controllers/userController');
const{dashboardView}=require('../controllers/dashboardController');
const userController=require('../controllers/userController');
const productController=require('../controllers/productController');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const User = require('../models/userModel');
const Address=require('../models/addressModel');
const orderController=require('../controllers/orderController');
const cartController=require('../controllers/cartController')
const {isAuthenticated ,isUserAuthenticated, isAdminAuthenticated } = require('../middleware/authMiddleware');
const checkoutController = require('../controllers/checkoutController');
const wishlistController = require('../controllers/wishlistController');
const ejs = require('ejs');

/* GET HOMEPAGE */
router.get('/',isAuthenticated,userController.homepageView);
router.get('/signup',isAuthenticated,userController.registerView);
router.get('/dashboard',protectRoute,dashboardView)
router.get('/login',isAuthenticated,userController.loginView);
router.get('/cart',isUserAuthenticated,cartController.viewCartPage);
router.post('/addToCart',isUserAuthenticated,cartController.addToCart);
router.post('/proceedToBuy',isUserAuthenticated,checkoutController.proceedToBuy);
router.post('/checkOut/applyOffers',isUserAuthenticated,checkoutController.applyOffers);
router.get('/paymentPage/:orderid',isUserAuthenticated,checkoutController.renderPaymentPage);
router.post('/placeOrder/cod',isUserAuthenticated,orderController.placeOrderCod);
// ! route to create the razor Pay order 
router.post('/razorPay/createOrder/:orderID',isUserAuthenticated, orderController.razorPayCreateOrder);
// ! payment success req from client 
router.post('/razorPay/payment-success',isUserAuthenticated, orderController.paymentSuccessHandler)
router.get('/checkOut',isUserAuthenticated,checkoutController.checkOut);
router.get('/orders',isUserAuthenticated,orderController.displayOrders);
router.get('/profile',ensureAuthenticated,userController.getProfile);
router.post('/edit_profile/:id',isUserAuthenticated,profileMuter.single('image'),userController.editProfie);
router.get('/otp_verify',userController.viewVerifyOtp);
router.get("/dashboard", protectRoute, dashboardView);
router.get('/resend_otp',userController.reSendOtp);
router.get('/forgot-password',userController.viewforgotPassword);
router.post('/otp_verify',userController.verifyOtp);
router.post('/login',loginUser);

router.post('/forgot-password',userController.doForgotPassword); 
router.post('/verify-coupon',checkoutController.couponVerificationHandler );
// Define route for password reset
router.get('/reset-password/:token', userController.viewPasswordRest);
router.post('/signup',userController.registerUser);

// Example route for logging out
router.get('/logout',userController.logOut);
router.get('/product', productController.getProductViewPage);

router.get('/sproducts_page/:id',productController.singleProductView);
router.post('/filter-products', productController.filterProducts);
router.delete('/removeItemFromCart/:id',isUserAuthenticated,cartController.removeItemFormCart) ;
router.post('/updateIncQuantityOfCartItem/:id',isUserAuthenticated,cartController.updateIncQuantityOfCartItem);
router.post('/updateDecQuantityOfCartItem/:id',isUserAuthenticated,cartController.updateDecQuantityOfCartItem);
//router.post('/placeOrder',isUserAuthenticated,orderController.placeOrder);
//router.post('/paymentSuccess',isUserAuthenticated,orderController.paymentSuccess)
router.post('/password-reset/:token',userController.doPasswordRest);
router.post('/changeOrderStatus',isUserAuthenticated,orderController.changeOrderStatus);
router.get('/orderDetails/:orderId',isUserAuthenticated,orderController.orderDetails);
//router.post('/return-order/:orderId',isUserAuthenticated,orderController.returnOrder);
router.post('/addToWishList',isUserAuthenticated, wishlistController.addToWishList);
router.get('/wallet',isUserAuthenticated,userController.renderWallet);
router.route('/wishList')
    .get(isUserAuthenticated,wishlistController.WishListPage)
   .delete(isUserAuthenticated,wishlistController.removeFromWishList);
   router.post('/addWishListToCart',isUserAuthenticated,cartController.addWishListToCart);
router.get('/invoice/:orderID',isUserAuthenticated,orderController.renderInvoicePage);
// !download invoice 

router.get('/invoice/download/:orderID',isUserAuthenticated, orderController.downloadInvoice)
module.exports = router;