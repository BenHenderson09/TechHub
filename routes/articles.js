const express  = require('express');
const router   = express.Router();
const fs       = require('fs');
const path     = require('path');
const bp       = require('body-parser');
const app      = express();
const multer   = require('multer');
//--- Bringing in models for database ---
var Article = require('../models/article');
var User    = require('../models/user');
//---------------------------------------

//Setting up multer
const filter  = (req,file,callback)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        //Allows Storage
        callback(null,true);
    }else{
        //Doesn't Allow Storage
        callback(null,false);
    }
}
const storage = multer.diskStorage({
    destination: (req,file,callback)=>{
        callback(null, './covers/');
    },
    filename: (req,file,callback)=>{
        callback(null, new Date().toISOString().replace(/:/g, '-')+file.originalname);
    }
});
const upload   = multer({storage:storage, limits:{
    //only accepts files of under 5mb
    fileSize: 1024*1024*5
},
fileFilter:filter
});

//Setting up body-parser
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

//View Article Route
router.get('/view/:id', (req,res)=>{
 Article.findOne({'_id': req.params.id}, (err,article)=>{
    User.findOne({'_id':article.author}, (err,user)=>{
        if(err){res.redirect('/error'); console.log(err);}else{

             res.render('view_article',{
                article:article,
                author:user.username
             });

         }
    });
 });
});

//Edit Article Route
router.get('/edit/:id',checkUserLoggedIn, (req,res)=>{
    
    var user = req.user._id;
    var genres = [];
    Article.findOne({'_id': req.params.id},(err,article)=>{
        var author = article.author;
        if(author == user){
            article.genre.forEach(function(genre){
                genres.push(genre.name);
            });
        }else{
            res.redirect('/users/login/{"msg":"Unauthorized Entry", "type":"danger"}');
        }
    });


    Article.findOne({'_id': req.params.id}, (err,article)=>{
        User.findOne({'_id':article.author}, (err,user)=>{
            if(err){res.redirect('/error'); console.log(err);}else{
                    res.render('edit_article',{
                        article:article,
                        author:user.username,
                        genres: genres
                    });
                }
             });
        });
    });


//Getting the edit article changes and submitting them to database
router.post('/edit/submit/:id', upload.single('img'), (req,res)=>{
     //Validating Form Input
     req.checkBody('title',"Title is required.").notEmpty();
     req.checkBody('title',"Title must be less than 100 characters.").isLength({ max:100 });
     req.checkBody('body',"Body is required.").notEmpty();
     var errors = req.validationErrors();

     if(errors){
        Article.findOne({'_id': req.params.id}, (err,article)=>{
            if(err){
                res.redirect('/error');
                console.log(err);
            }else{
            res.render('edit_article',{
                formErrors:errors,
                article:article
             });
            }
        });
    }else{

        const other_advice          = {status:req.body.other_advice, name:'Advice', color:'btn-dark'};
        const other_employment      = {status:req.body.other_employment, name:'Business/Employment', color:'btn-dark'};
        const other_education       = {status:req.body.other_education, name:'Education', color:'btn-dark'};
        
        const robotics_hp           = {status:req.body.robotics_hp, name:'Hobby Robotics Projects', color:'btn-info'};
        const robotics_rd           = {status:req.body.robotics_rd, name:'Robotics Developments', color:'btn-warning'};
        const robotics_irl          = {status:req.body.robotics_irl, name:'Robotics in Industry', color:'btn-danger'};

        const science_maths         = {status:req.body.science_maths, name:'Mathematics', color:'btn-primary'};
        const science_rd            = {status:req.body.science_rd, name:'Recent Data Science Developments', color:'btn-danger'};
        const science_ml            = {status:req.body.science_ml, name:'Machine Learning', color:'btn-info'};

        const programming_web       = {status:req.body.programming_web, name:'Web Development', color:'btn-secondary'};
        const programming_mobile    = {status:req.body.programming_mobile, name:'Mobile Development', color:'btn-success'};
        const programming_desktop   = {status:req.body.programming_desktop, name:'Software Development', color:'btn-primary'};

        const initialArr = [
            other_advice, other_employment, other_education,
            robotics_hp, robotics_rd, robotics_irl,
            science_maths, science_rd, science_ml,
            programming_web, programming_mobile, programming_desktop
        ]

        var filteredArr = [];

        initialArr.forEach((item)=>{
            if(item.status == 'on'){
                filteredArr.push({name: item.name, color:item.color});
            }
        });

        var article = {};
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.genre  = filteredArr;

        if(req.file){
            var image   = req.file.path;
            var imgSave = image.replace("covers", "");
            article.image = imgSave;
        }

        var id = req.params.id;
        Article.update({ _id: id },article,(err)=>{
            if(err){
                res.redirect('/error');
                console.log(err);
            }else{
            res.redirect('/home/{"msg":"Post Updated Successfully", "type":"success"}');
            }
        });
    }

});

//Add Article Route
router.get('/add',checkUserLoggedIn, (req,res)=>{
    res.render('add_article');
});

//Getting add article data and inserting into database
router.post('/add/submit', upload.single('img'), (req,res)=>{   
    
    //Validating Form Input
    req.checkBody('title',"Title is required.").notEmpty();
    req.checkBody('title',"Title must be less than 100 characters.").isLength({ max:100 });
    req.checkBody('body',"Body is required.").notEmpty();
    var errors = req.validationErrors();

    if(errors){
        res.render('add_article',{
           formErrors:errors 
        });
    }else{
        const other_advice          = {status:req.body.other_advice, name:'Advice', color:'btn-dark'};
        const other_employment      = {status:req.body.other_employment, name:'Employment', color:'btn-dark'};
        const other_education       = {status:req.body.other_education, name:'Education', color:'btn-dark'};
        
        const robotics_hp           = {status:req.body.robotics_hp, name:'Hobby Robotics Projects', color:'btn-info'};
        const robotics_rd           = {status:req.body.robotics_rd, name:'Robotics Developments', color:'btn-warning'};
        const robotics_irl          = {status:req.body.robotics_irl, name:'Robotics in Industry', color:'btn-danger'};

        const science_maths         = {status:req.body.science_maths, name:'Mathematics', color:'btn-primary'};
        const science_rd            = {status:req.body.science_rd, name:'Recent Data Science Discoveries', color:'btn-danger'};
        const science_ml            = {status:req.body.science_ml, name:'Machine Learning', color:'btn-info'};

        const programming_web       = {status:req.body.programming_web, name:'Web Development', color:'btn-secondary'};
        const programming_mobile    = {status:req.body.programming_mobile, name:'Mobile Development', color:'btn-success'};
        const programming_desktop   = {status:req.body.programming_desktop, name:'Softwarwe Development', color:'btn-primary'};

        const initialArr = [
            other_advice, other_employment, other_education,
            robotics_hp, robotics_rd, robotics_irl,
            science_maths, science_rd, science_ml,
            programming_web, programming_mobile, programming_desktop
        ]

        var filteredArr = [];

        initialArr.forEach((item)=>{
            if(item.status == 'on'){
                filteredArr.push({name: item.name, color:item.color});
            }
        });

        //Article is our model defined earlier
        var article = new Article();
        article.title = req.body.title;
        article.body = req.body.body;
        article.author = req.user._id;
        article.genre  = filteredArr;
        
        if(req.file){
            var image   = req.file.path;
            var imgSave = image.replace("covers", "");
            article.image = imgSave;
        }else{
            article.image = '\\default.png';
        }

        article.save((err)=>{
            if(err){
            res.redirect('/error');
            console.log(err);
            }else{
                res.redirect('/home/{ "msg":"Article Added Successfully", "type":"success" }');
            }
        });
    }
});

//Deleting an Article
router.delete('/delete/:id',checkUserLoggedIn,(req,res)=>{
    //Because of Ajax this stuff is done differently
    
    //If the server can't find the users id (logged in) send error code
    if(!req.user._id){
        res.status(500).send();
        res.redirect('/users/login/{"msg":"User Must be Authenticated", "type":"danger"}');
    }
    var id = req.params.id;

    Article.findOne({'_id':id},(err,article)=>{
        if(article.author != req.user._id){
            res.status(500).send();
            res.redirect('/users/login/{"msg":"Unauthorized Entry", "type":"danger"}');
        }else{

            if(article.image !== '\\default.png'){
            fs.unlink('covers' + article.image, (err) => {
                if (err) res.redirect('/error');
              });
            }
              
            Article.deleteOne({ '_id': id }, (err)=> {
                if (err){
                    res.redirect('/error');
                    console.log(err);
                }else{
                    res.redirect('/');
                }
              });
        }
    });
});

//Controlling Access to Articles
function checkUserLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        //next means to move on
        return next();
    }else{
        res.redirect('/users/login/{"msg":"User Must be Authenticated", "type":"danger"}');
    }
}
module.exports = router;