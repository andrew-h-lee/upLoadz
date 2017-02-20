var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Import Multer
var multer = require('multer');
var upload = multer({ dest:'./public/uploads/', limits: {fileSize: 1000000, files:1} });

// Import Home Controller
var index = require('./server/controllers/index');
// Import Login Controller
var auth = require('./server/controllers/auth');
// Import Comments Controller
var comments = require('./server/controllers/comments');
// Import Images Controller
var images = require('./server/controllers/images');
// Import Videos Controller
var videos = require('./server/controllers/videos');

// ORM with Mongoose
var mongoose = require('mongoose');
// Modules to store session
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// Import Passport & Warning Flash Modules
var passport = require('passport');
var flash = require('connect-flash');
// Start Express App
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

//DataBase Configuration
var config = require('./server/config/config.js');
// Connect to DataBase
mongoose.connect(config.url);
// Check if MongoDB is running
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Check if MongoDB is running.');
});
// Passport configuration
require('./server/config/passport')(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
//  Public Directory
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
// secret for session
app.use(session({
    secret: 'sometextgohere',
    saveUninitialized: true,
    resave: true,
    //store session on MongoDB using express-session + connect mongo
    store: new MongoStore({
        url: config.url,
        collection : 'sessions'
    })
}));

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages
app.use(flash());

// Application Routes
// Index Route
app.get('/', index.show);
app.get('/login', auth.signin);
app.post('/login', passport.authenticate('local-login', {
  // Success goto Profile Page / Fail goto Login page
  successRedirect : '/profile',
  failureRedirect : '/login',
  failureFlash : true
}));
app.get('/signup', auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
  // Success goto Profile Page / Fail goto Signup page
  successRedirect : '/profile',
  failureRedirect : '/signup',
  failureFlash : true
}));

app.get('/profile', auth.isLoggedIn, auth.profile);
// Logout Page
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Setup Routes for Comments
app.get('/comments', comments.hasAuthorization, comments.list);
app.post('/comments', comments.hasAuthorization, comments.create);

// Setup Routes for Images
app.get('/images-gallery', images.hasAuthorization, images.show);
app.post('/images', images.hasAuthorization, upload.single('image'), images.uploadImage);

// Setup Routes for Videos
app.get('/videos', videos.hasAuthorization, videos.show);
app.post('/videos', videos.hasAuthorization, upload.single('video'), videos.uploadVideo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.set('port', process.env.PORT || 5000);

var server = app.listen(app.get('port'), function() {
  console.log('Express Server listening on port ' + server.address().port);
});
