let express = require('express');
let routeMap = require('../routes/route-map');

let router = express.Router();

let stripUser = (path) => {
  return path.substring(5); // '/user'.length
};

router.get(stripUser(routeMap.signIn), function(req, res) {
  res.render('user/sign-in');
});

router.get(stripUser(routeMap.profile), function(req, res) {
  res.render('user/profile');
});

router.get(stripUser(routeMap.signUp), function(req, res) {
  res.render('user/sign-up');
});

router.get(stripUser(routeMap.reset), function(req, res) {
  res.render('user/reset');
});

module.exports = router;