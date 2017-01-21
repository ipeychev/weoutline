var express = require('express');
var router = express.Router();

router.get('/sign-in', function(req, res, next) {
  res.render('user-sign-in');
});

router.get('/profile', function(req, res, next) {
  res.render('user-profile');
});

module.exports = router;