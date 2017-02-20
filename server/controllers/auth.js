// GET Gravatar icon from email
var gravatar = require('gravatar');
var passport = require('passport');

// Signin GET
exports.signin = function(req, res) {
    // List all Users & Sort Date
    res.render('login', { title: 'Login Page', message: req.flash('loginMessage') });
};

// Signup GET
exports.signup = function(req, res) {
    // List all Users & Sort Date
    res.render('signup', { title: 'Signup Page', message: req.flash('signupMessage') });
};

// Profile GET
exports.profile = function(req, res) {
    // List all Users & Sort Date
    res.render('profile', { title: 'Profile Page', user : req.user, avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'retro'}, true) });
};

// Logout function
exports.logout = function () {
    req.logout();
    res.redirect('/');
};

// Check if User is Logged In
exports.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
