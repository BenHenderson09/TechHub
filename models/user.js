const mongoose = require('mongoose');

//User Schema
var userSchema = mongoose.Schema({
   
    fullname:{
        required: true,
        type: String
    },

    username:{
        required: true,
        type: String
    },
    
    password:{
        required: true,
        type: String
    },
    
    email:{
        required: true,
        type: String
    }
});
var User = module.exports = mongoose.model('User',userSchema);