var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'WeOutline, a shared whiteboard, designed to work among teams'
  });
});

module.exports = router;