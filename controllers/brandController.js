const express=require('express');
const Brand=require('../models/brandModel');
module.exports={
   addBrandHandler: async (req, res,next) => {

        let brandExist = await Brand.findOne({
            name: { $regex: new RegExp(req.body.name, 'i') }
        })
        console.log(brandExist, 'yessssssssssssssss');
    
        if (brandExist) {
            req.session.brandExist = true;
            res.render('admin/add-brand',{user:req.user,error:"Brand Exist",sucess:null})
            
    
        } else {
    
         
    
    
            try {
                // Assuming the uploaded image is stored in 'req.file.path'
    
    
                let newBrand = new Brand({
                    name: req.body.name,
                    image: req.file.filename,
                    active: req.body.active
    
                })
                console.log(newBrand)
    
                await newBrand.save().then((data) => {
                    console.log("Sucess")
    
                }).catch((err) => {
                    console.log(err.message);
                    
                })
                res.redirect('/admin/brands')
    
            } catch (error) {
    
                req.session.brandUploadErr = 'Use any other image format'
                res.redirect('/admin/brands')
            }
        };
    
    
    
    },
     
}