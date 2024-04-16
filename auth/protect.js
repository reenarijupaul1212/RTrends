const { response } = require("express");

const protectRoute = (req, res, next) =>{
    if (req.isAuthenticated()) {

      console.log(req)
      
      return next();
    }

    console.log('Please log in to continue');
    res.redirect('/login');
  }
  const allowIf = (req, res, next) =>{
    if (!req.isAuthenticated()) {
      
      return next()
    }
    res.redirect('/dashboard');      
  }
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      
      return next();
    }
    res.redirect('/login');
  }
  module.exports = {
      protectRoute,
      allowIf,
      ensureAuthenticated
    };