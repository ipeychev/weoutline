var express = require('express');
var router = express.Router();

router.get('/sign-in', function(req, res) {
  res.render('user/sign-in');
});

router.get('/profile', function(req, res) {
  res.render('user/profile');
});

router.get('/sign-up', function(req, res) {
  res.render('user/sign-up');
});

router.get('/reset', function(req, res) {
  res.render('user/reset');
});

module.exports = router;