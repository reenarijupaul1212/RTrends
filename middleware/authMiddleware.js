0// authMiddleware.js
const isAuthenticated = (req, res, next) => {
  // Passport adds the "isAuthenticated" method to the request object
  if (req.isAuthenticated()) {
    // If the user is authenticated, redirect them to the dashboard or another pageconsole.log("hai");
   
    return res.redirect('/dashboard');
    
  }// If not authenticated, allow them to proceed to the next middleware
    
  return next();
};

const isUserAuthenticated = (req, res, next) => {
    // Passport adds the "isAuthenticated" method to the request object
    if (req.isAuthenticated() && req.user.role=='user'&& req.user.userStatus==true ) {
      // If the user is authenticated, redirect them to the dashboard or another pageconsole.log("hai");
    
      return next()
      
    }
    // If not authenticated, allow them to proceed to the next middleware
    console.log('not loginannnnnnnnnnnnnn');
    req.logout((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      // Redirect to a different route after logout (e.g., home page)
      return res.redirect('/login');
    });

  };
  const isAdminAuthenticated = (req, res, next) => {
    // Passport adds the "isAuthenticated" method to the request object
    if (req.isAuthenticated() && req.user.role=='admin') {
      // If the user is authenticated, redirect them to the dashboard or another page
     
      return next()
      
    }
    // If not authenticated, allow them to proceed to the next middleware
    
    return res.redirect('/login');
  };
  
  module.exports = { isUserAuthenticated,isAdminAuthenticated,isAuthenticated };
  