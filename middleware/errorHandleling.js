

module.exports={

userPageNotFound : (req, res, next) => {
message=req.flash();
    res.render('users/404.ejs',{user:req.user});


},

userErrorHandler : (err, req, res, next) => {

    console.log(err);

    res.render('users/error.ejs')


},
adminPageNotFound : (req, res, next) => {

    res.render('admin/404.ejs');


}
,
adminErrorHandler : (err, req, res, next) => {

    console.log(err);


    res.render('admin/error.ejs')


}
,
multerErrorHandler : (err, req, res, next) => {



    res.status(400).json({ "success": false, "message": "Img uploading Failed : wrong img type , Insert correct Img and try Again!" })

    return;





},


parsingErrorHandler : (error, req, res, next) => {
    if (error instanceof SyntaxError) {

        res.status(400).json({ error: 'Invalid JSON data' });

    } else {


        next(error);
    }
}}

