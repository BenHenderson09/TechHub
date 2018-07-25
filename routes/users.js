const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const passport = require('passport');


//Bring in the User Schema
const User = require('../models/user');

//Start Registration Page
router.get('/register', (req,res)=>{
    res.render('user_register');
});

//Start Login Page
router.get('/login', (req,res)=>{
    res.render('user_login',{
        loginMsg:null
    });
});

//Messages Route, starts on user login
router.get('/login/:msg', (req,res)=>{
    var msg = JSON.parse(req.params.msg);
    res.render('user_login',{
        loginMsg: msg
    });
});

//Posting registration data
router.post('/register', (req,res)=>{


const username = req.body.Username;
const fullname = req.body.Fullname;
const email = req.body.Email;
const password = req.body.Password;
const password2 = req.body.Password2;

 //Validating Form Input
 req.checkBody('Fullname',"Fullname is required.").notEmpty();
 req.checkBody('Fullname',"Fullname must be under 100 characters.").isLength({max:100});

 req.checkBody('Username',"Username must be less than 100 characters.").isLength({ max:100 });
 req.checkBody('Username',"Username must be at least 5 characters.").isLength({ min:5 });

 req.checkBody('Email',"Email is required.").notEmpty();
 req.checkBody('Email',"Email must be less than 100 characters.").isLength({max:100});
 req.checkBody('Email',"Email must be valid.").isLength({min:5});


 req.checkBody('Password',"Password is required.").notEmpty();
 req.checkBody('Password',"Password must be less than 100 characters.").isLength({max:100});
 req.checkBody('Password',"Password must be at least 5 characters.").isLength({min:5});

 req.checkBody('Password2',"Password resubmit is required for validation.").notEmpty();
 req.checkBody('Password2',"Passwords must match").equals(req.body.Password);
 var errors = req.validationErrors();

 if(errors){
     res.render('user_register',{
         regErrors: errors
     });
 }else{
     //User is our schema
    var newUser = new User({
        fullname:fullname,
        username:username,
        password:password,
        email:email
    });

    //Password Encryption
    bcrypt.genSalt(10, (err,salt)=>{
        if(err){ console.log(err); res.redirect('/error');}
        bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err){ console.log(err);res.redirect('/error');}
            newUser.password = hash;
            newUser.save((err)=>{
                if(err){console.log(err);res.redirect('/error');}else{
                    res.redirect('/users/login/{"msg":"Account Registered, Please Log In", "type":"success"}');
                }
            });
        });
    });
 }

});


// Logging in
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/home/{ "msg":"Login Successful", "type":"success" }',
      failureRedirect:'/users/login'
    })(req, res, next);
  });

//Logging Out
router.get('/logout', (req,res)=>{
    req.logout();
    res.redirect('/home/{ "msg":"Logout Successful", "type":"success" }');
});

module.exports = router;