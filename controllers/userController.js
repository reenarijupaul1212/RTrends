const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Wallet=require('../models/walletModel');
const Order=require('../models/ordermodel');
const Banner=require('../models/bannerModel');
const passport = require("passport");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const randomstring = require("randomstring"); // Assuming you use this library for OTP generation
const nodemailer = require("nodemailer");
const session = require('express-session');
const { model } = require('mongoose');
const { updateDecQuantityOfCartItem } = require('./cartController');
const Wallets=require('../models/walletModel');

module.exports = {
  homepageView: async (req, res, next) => {
    const banners = await Banner.find();
    console.log(passport.session.user,banners);
    const products = await Product.find();
    const allCategory = await Category.find({status:true});
   
    res.render('users/index', { products, allCategory,banners, user: req.user,message:null });
  },
  // For Register Page
  registerView: (req, res, next) => {
    req.session.user=req.user;
    res.render("users/signup", { user: req.user, message:""});
  },

  // Post Request for Register
  registerUser: async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        confirm,
        mobile,
        role,
        userStatus,
        isVerified,
        otp,
                   
            } = req.body;
            

      if (!name || !email || !password || !confirm || !mobile) {
        req.flash('error', 'Please fill in all the fields***');
        console.log('please flll in allthefields');
        return res.render("users/signup", {
          name,
          email,
          password,
          confirm,
          //error: req.flash('error')
          message: req.flash(),
          user:req.user
        });
      }

      if (password !== confirm) {
        console.log('password must mach');
        req.flash('error','password must mach')
        return res.render("users/signup", {
          user:req.user,
          name:name,
          email:email,
          message: req.flash(),
        });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log('user mail exist');
      
        req.flash('error','user mail exist');
        return res.render("users/signup", {
          user: req.user,
          name:name,
          email:email,
          password,
          confirm,
          message:req.flash(),
        });
      }

      const newUser = new User({
        name,
        email,
        password,
        mobile,
        role,
        userStatus,
        isVerified,
        otp,
      });

      // Password Hashing
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      // Generate OTP
      const generatedOTP = randomstring.generate({
        length: 6,
        charset: 'numeric',
      });
      newUser.otp = generatedOTP;

      await newUser.save();

      // Send OTP via email (you can also send it via SMS)
      var transporter = nodemailer.createTransport({

        service: 'gmail',

        secure: true,
        auth: {
          user: 'reenarijupaul1212@gmail.com',
          pass: 'kayv jddg dtre eihv',
        },
        secure: false, // Use true for 465, false for other ports
        tls: {
          rejectUnauthorized: false, // Set to false if using self-signed certificates
        },
      });

      const mailOptions = {
        from: 'reenarijupaul1212@gmail.com',
        to: email,
        subject: 'Verification OTP',
        text: generatedOTP,
        html: ""
      };

      await transporter.sendMail(mailOptions);

      const message = 'User registered successfully. Check your email for OTP.';
      res.redirect(`/otp_verify?email=${email}&message=${encodeURIComponent(message)}`);

    } 
  catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },



  // For View
  loginView: (req, res) => {
    const user = req.user;
    const message = req.flash() ||'';
    res.render("users/login", { user, message});
  },

  // Logging in Function
  loginUser: (req, res) => {
    const { email, password } = req.body;
    //Required
    if (!email || !password) {
      console.log("Please fill in all the fields");
      req.flash('error', 'Please fill in all fields');
      res.render("users/login", {
        email,
        password,
        user:req.user,
        message: req.flash(),
      });
    } else {

      passport.authenticate("local", {

        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true,
      })(req, res);

    }

  },
  //OtP-verify
  verifyOtp: async (req, res) => {
    const userEmail = req.body.email; // Assuming email is sent in the request body
    const userOtp = req.body.otp;
    try {

      const updatedUser = await User.findOneAndUpdate(
        { email: userEmail, otp: { $eq: userOtp } },
        { $set: { isVerified: true, userStatus: true } },
        { new: true } // Return the updated user
      );

      if (updatedUser) {
        // Check if the address already exists for the user
        const existingAddress = await Address.findOne({ userId: updatedUser._id });
        if (existingAddress) {
            // Address already exists, no need to save it again
           return res.json({ success: true, message: 'you all ready registered ,please login' });
        }

        // Address not found, save it
        const userAddress = new Address({ userId: updatedUser._id });
        await userAddress.save();
        const userWallet=new Wallets({userId:updatedUser._id});
        await userWallet.save();
        console.log('user wallect=',userWallet);
        res.json({ success: true, message: 'OTP entered correct one.' });
    } else {
    
      res.json({ error: true, message: 'OTP entered wrongtry again.' });
       
       
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  reSendOtp: async (req, res) => {
    try {
      const email = req.query.email;

      // Find the user by email
      const user = await User.findOne({ email });
      // Generate OTP
      const generatedOTP = randomstring.generate({
        length: 6,
        charset: 'numeric',
      });


      // Update the user's OTP field with the new OTP
      user.otp = generatedOTP;
      await user.save();

      console.log("new usr", user)
      const user1 = await User.findOne({ email });
      console.log("saved new usr", user1)
      // Send the new OTP to the use;r's email (implement your email sending logic here)
      // Send OTP via email (you can also send it via SMS)
      var transporter = nodemailer.createTransport({

        service: 'gmail',

        secure: true,
        auth: {
          user: 'reenarijupaul1212@gmail.com',
          pass: 'kayv jddg dtre eihv',
        },
        secure: false, // Use true for 465, false for other ports
        tls: {
          rejectUnauthorized: false, // Set to false if using self-signed certificates
        },
      });

      const mailOptions = {
        from: 'reenarijupaul1212@gmail.com',
        to: email,
        subject: 'Resend Verification OTP',
        text: generatedOTP,
        html: ""
      };

      await transporter.sendMail(mailOptions);

      const message = 'Resend OTP successful. Check your email for OTP.';
      res.json({ success: true, message });

      // Respond with success message

    } catch (error) {
      console.error('Error:', error);
      // Respond with error message
      res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
    }
  },
  viewVerifyOtp: (req, res) => {
    const email = req.query.email;
    const message = req.query.message ? decodeURIComponent(req.query.message) : '';

    res.render('users/otp_verify', { user: req.user, email, message });
  },
  getProfile: async (req, res) => {
    email = req.user.email;
    const profil = await User.findOne({ email: email })
    const addres = await Address.find({ userId: profil._id });
    console.log(profil);
    console.log('profilllll');
    console.log(addres);
    return res.status(200).render('users/profile', { profil: profil, add: addres, user: req.user,message:"" })
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
          profileImage: req.file.filename ,
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
  logOut: (req, res, next) => {
    // Passport adds a logout() method to the request object


    // Calling req.logout() with a callback function
    req.logout((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      // Redirect to a different route after logout (e.g., home page)
      return res.redirect('/');
    });
  },
  viewforgotPassword: (req, res) => {
    message=req.flash()
    res.render('users/forgot-password',{user:req.user,message});
  },
  doForgotPassword: async (req, res) => {
    const token = req.params.token;
    try {
      const { email } = req.body;
      // Generate a unique token
      const token = crypto.randomBytes(20).toString('hex');
      // Find user by email
      const user = await User.findOne({ email });
      console.log(Date.now());
      if (!user) {
        return res.render('forgot-password', { error: 'No user found with that email address' });
      }
      // Save token and expiration date to user document
      //user.resetPasswordToken = token;
     // user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      // Update the user document
  // Update the user document
  const expirationTime = new Date(Date.now() + 30 * 60 * 1000); 
  await User.updateOne(
    { email: email }, // Filter to find the user by email
    { $set: { resetPasswordToken: token, resetPasswordExpires: expirationTime.getTime() } }, // Set the new fields and values
    { upsert: true } // Specify upsert option to insert if the document does not exist
  );
  const user1 = await User.findOne({ email });
     console.log('user1',user1) ;
      // Send password reset email
      var transporter = nodemailer.createTransport({
       
        service: 'gmail',
     
     secure: true,
        auth: {
          user: 'reenarijupaul1212@gmail.com',
          pass: 'kayv jddg dtre eihv',
        },
        secure: false, // Use true for 465, false for other ports
        tls: {
          rejectUnauthorized: false, // Set to false if using self-signed certificates
        },
      });

      const mailOptions = {
        // Email content and options
        to: email,
        from: 'reenarijupaul1212@gmail.com',
        subject: 'Password Reset',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n`
          + `Please click on the following link, or paste this into your browser to complete the process:\n\n`
          + `http://${req.headers.host}/reset-password/${token}\n\n`
          + `If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };

      await transporter.sendMail(mailOptions);
      req.flash('success','An email has been sent with further instructions');
      message=req.flash();
      res.render('users/forgot-password', { user:req.user,message});
    } catch (error) {
      console.error(error);
      req.flash('error','something wrong');
      message=req.flash();
      res.render('users/forgot-password', {user:req.user,message});
    }
  },
  viewPasswordRest:(req, res) => {
    const token = req.params.token;
    // Render your password reset page or perform other actions here
    res.render('users/password_reset', { token ,message,user:req.user});
},
doPasswordRest: async (req, res) => {
  var token = req.params.token;
  try {
    
    
    const {  password,confirmPassword } = req.body;
    // Find user by reset token and check if token is not expired
    if (password !== confirmPassword) {
      console.log('password must mach')
      req.flash('error','Password must match');
      message=req.flash();
      return res.render("users/password_reset", {
        user: req.user,
        token,
        message
      });
    }
    const resetPasswordExpiresTimestamp  = new Date(Date.now() );
    console.log(resetPasswordExpiresTimestamp,token);
    var user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: resetPasswordExpiresTimestamp }
    });
    console.log('hai',user);

    if (!user) {
      req.flash('error','Password reset token is invalid or has expired.')
      message=req.flash();
      return res.render('users/password_reset', {
        message,
        token,
        user: req.user
      });
    }
    console.log('old Pass',user.name);
    // Set new password
    user.password = password;
    //Password Hashing
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt); 
  
    
    // Clear reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Save user
    await user.save();

    // Optionally, you may want to notify the user that their password has been changed
    // You can use nodemailer to send an email confirmation

    // Redirect or render success message
    req.flash('success','Your password has been successfully reset. Please login with your new password.')
    message=req.flash();
    res.render('users/login', { user:req.user,message});
  } catch (error) {
    console.error(error);
    req.flash('error','An error occurred while resetting your password. Please try again later.')
    message=req.flash();
    res.render('users/password_reset', {
      message,
      token,
      user: req.user
    });
  }
},
renderWallet:async(req,res)=>{
  try{
let userid=req.user._id;
let transactions=await Wallet.find({userId:userid});
console.log(transactions);
res.render('users/wallet',{transactions,user:req.user});
  }
  catch(error){
console.log(error);
  }
}



}
