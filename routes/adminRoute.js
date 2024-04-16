
var express = require('express');
var router = express.Router();
const User=require('../models/userModel');
const Brand = require('../models/brandModel');
const Banner =require('../models/bannerModel')
const Product=require('../models/productModel');
var path = require('path');
const profileMuter=require('../multer/profile');
const productMulter = require('../multer/product');
const brandMulter = require('../multer/brand');
const bannerMulter=require('../multer/banner');
const { isUserAuthenticated, isAdminAuthenticated } = require('../middleware/authMiddleware');
const { protectRoute, allowIf } = require("../auth/protect");
const adminController = require('../controllers/adminController');
const cartController =require('../controllers/cartController')
const Category = require('../models/categoryModel');
const { removeAllListeners } = require('../models/cartModel');
const brandController = require('../controllers/brandController');
router.get('/', isAdminAuthenticated,adminController.addCouponPageRender);
router.get('/usersList',isAdminAuthenticated, adminController.usersList);
router.get('/delete_user/:id',isAdminAuthenticated,adminController.deleteUser);
router.get('/userStatusblock_edit/:id',isAdminAuthenticated,adminController.blockUser);
router.get('/userStatusunBlock_edit/:id',isAdminAuthenticated,adminController.unblockUser);
router.get('/edit_category/:id',isAdminAuthenticated,adminController.editCategoryView);
//router.get('/delete_category/:id',isAdminAuthenticated,adminController.deleteCategory)
router.get('/categoryStatusBlock/:id',isAdminAuthenticated,adminController.blockCategory);
router.get('/categoryStatusUnblock/:id',isAdminAuthenticated,adminController.unblockCategory);
router.post('/edit_category/:id',isAdminAuthenticated,adminController.editCategory);
router.get('/products',isAdminAuthenticated,adminController.adminProductsView);
    router.get('/category',isAdminAuthenticated,adminController.listcategory);
    router.get('/edit_product/:id',isAdminAuthenticated,adminController.editProductView);
router.post('/editProduct/:id',isAdminAuthenticated,productMulter.fields([{ name: 'image' }, { name: 'images', maxCount: 3 }]),adminController.editProduct);
router.get('/orders',isAdminAuthenticated,adminController.orders);
router.post('/update-status',isAdminAuthenticated,adminController.updateOrderStatus);
//router.get('/add-product',productMulter.array());
router.get('/profile',isAdminAuthenticated,adminController.getProfile);
router.post('/edit_profile/:id',isAdminAuthenticated,profileMuter.single('image'),adminController.editProfie);
router.post('/add-couponPage',isAdminAuthenticated,adminController.addCoupon);
router.get('/add-couponPage',isAdminAuthenticated,adminController.addCouponPageRender);
router.get('/coupon',isAdminAuthenticated,adminController.getCouponPage);
router.get('/addcategoryOffers',isAdminAuthenticated,adminController.renderCategoryOfferPage);

router.post('/categoryOffer/deactivate',isAdminAuthenticated,adminController.updateCategoryOffer);
router.get('/edit-coupon/:id',isAdminAuthenticated,adminController.getEditCouponPage);
router.get('/delete-coupon/:id',isAdminAuthenticated,adminController.deleteCoupon);
//router.get('/edit-coupon/:id',isAdminAuthenticated,adminController.getEditCoupon);
// ! chart data handler
router.post('/edit-coupon/:id',isAdminAuthenticated,adminController.updatecoupon);
router.route('/chart')
    .get(adminController.getChartDataHandler);
    router.get('/salesReport',isAdminAuthenticated,adminController.renderSalesReport);
    // ! excel sales report
router.get('/salesReport/excel', adminController.salesReportInExcel)
// ! sales report PDF download 
router.get('/salesReport/pdf/download', adminController.salesReportInPdf);
router.get('/salesReportPdf',adminController.salesReportPdfRender)
router.get('/add-product',isAdminAuthenticated,adminController.addProductRender);
router.get('/add-category',isAdminAuthenticated,adminController.addCategoryRender);


// Define route to fetch and render all brands
router.get('/brands',isAdminAuthenticated, brandMulter.single('image'), adminController.brandsRender);
//update brand to reload in the http method patch
router.get('/brands/:id', brandMulter.single('image'), async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render('admin/brands', { brands,user:req.user}); // Assuming you have a brandsList.ejs file
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/brands', brandMulter.single('image'), async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render('admin/brands', { brands,user:req.user}); // Assuming you have a brandsList.ejs file
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/banners',isAdminAuthenticated ,bannerMulter.single('image'),adminController.viewBanner );
router.get('/add-banner',isAdminAuthenticated,adminController.viewAddNewBanner);
router.post('/add-banner',isAdminAuthenticated,bannerMulter.single('image'),adminController.addNewBanner );
router.get('/edit-banner/:id',isAdminAuthenticated,adminController.editBannerRender);

    router.post('/edit-banner/:id',isAdminAuthenticated,bannerMulter.single('image'),adminController.updateBanner );

router.delete('/delete-banner/:id',isAdminAuthenticated,adminController.deleteBanner );
    
router.get('/add-brand',isAdminAuthenticated, (req, res, next) => { res.render('admin/add-brand',{user:req.user,error:null,success:null}) });
router.get('/edit_brand/:id',isAdminAuthenticated,async(req, res, next) => { 
    try{ const brand_id =req.params.id;
        const brand = await Brand.findById(brand_id);
        console.log(brand);
        res.render('admin/edit_brand', {brand,user:req.user,error:null,success:null}); }
    
    catch (error){

        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }});
    router.post('/edit_brand/:id',isAdminAuthenticated, brandMulter.single('image'), adminController.updateBrand);
   
router.delete('/delete_brand/:id', async (req, res) => {
    try {
        const brandId = req.params.id;

        // Perform the deletion in the database
        const result = await Brand.deleteOne({ _id: brandId });

        // Check the result and send an appropriate response
        if (result.deletedCount > 0) {
            res.json({ message: 'Brand deleted successfully' });
        } else {
            res.status(404).json({ message: 'Brand not found' });
        }
    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/delete_product/:id', async (req, res) => {
    try {
        const productID = req.params.id;

        // Perform the deletion in the database
        const result = await Product.deleteOne({ _id: productID });

    // Check the result and send an appropriate response
        if (result.deletedCount > 0) {
            res.json({ message: 'product deleted successfully' });
        } else {
            res.status(404).json({ message: 'product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Assuming you have a route for updating users
// POST route for creating a new product with image and images
router.post('/add-category',isAdminAuthenticated, async (req, res, next) => {
    try {
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }
        // Extract data from the request body
        const { name,  status,onDiscount,discountName,discountAmount } = req.body;

        // Create a new category
        const newCategory = new Category({
            name: capitalizeFirstLetter(req.body.name),
            onDiscount,
            discountName,
            discountAmount,
            status,
        });

        // Save the category to the database
        const savedCategory = await newCategory.save();

        // Redirect with success message
        console.log("Success");
        console.log(savedCategory);
        res.render('admin/add-category', { user: req.user, success: 'Category added successfully.',error:null });
    
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            // Duplicate key error for the "name" field
            res.render('admin/add-category', { user:req.user,error: 'Category name already exists. Please choose a different name.' ,success:null});
        } else {
            // Other types of errors
            next(error);
        }
    }
});

  router.post('/add-product',isAdminAuthenticated, productMulter.fields([{ name: 'image' }, { name: 'images', maxCount: 3 }]),adminController.addProduct );

        




router.post('/add-brand',isAdminAuthenticated, brandMulter.single('image'), brandController.addBrandHandler);



module.exports = router;
