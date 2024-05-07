const User = require('../models/userModel');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const fs=require('fs');
const Order = require('../models/ordermodel');
const Banner = require('../models/bannerModel');
const Coupon = require('../models/couponModel');
const { request } = require('express');
const Address = require('../models/addressModel');
const excelJS = require('exceljs');
const path = require('path');
const puppeteer = require('puppeteer');
//const { default: products } = require('razorpay/dist/types/products');
/*const adminHomePageView=(req,res,next)=>
{ res.render('users/admin-dashboard');};

module.exports={adminHomePageView}*/
module.exports = {
    renderdashboard: async (req, res, next) => {

        let ProductsCount = await Product.aggregate([

            {
                $match: { active: true }

            },

            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }

        ]).exec();
        res.render('users/admin_dashboard'), { productsCount: ProductsCount }
    },

    getProfile: async (req, res) => {
        email = req.user.email;
        const profil = await User.findOne({ email: email })
        const addres = await Address.find({ userId: profil._id });
        console.log(profil);
        console.log('profilllll');
        console.log(addres);
        return res.status(200).render('admin/profile', { profil: profil, add: addres, user: req.user, message: "" })
    },
    editProfie: async (req, res, next) => {
        try {

            if (req.body.passwod) {
                const salt = await bcrypt.genSalt(10);
                let password = await bcrypt.hash(req.body.passwod, salt);
                const updatepass = await User.findByIdAndUpdate(
                    req.params.id, {
                    password: password,
                }
                );
            };

            const updateprofile = await User.findByIdAndUpdate(
                req.params.id,
                {
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    profileImage: req.file.filename,
                },
                { new: true } // Return the updated document
            );
            console.log('update profle');
            console.log(updateprofile);
            let addres = await Address.findOne({ userId: req.params.id });
            const updateAddress = await Address.findByIdAndUpdate(
                addres._id,
                {
                    fullName: req.body.fullName,
                    houseName: req.body.houseName,
                    email: req.body.Aemail,
                    mobile: req.body.Amobile,
                    state: req.body.state,
                    streetAddr: req.body.streetAddr,
                    city: req.body.city,
                    country: req.body.country,
                    pincode: req.body.pincode
                },
                { new: true }
            );
            console.log('address update');
            console.log(updateAddress);
            res.redirect('/dashboard');
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    adminHomePageView: (req, res, next) => { res.render('users/admin-dashboard'); },

    usersList: async (req, res) => {
        try {
            var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        const limit = 8;
            let users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();
            let count=await User.find({role:'user'}).countDocuments();
            console.log('controler userlist');
            console.log(users);

            res.render('admin/usersList', { users, user: req.user, totalPage: Math.ceil(count / limit), currentPage: page});
        }
        catch (error) {
            console.log(error.message);
        }
    },
    deleteUser: async (req, res, next) => {

        try {
            const id = req.params.id;
            console.log(id);
            // Perform the deletion in the database
            const result = await User.deleteOne({ _id: id });

            // Check the result and send an appropriate response
            if (result.deletedCount > 0) {

                return res.status(200).redirect('/admin/usersList');
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }


    },


    blockUser: async (req, res, next) => {
        try {
            id = req.params.id
            console.log('edit uder status', id);
            const updatesUser = await User.findByIdAndUpdate(id, { userStatus: false })
            console.log("User updated successfully:", updatesUser);
            return res.status(200).redirect('/admin/usersList');
        }
        catch (error) {
            console.log(error.message);
        }
    },
    unblockUser: async (req, res, next) => {
        try {
            console.log('heloo');
            id = req.params.id
            await User.findByIdAndUpdate(id, { userStatus: true })
            return res.status(200).redirect('/admin/usersList');
        }
        catch (error) {
            console.log(error.message);
        }
    },
    listcategory: async (req, res, next) => {
        try {
            var page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            const limit = 3;
            const Categorys = await Category.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();
            const count = await Category.find().countDocuments();
            res.render('admin/category', { Categorys, user: req.user, totalPage: Math.ceil(count / limit), currentPage: page,limit });
        }

        catch (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
    },
    editCategoryView: async (req, res, next) => {
        try {
            let id = req.params.id;
            let category = await Category.findOne({ _id: id });

            res.render('admin/edit_category', { category, user: req.user, error: "", success: "" });

        }
        catch (error) {
            console.log(error.message);
        }
    },
    editCategory: async (req, res, next) => {
        try {
            // Ensure req.session.category is initialized
            req.session.category = req.session.category || {};
            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
            }
            // Store the category ID in the session
            req.session.category.id = req.params.id;
            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                {
                    name: capitalizeFirstLetter(req.body.name),
                    onDiscount: req.body.onDiscount === 'true' ? true : false,
                    discountName: req.body.discountName,
                    discountAmount: req.body.discountAmount,
                    status: req.body.status === 'true' ? true : false, // Checkbox value is 'on' when checked
                },
                { new: true } // Return the updated document
            );

            res.redirect('/admin/category'); // Redirect to the category list or another page
        } catch (error) {
            console.error(error);
            if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
                // Duplicate key error for the "name" field
                let id = req.session.category.id;
                let category = await Category.findOne({ _id: id });
                res.render('admin/edit_category', { user: req.user, category, error: 'Category name already exists. Please choose a different name.', success: null });
            } else {
                // Other types of errors
                next(error);
            }

        }
    },
    blockCategory: async (req, res, next) => {
        try {
            id = req.params.id
            console.log('edit category status', id);
            const updateCategory = await Category.findByIdAndUpdate(id, { status: false })
            console.log("Category updated successfully:", updateCategory);
            return res.status(200).redirect('/admin/category');
        }
        catch (error) {
            console.log(error.message);
        }
    },
    unblockCategory: async (req, res, next) => {
        try {
            console.log('heloo');
            id = req.params.id
            await Category.findByIdAndUpdate(id, { status: true })
            return res.status(200).redirect('/admin/category');
        }
        catch (error) {
            console.log(error.message);
        }
    },
    // deleteCategory: async (req, res, next) => {
    //     try {
    //         const id = req.params.id;
    //         console.log(id);
    //         // Perform the deletion in the database
    //         const result = await Category.deleteOne({ _id: id });

    //         // Check the result and send an appropriate response
    //         if (result.deletedCount > 0) {

    //             return res.status(200).redirect('/admin/category');
    //         } else {
    //             return res.status(404).json({ message: 'User not found' });
    //         }
    //     } catch (error) {
    //         console.error('Error deleting brand:', error);
    //         return res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // },

    addCategoryRender: async (req, res, next) => {
        try {


            const categories = await Category.find();
            res.render('admin/add-category', { user: req.user, error: null, success: null })
        }
        catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    renderCategoryOfferPage: async (req, res) => {
        const categories = await Category.find({ onDiscount: true, status: true, discountAmount: { $gt: 0 } });
        console.log('caterior with offers', categories);
        res.render('admin/addCategoryOffers', { categories, user: req.user });
    },
    updateCategoryOffer: async (req, res) => {
        try {
            let { categoryID } = req.body;
            console.log('caegoryofferedit',categoryID);

                   



            const updatedCategory = await Category.findByIdAndUpdate(categoryID, { $set: { onDiscount: false } });

            if (!(updatedCategory instanceof Category)) {

                return res.status(500).json({ success: false, message: 'Server is facing issues Updating Category Data' });
            }


            return res.status(200).redirect('/admin/addCategoryOffers');




        } catch (err) {

            return res.status(500).json({ success: false, message: 'Server is facing issues: ' });
        }
    },
    adminProductsView: async (req, res) => {
        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        const limit = 3;
        const products = await Product.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();
        const count = await Product.find().countDocuments();
        let category = await Category.find().lean()

        let brand = await Brand.find({}).lean();
        res.render('admin/products', { categorys: category, brands: brand, products: products, user: req.user, totalPage: Math.ceil(count / limit), currentPage: page })
    },
    editProductView: async (req, res,next) => {
        let id = req.params.id;

        let product = await Product.findOne({ _id: id }).lean();
        let category = await Category.find({}).lean();

        let brand = await Brand.find({}).lean();
        res.render('admin/edit_product', { categorys: category, brands: brand, product: product, user: req.user })
    },
    editProduct: async (req, res,next) => {
        try {
            const productId = req.params.id;
            const existingProduct = await Product.findById(productId);
            var offer;
            if(req.body.discount>=1){
              var  offer=req.body.price *(req.body.discount)/100;
              offer=req.body.price-offer;
            }else{
                offer=req.body.price;
            }
            if(req)
            if (!existingProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            console.log('editProduct existing', existingProduct.toString())
            const updateFields = {
                name: req.body.name || existingProduct.name,
                description: req.body.description || existingProduct.description,
                brand: req.body.brand || existingProduct.brand,
                category: req.body.category || existingProduct.category,
                size: req.body.size || existingProduct.size,
                price: req.body.price || existingProduct.price,
                rateOfDiscount:req.body.discount|| existingProduct.rateOfDiscount,
                offerPrice:offer,
                stock: req.body.stock || existingProduct.stock,
                isFeatured: req.body.isFeatured === 'on' ? true : false ,
                active: req.body.active === 'on' ? true : false,
                onOffer:req.body.onOffer==='on' ? true : false
            };

            if (req.files['image'] && req.files['image'][0].filename) {
                updateFields.image = req.files['image'][0].filename;
            }

            if (req.files['images'] && req.files['images'][0].filename) {
                updateFields.images = req.files['images'].map(file => file.filename);
            }

            const result = await Product.findOneAndUpdate(
                { _id: productId },
                { $set: updateFields },
                { new: true }
            );
            // Find and update the product using findOneAndUpdate with the updateFields
Product.findOneAndUpdate({ _id: productId }, updateFields, { new: true }, (err, updatedProduct) => {
    if (err) {
        console.error('Error updating product:', err);
        // Handle the error
    } else {
        console.log('Updated product:', updatedProduct);
        // Handle the updated product
    }
});

            if (result) {
                console.log('Success: product updated');
                return res.redirect('/admin/products');
            } else {
                console.log('Error: Product not found or no modifications made');
                req.session.error = 'Please update the product later';
                return res.redirect('/admin/products');
            }
        } catch (error) {
            console.log('Error updating product:', error);
            req.session.productUploadErr = 'Use any other image format';
            return res.redirect('/admin/products');
        }
    },
    addProductRender: async (req, res, next) => {
        try {
            const brands = await Brand.find({ active: true });

            const categories = await Category.find({ status: true });
            res.render('admin/add-product', { brands, categories, user: req.user });
        }
        catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    addProduct:async (req, res, next) => {
        try {
            // Extract data from the request body
            const { name, description, brand, category, size, price, stock, isFeatured,active } = req.body;
           
           console.log(req.files);
           const uploadedFiles = req.files;
        
           // Extract filenames from the uploaded files and save to an array
           const imageArray = uploadedFiles.map(file => file.filename);
   
          
    
            // Create a new product
            const newProduct = new Product({
                name,
                description,
                brand,
                category,
                size,
                price,
                stock,
                
                images: imageArray,
                active,
                isFeatured
                
            });
    
            // Save the product to the database
            const savedProduct = await newProduct.save();
    
            console.log(savedProduct);
            console.log("Success");
            res.redirect('/admin/products');
            
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } ,
    brandsRender:async (req, res) => {
        try {
            var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        const limit = 4;
            const brands = await Brand.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();;
            const count=await Brand.find().countDocuments();
            res.render('admin/brands', { brands,user:req.user, totalPage: Math.ceil(count / limit), currentPage: page}); // Assuming you have a brandsList.ejs file
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
updateBrand:async (req, res,next) => {

       
    
    try {
           // Assuming the uploaded image is stored in 'req.file.path'

           const brandId = req.params.id;

           let existingBrand = await Brand.findById(brandId);
           console.log('checkinggggg');

           if (!existingBrand) {
               return res.status(404).json({ error: 'Brand not found' });
           }
   
           
           let brandExist = await Brand.findOne({
               name: { $regex: new RegExp(req.body.name, 'i') },
               _id: { $ne: brandId } // Exclude the current brand's ID from the search
           });
           if (brandExist) {
               req.session.brandExist = true;
               return res.render('admin/edit_brand',{user:req.user,brand:existingBrand,error:"Brand Exist",sucess:null})
                          
           } 

const result = await Brand.updateOne(
   { _id: brandId },
   {
       $set: {
           name: req.body.name || existingBrand.name,
           image: req.file ? req.file.filename : existingBrand.image,
           active: req.body.active === 'on' ? true:false, 
       }
   }
);

if (result.nModified > 0) {
   console.log('Success: Brand updated');
   res.redirect('/admin/brands');
} else {
   console.log('Error: Brand not found or no modifications made');
   req.session.brandUploadErr = 'Use any other image format';
   res.redirect('/admin/brands');
}
} catch (error) {
console.error('Error updating brand:', error);
req.session.brandUploadErr = 'Use any other image format';
res.redirect('/admin/brands');
}
},

    orders: async (req, res) => {
        try {
            var page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            const limit = 5;

            // Fetch all orders from the database
            const orders = await Order.find().populate('user products.product').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();
            const count = await Order.find().populate('user products.product').countDocuments();

            // Render the admin orders page and pass orders data
            res.render('admin/orders', { orders, user: req.user, totalPage: Math.ceil(count / limit), currentPage: page });
        } catch (error) {
            // Handle errors
            console.error('Error fetching orders:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    updateOrderStatus: async (req, res) => {
        const orderId = req.body.orderId;
        const newStatus = req.body.newStatus;

        try {
            // Find the order by ID
            const order = await Order.findById(orderId);

            // If the order doesn't exist, return an error
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            } 

            // Update the order status
            order.status = newStatus;
            await order.save();

            // Respond with a success message
            res.redirect('/admin/orders');

        }
        catch (error) {
            // Handle errors
            console.error('Error updating order status:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    viewBanner: async (req, res) => {
        try {
            var page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            const limit = 3;
            const banners = await Banner.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();
            const count = await Banner.find().countDocuments();
            res.render('admin/banners', { banners, user: req.user, totalPage: Math.ceil(count / limit), currentPage: page }); // Assuming you have a brandsList.ejs file
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    viewAddNewBanner: async (req, res, next) => { res.render('admin/add-banner', { user: req.user }); },
    addNewBanner: async (req, res, next) => {
        try {
            // Assuming the uploaded image is stored in 'req.file.path'

            var name = req.body.name;
            name = name.trim();
            var description = req.body.description;
            description = description.trim();
            let newBanner = new Banner({
                name: name,
                image: req.file.filename,
                description: description,
                active: req.body.active === 'on' ? true : false,

            })
            console.log(newBanner)

            await newBanner.save().then((data) => {
                console.log("Sucess")

            }).catch((err) => {
                console.log(err.message);
            })
            res.redirect('/admin/banners')

        } catch (error) {

            req.session.brandUploadErr = 'Use any other image format'
            res.redirect('/admin/brands')
        }

    },
    editBannerRender: async (req, res, next) => {

        try {
            const banner_id = req.params.id;
            const banner = await Banner.findById(banner_id);;
            console.log(banner);
            res.render('admin/edit-banner', { banner, user: req.user, error: null, success: null });
        }

        catch (error) {

            console.error('Error deleting brand:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateBanner: async (req, res, next) => {
        try {
            // Assuming the uploaded image is stored in 'req.file.path'

            const bannerId = req.params.id;

            let existingBanner = await Banner.findById(bannerId);
            console.log('checkinggggg');

            if (!existingBanner) {
                return res.status(404).json({ error: 'Brand not found' });
            }


            var name = req.body.name;
            name = name.trim();
            var description = req.body.description;
            description = description.trim();
            const result = await Banner.updateOne(
                { _id: bannerId },
                {
                    $set: {
                        name: name || existingBanner.name,
                        description: description || existingBanner.description,
                        image: req.file ? req.file.filename : existingBanner.image,
                        active: req.body.active === 'on' ? true : false,
                    }
                }
            );

            if (result.nModified > 0) {
                console.log('Success: Banner updated');
                res.redirect('/admin/banners');
            } else {
                console.log('Error: Banner not found or no modifications made');
                req.session.brandUploadErr = 'Use any other image format';
                res.redirect('/admin/banners');
            }
        } catch (error) {
            console.error('Error updating brand:', error);
            req.session.brandUploadErr = 'Use any other image format';
            res.redirect('/admin/banners');
        }
    },
    deleteBanner: async (req, res) => {
        try {
            const bannerId = req.params.id;

            // Perform the deletion in the database
            const result = await Banner.deleteOne({ _id: bannerId });

            // Check the result and send an appropriate response
            if (result.deletedCount > 0) {
                res.json({ message: 'Banner deleted successfully' });
            } else {
                res.status(404).json({ message: 'Banner not found' });
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getCouponPage: async (req, res, next) => {

        try {
            var page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            const limit = 6;
            const coupons = await Coupon.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec();

            const count = await Coupon.find().countDocuments();

            return res.render('admin/coupon.ejs', { coupons, user: req.user, totalPage: Math.ceil(count / limit), currentPage: page });



        }

        catch (err) {

            next(err)
        }
    }
    ,
    addCouponPageRender: async (req, res, next) => {

        try {

            return res.render('admin/add-couponPage.ejs', { user: req.user });



        }

        catch (err) {

            next(err)
        }
    },


    // ! add coupon handler


    addCoupon: async (req, res, next) => {
        try {
            // Extract data from request body
            var { code, description, rateOfDiscount, maximumDiscount, expirationDate, isActive } = req.body;

            // Convert numeric fields to numbers
            rateOfDiscount = Number(rateOfDiscount);
            maximumDiscount = Number(maximumDiscount);
            expirationDate = new Date(expirationDate);

            // Trim and lowercase the coupon code
            code = code.trim().toLowerCase();
            description = description.trim();
            // Validate required fields
            if (!code || !description || !rateOfDiscount || !maximumDiscount || !expirationDate || !isActive) {
                return res.status(400).json({ success: false, message: "All fields are mandatory. Rate of discount and maximum discount should be above zero. Please try again!" });
            }

            // Validate numeric fields
            if (isNaN(rateOfDiscount) || isNaN(maximumDiscount) || rateOfDiscount < 0 || maximumDiscount < 0) {
                return res.status(400).json({ success: false, message: "Rate of discount and maximum discount value should be non-negative numerical values. Please try again!" });
            }

            // Create a new coupon instance
            const coupon = new Coupon({ code, description, rateOfDiscount, maximumDiscount, isActive, expirationDate });

            // Save the coupon to the database
            const savedCoupon = await coupon.save();

            // Check if the coupon was saved successfully
            if (savedCoupon) {
                return res.status(201).json({ success: true, message: "New coupon created successfully!" });
            }

            // If saving failed for some reason
            return res.status(500).json({ success: false, message: "Failed to add new coupon due to server issues. Please try again later!" });

        } catch (error) {
            // Handle any unexpected errors
            console.error("Error in addCoupon:", error);
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "Duplicate coupon code. Please choose a different one." });
            }
            return res.status(500).json({ success: false, message: "Failed to add new coupon due to server issues. Please try again later!" });
        }
    },

    getEditCouponPage: async (req, res, next) => {
        try {
            const couponid = req.params.id;
            const coupon = await Coupon.findById(couponid);
            res.render('admin/edit-coupon', { coupon: coupon, user: req.user });
        }
        catch (error) {

        }
    },
    updatecoupon: async (req, res) => {
        const couponId = req.params.id;
        console.log('hai from server');
        try {
            // Find the coupon by ID
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                // Display SweetAlert error message if coupon is not found

                return res.status(404).json({ error: 'Coupon not found' });
            }
            var code = req.body.code;
            code = code.trim().toLowerCase();
            var description = req.body.description;
            description = description.trim();
            // Update coupon details with data from request body
            coupon.code = code;
            coupon.description = description;
            coupon.rateOfDiscount = req.body.rateOfDiscount;
            coupon.maximumDiscount = req.body.maximumDiscount;
            coupon.expirationDate = req.body.expirationDate;
            coupon.isActive = req.body.isActive;

            // Save the updated coupon
            await coupon.save();

            // Display SweetAlert success message


            // Respond with success message
            res.redirect('/admin/coupon');
        } catch (error) {
            console.error('Error updating coupon:', error);
            // Display SweetAlert error message if there's an internal server error

            // Respond with error message
            res.status(500).json({ error: 'Internal server error' });
        }


    },
    deleteCoupon: async (req, res) => {

        try {
            const couponId = req.params.id;
            // Find the coupon by ID
            const coupon = await Coupon.findById(couponId);
            coupon.isActive = false;
            // Save the updated coupon
            await coupon.save();
            // Respond with success message
            res.redirect('/admin/coupon');
        }
        catch (error) {
            console.log('errorhappend', error)
            // Respond with error message
            res.status(500).json({ error });
        }
    },
    // ! chart data 

    getChartDataHandler: async (req, res, next) => {



        try {

            let timeBaseForSalesChart = req.query.salesChart;
            let timeBaseForOrderNoChart = req.query.orderChart;
            let timeBaseForOrderTypeChart = req.query.orderType;
            let timeBaseForCategoryBasedChart = req.query.categoryChart;


            function getDatesAndQueryData(timeBaseForChart, chartType) {


                let startDate, endDate;

                let groupingQuery, sortQuery;



                if (timeBaseForChart === 'yearly') {

                    startDate = new Date(new Date().getFullYear(), 0, 1);

                    endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

                    groupingQuery = {
                        _id: {
                            month: { $month: { $toDate: '$orderDate' } },
                            year: { $year: { $toDate: '$orderDate' } }
                        },
                        totalSales: { $sum: "$finalPrice" },
                        totalOrder: { $sum: 1 }
                    }

                    sortQuery = { '_id.year': 1, '_id.month': 1 }
                }



                if (timeBaseForChart === 'weekly') {

                    startDate = new Date();

                    endDate = new Date();

                    const timezoneOffset = startDate.getTimezoneOffset();

                    startDate.setDate(startDate.getDate() - 6);

                    startDate.setUTCHours(0, 0, 0, 0);

                    startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);

                    endDate.setUTCHours(0, 0, 0, 0);

                    endDate.setDate(endDate.getDate() + 1)

                    endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);




                    groupingQuery = {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                        },
                        totalSales: { $sum: "$finalPrice" },
                        totalOrder: { $sum: 1 }

                    }

                    sortQuery = { '_id': 1 }

                }





                if (timeBaseForChart === 'daily') {

                    startDate = new Date();
                    endDate = new Date();


                    const timezoneOffset = startDate.getTimezoneOffset();



                    startDate.setUTCHours(0, 0, 0, 0);

                    endDate.setUTCHours(0, 0, 0, 0);

                    endDate.setDate(endDate.getDate() + 1)



                    startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);

                    endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);


                    groupingQuery = {
                        _id: { $hour: "$orderDate" },
                        totalSales: { $sum: "$finalPrice" },
                        totalOrder: { $sum: 1 }
                    }

                    sortQuery = { '_id.hour': 1 }
                }




                if (chartType === 'sales') {

                    return { groupingQuery, sortQuery, startDate, endDate }
                }

                else if (chartType === 'orderType') {

                    return { startDate, endDate }
                }

                else if (chartType === 'categoryBasedChart') {

                    return { startDate, endDate }
                }
                else if (chartType === 'orderNoChart') {
                    return { groupingQuery, sortQuery, startDate, endDate }
                }



            }





            const salesChartInfo = getDatesAndQueryData(timeBaseForSalesChart, 'sales');

            const orderChartInfo = getDatesAndQueryData(timeBaseForOrderTypeChart, 'orderType');

            const categoryBasedChartInfo = getDatesAndQueryData(timeBaseForCategoryBasedChart, 'categoryBasedChart');

            const orderNoChartInfo = getDatesAndQueryData(timeBaseForOrderNoChart, 'orderNoChart')




            let salesChartData = await Order.aggregate([{

                $match: {
                    $and: [
                        {
                            orderDate: {
                                $gte: salesChartInfo.startDate,
                                $lte: salesChartInfo.endDate
                            },
                            status: {   
                            $nin: ['pending', 'cancelled','returned']
                            }
                        }, {
                            paymentStatus: {
                                $nin: ['pending', 'failed', 'refunded', 'cancelled']
                            }
                        }, { clientOrderProcessingCompleted: true }
                    ]
                }
            },

            {
                $group: salesChartInfo.groupingQuery
            }, {
                $sort: salesChartInfo.sortQuery
            }

            ]).exec();


             console.log(salesChartData);

            let orderNoChartData = await Order.aggregate([{

                $match: {
                    $and: [
                        {
                            orderDate: {
                                $gte: orderNoChartInfo.startDate,
                                $lte: orderNoChartInfo.endDate
                            },
                            status: {
                                $nin: ['pending','returned', 'cancelled']
                            }
                        }, {
                            paymentStatus: {
                                $nin: ['pending', 'failed', 'refunded', 'cancelled']
                            }
                        }, { clientOrderProcessingCompleted: true }
                    ]
                }
            },

            {
                $group: orderNoChartInfo.groupingQuery
            }, {
                $sort: orderNoChartInfo.sortQuery
            }

            ]).exec();

            console.log(orderNoChartData);

            let orderChartData = await Order.aggregate([{

                $match: {
                    $and: [
                        {
                            orderDate: {
                                $gte: orderChartInfo.startDate,
                                $lte: orderChartInfo.endDate
                            },
                            status: {
                                $nin: ['pending', 'cancelled','returned']
                            }
                        }, {
                            paymentStatus: {
                                $nin: ['pending', 'failed', 'refunded', 'cancelled']
                            }
                        }, { clientOrderProcessingCompleted: true }
                    ]
                }
            }, {
                $group: {
                    _id: '$paymentOption',

                    totalOrder: { $sum: 1 }
                }
            },

            ]).exec();


console.log(orderChartData);

let categoryWiseChartData= await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: orderChartInfo.startDate,
            $lte: orderChartInfo.endDate },
        status: { $nin: ['pending', 'cancelled', 'returned'] },
        paymentStatus: { $nin: ['pending', 'failed', 'refunded', 'cancelled'] },
        clientOrderProcessingCompleted: true
      }
    },
    {
      $unwind: '$products'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'products.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'productInfo.category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $group: {
        _id: '$categoryInfo.name',
        totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
      }
    }
  ]);
  
              
console.log('category is',categoryWiseChartData);


            let saleChartInfo = { timeBasis: timeBaseForSalesChart, data: salesChartData };

            let orderTypeChartInfo = { timeBasis: timeBaseForOrderTypeChart, data: orderChartData };

            let categoryChartInfo = { timeBasis:timeBaseForCategoryBasedChart, data: categoryWiseChartData }

            let orderQuantityChartInfo = { timeBasis: timeBaseForOrderNoChart, data: orderNoChartData }




            return res.status(200).json({ saleChartInfo, orderTypeChartInfo, categoryChartInfo, orderQuantityChartInfo });



        }
        catch (err) {
            next(err)
        }
    },

    // ! render the sales report 

    renderSalesReport: async (req, res, next) => {

        try {
            let startingDate = new Date();
            let endingDate = new Date();
        
            if (req.query.startingDate) {
                startingDate = new Date(req.query.startingDate);
            }
        
            if (req.query.endingDate) {
                endingDate = new Date(req.query.endingDate);
            }
        
            startingDate.setUTCHours(0, 0, 0, 0);
            endingDate.setUTCHours(23, 59, 59, 999);
        
            // Define the query
            const query = {
                createdAt: { $gte: startingDate, $lte: endingDate }, // Filter by creation date within the range
                status: 'delivered' // Include only orders with status 'delivered'
            };
        
            // Execute the query and populate products
            const orders = await Order.find(query).populate('products.product');
        
            console.log('Orders:', orders);
            res.render('admin/salesReport', { user: req.user, orders, startingDate, endingDate });
        } catch (error) {
            console.error(error);
            next(error); // Pass the error to the error handling middleware
        }
    },
    salesReportPdfRender: async (req, res, next) => {
        try {

            let startingDate = new Date();
            let endingDate = new Date();



            if (req.query.startingDate) {

                startingDate = new Date(req.query.startingDate);
            }

            if (req.query.endingDate) {

                endingDate = new Date(req.query.endingDate);
            }


            startingDate.setUTCHours(0, 0, 0, 0);

            endingDate.setUTCHours(23, 59, 59, 999);


            // Define the query
            const query = {
                createdAt: { $gte: startingDate, $lte: endingDate }, // Filter by creation date within the range
                status: 'delivered'// Include only orders with status 'cancelled'
            };

            // Execute the query
            Order.find(query).populate('products.product')
                .then(orders => {
                    // Do something with the retrieved orders
                    console.log('hai', orders, 'startingDate', startingDate, 'endingDate', endingDate);
                    res.render('admin/salesReportPdf', { user: req.user, orders, startingDate, endingDate })
                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                });


        }

        catch (err) {

            next(err)
        }
    },
    // ! sales report in excel

    salesReportInExcel:async (req, res, next) => {
    try {
        let startingDate = new Date();
        let endingDate = new Date();

        if (req.query.startingDate) {
            startingDate = new Date(req.query.startingDate);
        }

        if (req.query.endingDate) {
            endingDate = new Date(req.query.endingDate);
        }

        startingDate.setUTCHours(0, 0, 0, 0);
        endingDate.setUTCHours(23, 59, 59, 999);

        // Define the query
        const query = {
            createdAt: { $gte: startingDate, $lte: endingDate },
            status: 'delivered'
        };

        // Execute the query and await the result
        const orders = await Order.find(query).lean(); // Use lean() to get plain JS objects
        console.log('excel',orders);
        const workBook = new excelJS.Workbook();
        const worksheet = workBook.addWorksheet('Sales Report');

        // Define columns
        worksheet.columns = [
            { header: 'id', key: '_id' },
            { header: 'userID', key: 'userID' },
            { header: 'payment Method', key: 'paymentOption' },
            { header: 'payment Status', key: 'paymentStatus' },
            { header: 'order Status', key: 'status' },
            { header: 'shipping Address', key: 'shippingAddress' },
            { header: 'gross Total', key: 'grossTotal' },
            { header: 'coupon Applied', key: 'couponApplied' },
            { header: 'discount Amount', key: 'discountAmount' },
            { header: 'category Discount', key: 'categoryDiscount' },
            { header: 'final Price', key: 'finalPrice' },
            { header: 'client OrderProcessing Completed', key: 'clientOrderProcessingCompleted' },
            { header: 'order Date', key: 'orderDate' },
            { header: 'ordered Items', key: 'products' },
        ];

        // Add rows to the worksheet
        orders.forEach((order) => {
            worksheet.addRow(order);
        });

        // Style the header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        // Set response headers for download
        res.setHeader("content-Type", "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet");
        res.setHeader("content-Disposition", 'attachment; filename=orders.xlsx');

        // Write the workbook to response and send status
        await workBook.xlsx.write(res);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
},

    // ! sales report in pdf 

    salesReportInPdf: async (req, res, next) => {

        try {

            let startingDate = req.query.startingDate;

            let endingDate = req.query.endingDate;

            console.log('server start date and end Date', startingDate, endingDate)

            const browser = await puppeteer.launch({ headless: 'true', executablePath: '/home/ubuntu/.cache/puppeteer/chrome/linux-123.0.6312.122/chrome-linux64/chrome',args: ["--no-sandbox", "--disable-setuid-sandbox"] });
            const page = await browser.newPage();


            await page.setViewport({
                width: 1680,
                height: 800,
            });

            await page.goto(`${req.protocol}://${req.get('host')}` + '/admin/salesReportPdf' + `?startingDate=${startingDate}&endingDate=${endingDate}`, { waitUntil: 'networkidle2' });



            // try {
            //     await page.waitForSelector('th', { timeout: 30000 }); // 60 seconds timeout
            //     // Continue with PDF generation logic
            // } catch (error) {
            //     console.error('Timeout waiting for selector:', error);
            //     // Handle timeout error gracefully
            // }

            // Add CSS to hide elements you want to exclude from PDF
            await page.addStyleTag({
                content: `
        /* Hide t needed in PDF */
        .breadcrumb-option, .breadcrumb__links, .my-5 .mx-5 .d-flex .align-items-center, #getExcelBtn, #getPDF, #getReport {
            display: none !important;
        }
    `,
            });
            //await page.waitForSelector('th', { timeout: 30000 });

            const date = new Date();

            const pdfn = await page.pdf({
                path: `${path.join(__dirname, '../public/files/salesReport', date.getTime() + '.pdf')}`,
                printBackground: true,
                format: "A4"
            })

            setTimeout(async () => {
                await browser.close();


                const pdfURL = path.join(__dirname, '../public/files/salesReport', date.getTime() + '.pdf');




                res.download(pdfURL, function (err) {

                    if (err) {

                        console.log('Failed sending sales report pdf \n \n')
                    }
                })


            }, 1000);





        }
        catch (err) {

            next(err);
        }
    },
    updateImage :async (req, res) => {
        try {
            const { id, index } = req.body; 
            console.log(id,index);
            // Extract other data from request body
            const imageUrl = req.file ? req.file.filename : ''; // Get uploaded file URL
            console.log(imageUrl); // Extract data from request body
          
            // Update the images array in the database for the specified product ID
           const product= await Product.findById(id);
           if (index < product.images.length) {
            product.images[index] =imageUrl; // Replace the existing image
          } else {
            product.images.push(imageUrl); // Insert the new image at the end of the array
          }
          product.save();
    console.log(product);
    return res.status(303).redirect(`/admin/edit_product/${id}`);
                                                          
        } catch (error) {
            console.error('Error updating image:', error);
            res.status(500).json({ error: 'Error updating image' });
        }
    

}
}

