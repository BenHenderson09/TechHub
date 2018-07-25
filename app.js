const mongoose         = require('mongoose');
const expressValidator = require('express-validator');
const bodyParser       = require('body-parser');
const path             = require('path');
const express          = require('express');
const passport         = require('passport');
const config           = require('./config/database'); 
const cookieSession    = require('cookie-session');

//-------Module Configuration-----------------------------
const app       = express();
const portNum   = 3000;

//Setting up session
    app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  }));


//Setting up express-validator
app.use(expressValidator());

//Setting up body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Connecting to MongoDB. Note that infohub is our db name.
mongoose.connect(config.database);
var db = mongoose.connection;

//Check mongo connection
db.once('open', ()=>{
    console.log("Database Connection Established");
});

//Check for mongo errors
db.on('error', (err)=>{
console.log(err);
});

//Setting up passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//If user is logged in, set global var
app.use(function(req, res, next){
    if(req.isAuthenticated()){
        res.locals.user = req.user;
    }else{
    res.locals.user = null;
    }
    next();
  });
  

//Setting the view engine to pug
app.set('view engine','ejs');

//Setting Path to HTML docs
app.set('views', path.join(__dirname, 'views'));

//Setting the static path for js and css
app.use(express.static(path.join(__dirname, 'public')));

//Setting the path for cover images
app.use(express.static(path.join(__dirname, 'covers')));

//------------------------------------------------------

//--- Bringing in models for database ---
var Article = require('./models/article');
//---------------------------------------

// --- Global Variables ---
app.use((req,res,next)=>{
    res.locals.formErrors = null;
    next();
});

app.use((req,res,next)=>{
    res.locals.messages = null;
    next();
})

app.use((req,res,next)=>{
    res.locals.regErrors = null;
    next();
});

app.use((req,res,next)=>{
    res.locals.loginMsg = null;
    res.locals.indexMsg = null;
    next();
});
//------------------------------

//Default Route, called on start
app.get('/', (req,res)=>{
    //Article is our model, defined earlier
    //{} is for a query, but we want all the data
    Article.find({}, (err,articles) =>{
        if(err){
            res.redirect('/error');
            console.log(err);
        }
        else{
        const posts = articles.reverse(); 
        res.render('index', {
            articles: articles,
        });
        }
    });
});

//Home Messages Route, starts on index
app.get('/home/:msg', (req,res)=>{
    //Article is our model, defined earlier
    //{} is for a query, but we want all the data
    Article.find({}, (err,articles) =>{
        if(err){
            res.redirect('/error');
            console.log(err);
        }
        else{
        var msg = JSON.parse(req.params.msg);
        const posts = articles.reverse(); 
        res.render('index', {
            articles: posts,
            indexMsg: msg
        });
        }
    });
});

//Search Route
app.post('/search', (req, res)=>{
    var title = req.body.txtSearch;
    //Regex was only option for seatch, pretty much means if title contains search query
    Article.find({'title':{ "$regex": title, "$options": "i" }}, function (err, articles) {
        if(err) {
            console.log(err);
            return res.render('index', {articles: null});
        }
        const posts = articles.reverse(); 
        res.render('index', {articles: posts});
    });
});

//Filter Route
app.get('/filter/:genre', (req, res)=>{
    var genre = req.params.genre;
    const filtered = [];
    
        Article.find({}, function (err, articles) {
        if(err) {
            console.log(err);
            return res.render('index', {articles: null});
        }else{

        articles.forEach((article)=>{
            article.genre.forEach((articleGenre)=>{
                if(genre == articleGenre.name){
                    filtered.push(article);
                }
            });
        });
        console.log(filtered);
            const posts = filtered.reverse(); 
        res.render('index', {articles: posts});
    }
    });
});

//Error Page Route
app.get('/error', (req,res)=>{
    res.render('error');
});

// ------ External Routes -------------
//Article Route Files
const articles = require('./routes/articles');
app.use('/articles', articles);

//User Route Files
const users = require('./routes/users');
app.use('/users', users);
//-------------------------------------

//------- Navbar Rotes ----------------
//about
app.get('/about', (req,res)=>{
    res.render('about');
});

//services
app.get('/services', (req,res)=>{
    res.render('services');
});

//dashboard
app.get('/dashboard',checkUserLoggedIn, (req,res)=>{
    var count = 0;
    Article.find({'author':req.user._id},(err,article)=>{
        if(err){console.log(err); res.redirect('/error')}else{
            article.forEach((article)=>{
                count++;
            });
            res.render('dashboard',{
            postcount:count,
            articles:article
    });
        }
    });
});
//------------------------------------

function checkUserLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        //next means to move on
        return next();
    }else{
        res.redirect('/users/login/{"msg":"User Must be Authenticated", "type":"danger"}');
    }
}

//setting our server to listen on our port number
app.listen(portNum, ()=>{
    console.log('Listening on Port: ' + portNum);
});
