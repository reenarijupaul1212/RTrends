const productMulter = require('../multer/product');
const Category = require('../models/categoryModel');
const User=require('../models/userModel');
const WishList=require('../models/wishListModel');
const Product=require('../models/productModel');
module.exports={
   //! add to wishlist

   addToWishList: async (req, res, next) => {
    const { productId } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and user object is available in req.user

    try {
        // Find the user by ID
        const user = await User.findById(userId).populate('wishlist');

        // If user doesn't exist, return error
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if user has a wishlist
        if (!user.wishlist) {
            // If user doesn't have a wishlist, create a new one
            const newWishlist = new WishList({ userId: user._id, products: [productId] });
            await newWishlist.save();
            user.wishlist = newWishlist;
        } else {
            // Check if product already exists in wishlist
            if (user.wishlist.products.includes(productId)) {
                return res.status(400).json({ success: false, message: "Product already exists in wishlist" });
            }
            user.wishlist.products.push(productId);
            await user.wishlist.save();
        }

        // Save the updated user
        await user.save();

        return res.status(200).json({ success: true, message: "Product added to wishlist successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
},
WishListPage: async (req, res) => {
    const userID = req.user._id;
    try {
      // Fetch wishlist data from the database
      const wishlist = await WishList.findOne({ userId: userID }).populate('products');
      console.log(wishlist);
        if(!wishlist)
        {
req.flash=('success','please add product to wishlist');

            return res.render('users/wishlist',{products:null,user:req.user,message})
        }
      // Render the wishList.ejs template with wishlist data
      message=req.flash();
      res.render('users/wishlist', { products: wishlist.products,user:req.user,message });
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ! remove product from wishList Handler 

removeFromWishList : async (req, res, next) => {


if (!req.user._id) {



    req.session.message = {
        type: 'danger',
        message: 'Your session Timed out login to access wishlist'
    }
    return res.redirect('/');


}


try {

    const { productID } = req.body;

    const userID = req.user._id;

    const userData = await User.findById(userID);

    const userWishListID = userData.wishlist;

    const updatedWishList = await WishList.findByIdAndUpdate(userWishListID, { $pull: { products: productID } });

    if (updatedWishList) {

        return res.status(201).json({
            "success": true,
            "message": "Removed item from wishlist"
        })
    } else {
        return res.status(500).json({
            "success": true,
            "message": "failed to remove product from wishlist try again"
        })
    }


}
catch (err) {

    return res.status(500).json({
        "success": true,
        "message": "failed to remove product from wishlist try again"
    })
}


}  
}