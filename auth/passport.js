const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const User = require('../models/userModel');
const { response,req} = require("express");
const flash = require('connect-flash');
//const flash = require("express-flash");

const loginCheck = (passport) => {
  passport.use(
      new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
          // Check user
          User.findOne({ email: email })
              .then((user) => {
                  if (!user) {
                      console.log("Incorrect email");
                      return done(null, false,{ message: 'Incorrect email' });
                  }

                  // Match Password
                  bcrypt.compare(password, user.password, (error, isMatch) => {
                      if (error) {
                          console.error("Error comparing passwords:", error);
                          return done(error);
                      }

                      if (isMatch) {
                          if (user.role === 'admin') {
                              // If the user is an admin, fetch all users
                              User.find()
                                  .then((allUsers) => {
                                      return done(null, user); // Return admin user
                                  })
                                  .catch((error) => {
                                      console.error("Error fetching all users:", error);
                                      return done(error);
                                  });
                          } else {
                              // Check userStaus==true
                              if (user.userStatus) {
                                  return done(null, user);
                              } else {
                                  console.log('Account status blocked');
                                  return done(null, false, { message: "Account status blocked" });
                              }
                          }
                      } else {
                          console.log("Incorrect password");
                          return done(null, false,{message:"Incorrect password"});
                      }
                  });
              })
              .catch((error) => {
                  console.error("Error finding user:", error);
                  return done(error);
              });
      })
  );


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .exec()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        console.error("Error deserializing user:", err);
        done(message, null);
      });
  });
};

module.exports = {
  loginCheck,
};
