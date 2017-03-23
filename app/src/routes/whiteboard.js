let express = require('express');
let routeMap = require('../routes/route-map');

let router = express.Router();

/* GET home page. */

function whiteboard(req, res) {
  res.render('whiteboard');
}

router.get(routeMap.whiteboard + '/:id', whiteboard);
router.get(routeMap.whiteboard, whiteboard);
router.get('/', whiteboard);


module.exports = router;