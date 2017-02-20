// Get gravatar icon from email
var gravatar = require('gravatar');
// Get Comments Model
var Comments = require('../models/comments');

// List Comments
exports.list = function(req, res) {
  // List all Comments & Sort By Database
  Comments.find().sort('-created').populate('user', 'local.email').exec(function(error, comments) {
    if (error) {
      return res.send(400, {
        message: error
      });
    }
  // Render Result
    res.render('comments', {
      title: 'Comments Page',
      comments: comments,
      gravatar: gravatar.url(comments.email, {s: '80', r: 'x', d: 'retro'}, true)
    });
  });
};

// Create Comments
exports.create = function(req, res) {
  // Create New Instance of Comment Model with Request Body
  var comments = new Comments(req.body);
  // Set Current User (id)
  comments.user = req.user;
  // Save Data Received
  comments.save(function(error) {
    if (error) {
      return res.send(400, {
        message: error
      });
    }
    // Redirect To Comments
    res.redirect('/comments');
  });
};

// Comments Authorisation Middleware
exports.hasAuthorization = function(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
