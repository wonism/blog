var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('photos/index', { req: req, title: 'Jaewonism', userId: req.user ? req.user.user_id : null });
});

module.exports = router;

