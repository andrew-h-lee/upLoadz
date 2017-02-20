// Show Home Screen
exports.show = function(req, res) {
  // Render Home Screen
  res.render('index', {
    title: 'Multimedia App',
    callToAction: 'Upload & Manipulate Files with NodeJS'
  });
};
