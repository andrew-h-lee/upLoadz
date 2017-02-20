// Import Modules
var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');
// GET Image Model
var Images = require('../models/images');
// Set Image File Types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Show Images Gallery
exports.show = function (req, res) {
  Images.find().sort('-created').populate('user', 'local.email').exec(function(error, images) {
    if (error) {
      return res.status(400).send({
        message: error
      });
    }
  // Render Gallery
    res.render('images-gallery', {
      title: 'Images Gallery',
      images: images,
      gravatar: gravatar.url(images.email, {s: '80', r: 'x', d: 'retro'}, true)
    });
  });
};

// Image Upload
exports.uploadImage = function (req, res) {
  var src;
  var dest;
  var targetPath;
  var targetName;
  var tempPath = req.file.path;
  console.log(req.file);
  // GET mime type of file
  var type = mime.lookup(req.file.mimetype);
  // GET File Extension
  var extension = req.file.path.split(/[. ]+/).pop();
  // Check file support types
  if (IMAGE_TYPES.indexOf (type) == -1) {
    return res.status(415).send('Supported Image Formats: jpeg, jpg, png.');
  }
  // SET New path to Images
  targetPath = './public/images' + req.file.originalname;
  // Use read stream API to read file
  src = fs.createReadStream(tempPath);
  // Use write stream API to write file
  dest = fs.createWriteStream(tempPath);
  src.pipe(dest);

  // Show error
  src.on('error', function(err) {
    if (err) {
      return res.status(500).send({
        mesage: error
      });
    }
  });
  // Save File process
  src.on('end', function() {
    // Create New Instance of Image Model with request body
    var image = new Images(req.body);
    // Set Image file name
    image.imageName = req.file.originalname;
    // Set Current user (id)
    image.user = req.user;
    // Save Data Received
    image.save(function(error) {
      if (error) {
        return res.status(400).send({
          message: error
        });
      }
    });
    // Remove from Temp Folder
    fs.unlink(tempPath, function(err) {
      if (err) {
        return res.status(500).send('Wha, something bad happened');
      }
      // Redirect to Gallery's Page
      res.redirect('images-gallery');
    });
  });
};

// Images Authorisation Middleware
exports.hasAuthorization = function(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
