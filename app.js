const  express = require('express');
const app = express();
const path = require('path');
var cors = require('cors')
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const ejs = require('ejs');
const session = require('express-session');
const flash = require("connect-flash");
const passport=require('passport');
const {loginCheck}=require('./auth/passport');
require('dotenv').config();
// Mongo DB conncetion
var database = "mongodb+srv://reenarijupaul1212:123456Reena@cluster0.oltgmmp.mongodb.net/Rtrends?retryWrites=true&w=majority";
mongoose.connect(database)
.then(() => console.log('RTrend DB connect'))
.catch(err => console.log(err));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(cors());
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());

app.use(express.urlencoded({extended:true}));
app.use(express.json());
// Set up Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(flash());
loginCheck(passport);
app.use((req, res, next) => {
  // Set cache-control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});

const user = require('./routes/userRoute');
const admin = require('./routes/adminRoute');
const errorHandler = require('./middleware/errorHandleling');
const { dashboardView } = require('./controllers/dashboardController');

app.use('/', user);
app.use('/admin',admin);
app.get('/dashboard',dashboardView);
app.use('/*',errorHandler.userPageNotFound);
//app.use('/admin/*',errorHandler.adminPageNotFound);
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



