//Settting up Passport Auth
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../models/user');
const config        = require('../config/database');
const bcrypt        = require('bcryptjs');

module.exports = (passport)=>{
    //Local Strategy Setup
    passport.use(new LocalStrategy({

        usernameField: 'email',
        passwordField: 'password'

    },function(email, password, done) {
          User.findOne({email:email}, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: 'Incorrect Credentials.' });
            }

            //Ensure correct password
            bcrypt.compare(password, user.password, (err, matched)=>{
                if(err){throw err;}
                if(matched){
                    return done(null,user);
                }else{
                    return done(null, false, { message: 'Incorrect Credentials.' });
                }
            });
        });
    }));

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id); 
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

}