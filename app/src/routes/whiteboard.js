var express = require('express');
var router = express.Router();

/* GET home page. */

function whiteboard(req, res) {
  res.render('whiteboard');
}

router.get('/wb/:id', whiteboard);
router.get('/wb', whiteboard);
router.get('/', whiteboard);


module.exports = router;