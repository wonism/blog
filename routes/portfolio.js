var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('portfolio/index', { req: req, title: 'Jaewonism', userId: req.user ? req.user.user_id : null });
});

router.get('/goodoc', function (req, res, next) {
  res.render('portfolio/goodoc', { req: req, title: 'Jaewonism', userId: req.user ? req.user.user_id : null });
});

module.exports = router;

