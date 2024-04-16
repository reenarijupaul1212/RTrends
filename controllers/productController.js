
const productMulter = require('../multer/product');
const Category = require('../models/categoryModel');
const User=require('../models/userModel');
const WishList=require('../models/wishListModel');
const Product=require('../models/productModel');
const Brand=require('../models/brandModel')
const mongoose = require('mongoose');
module.exports={

    singleProductView:async(req,res,next)=>{
        id=req.params.id;
        try{
    const product=await Product.findOne({_id:id});
    console.log(product);
    console.log(id);
    res.status(200).render('users/sproduct_page',{product:product,user:req.user,message:null})
        }
        catch(error){
            console.error('Error filtering products:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    getProductViewPage: async (req, res, next) => {
        try {
            let search = '';
            if (req.query.search) {
                search = req.query.search.trim();
            }
        
            
            var page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
    
            const brand = req.query.brand;
            const categories = req.query.category; // Update to handle multiple categories
    
            const limit = 3;
    
            const sortBy = req.query.sortBy;
    
            let sortQuery = {};
            if (sortBy) {
                if (sortBy === 'lowPrice') {
                    sortQuery = { price: 1 };
                } else if (sortBy === 'highPrice') {
                    sortQuery = { price: -1 };
                }
            }
    
            let filterQuery = {};
            filterQuery.active = true;
    
            if (search) {
                filterQuery.name = { $regex: search, $options: 'i' };
            }
    
            if (categories) {
                const categoryArray = categories.split(','); // Split multiple categories into an array
                filterQuery.category = { $in: categoryArray }; // Use $in operator to match any of the selected categories
            }
    
            if (brand) {
                const brandsArray=brand.split(',');
                filterQuery.brand={$in:brandsArray};
                
            }
    
            const products = await Product.find(filterQuery)
                .sort(sortQuery)
                .limit(limit * 1)
                .skip((page - 1) * limit)
               
                .exec();
    
            const count = await Product.find(filterQuery).countDocuments();
    
            const categoriesData = await Category.aggregate([
                { $match: { status: true } },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'productsData',
                    },
                },
                {
                    $project: {
                        name: 1,
                        count: { $size: '$productsData' },
                    },
                },
            ]);
    
            const brands = await Brand.aggregate([
                { $match: { active: true } },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'brand',
                        as: 'productsData',
                    },
                },
                {
                    $project: {
                        name: 1,
                        count: { $size: '$productsData' },
                    },
                },
            ]);
     console.log('filer products',products,count);
            return res.render('users/product', {
                categories: categoriesData,
                brands,
                sortBy,
              //  categoryID: categories, // Pass selected categories to the template
                count,
                count,
                products,
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                previous: page - 1,
                next: Number(page) + 1,
                limit,
                search,
                user: req.user,
                message: null,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    

    getAddproduct:async(req,res)=>{
        let Category = await categoryModel.find({}).lean()
        res.render('admin/products',{category:Category,user:req.user})
    },

    filterProducts: async (req, res) => {
        try {
            // Extract filters from the request body
            const { category, minPriceRange,maxPriceRange } = req.body;
    
            // Build the filter object based on the received filters
            const filters = {};
    
            if (category && category !== 'all') {
                filters.category = category;
            }
    
            if(minPriceRange && maxPriceRange){
                // Assuming the priceRange is an object with min and max properties
                filters.price = { $gte: minPriceRange, $lte: maxPriceRange };
          
            }
            console.log(filters);
            // Query the database with the applied filters
            const filteredProducts = await Product.find(filters);
    
            // Render filter_products.ejs with filtered product data
            console.log('filtered data');
            console.log(filteredProducts);
            console.log('note');
            return res.json(filteredProducts );
        } catch (error) {
            console.error('Error filtering products:', error);
            res.status(500).send('Internal Server Error');
        }
    } ,
  
    showProducts:async(req,res)=>{
        
        
        var products = await productModel.aggregate([
            
            {$project:{
                name:1,
                description:1,
                unit:1,
                regularPrice:1,
                promotionalPrice:1,
                category:1,
                images:1,
                catId:{'$toObjectId':'$category'},
                
            }},
            {$lookup:{
                from:'categories', 
                localField:'catId', 
                foreignField:'_id',
                as:'categoryDetails',
            }},{
            $match:{
                'categoryDetails.isListed':1
            }}
        ])

        let category = await categoryModel.find()

        console.log(products,'kshow');
        res.render('users/showProducts',{products,isLoggedIn:req.session.isLoggedIn,category,user:req.user})
    },
    adminProductList:async(req,res)=>{
        let product = await productModel.find({}).lean()
        res.render('admin/admin-productList',{product,user:req.user})
    },
    productDetails:async(req,res)=>{
        try {
            let product = await productModel.findById(req.query.id)
        res.render('users/productDetail',{product,isLoggedIn : req.session.isLoggedIn,user:req.user})
            
        } catch (error) {
            console.log(error.message);
        }
    },
    deleteProduct:async(req,res)=>{
        await productModel.deleteOne({_id:req.query.id})
        res.redirect('/admin/productList')
    },
    getEditProduct:async(req,res)=>{
        let product = await productModel.findOne({_id:req.query.id}).lean()
        let category = await categoryModel.find({}).lean()
        console.log(product);
        res.render('admin/edit-product',{category,product,user:req.user})
    },
    editProduct:async(req,res)=>{
        console.log(req.files);
        let category = await categoryModel.findOne({name:req.body.category})
        if(req.files.length !== 0){
            console.log(req.query.id);
            console.log('Entered');
            let id = req.query.id
            let product = await productModel.findByIdAndUpdate(id,
                {name:req.body.name,
                    category:category._id,
                    description:req.body.description,
                    promotionalPrice:req.body.Pprice,
                    gst:req.body.gst,
                    unit:req.body.unit,
                    regularPrice:req.body.Rprice,
                images:[req.files[0].filename,req.files[1].filename,req.files[2].filename,req.files[3].filename]
            },{new:true})
            console.log('product',product);
            if(product){
                console.log('if workedd');
                res.redirect('/admin/productList')
            }else{
                console.log(' updated');
                res.redirect('/admin/productList')
            }

        }else{
            let id = req.query.id
            console.log(id,'id');

            let product = await productModel.findByIdAndUpdate(id,
                {name:req.body.name,
                category:category._id,
                description:req.body.description,
                promotionalPrice:req.body.Pprice,
                gst:req.body.gst,
                unit:req.body.unit,
                regularPrice:req.body.Rprice
    
            },{new:true})
            if(product){
                
               console.log('else worked');
               console.log(product);
                res.redirect('/admin/productList')
            }else{
                console.log('not updated');
                res.redirect('/admin/productList')
            }
        }
        console.log(req.query.id);
        
        

    },
    searchProd:async(req,res)=>{
       
        let products = await productModel.find({
            name: { $regex: `${req.body.search}`, $options: 'i' }
        });
        console.log(products);
        res.render('users/showProducts',{products,user:req.user})
    },
    
   
    }
    
