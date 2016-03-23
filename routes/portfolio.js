var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('portfolio/index', { req: req, title: 'Jaewonism', userId: req.session.u5er });
});

module.exports = router;

