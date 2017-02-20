// Import Modules
var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');
// GET Video Model
var Videos = require('../models/videos');
// Set Video File Types
var VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/ogg', 'video/webm'];

// List Videos
exports.show = function (req, res) {
  Videos.find().sort('-created').populate('user', 'local.email').exec(function(error, videos) {
    if (error) {
      return res.status(400).send({
        message: error
      });
    }
  // Render Result
  console.log(videos);
    res.render('videos', {
      title: 'Videos Page',
      videos: videos,
      gravatar: gravatar.url(videos.email, {s: '80', r: 'x', d: 'retro'}, true)
    });
  });
};

// Create Videos
exports.uploadVideo = function (req, res) {
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
  if (VIDEO_TYPES.indexOf (type) == -1) {
    return res.status(415).send('Supported Video Formats: mp4, avi, ogg.');
  }
  // SET New path to Videos
  targetPath = './public/videos' + req.file.originalname;
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
    // Create New Instance of Video Model with request body
    var video = new Videos(req.body);
    // Set Image file name
    video.videoName = req.file.originalname;
    // Set Current user (id)
    video.user = req.user;
    // Save Data Received
    video.save(function(error) {
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
      res.redirect('videos');
    });
  });
};

// Videos Authorisation Middleware
exports.hasAuthorization = function(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
