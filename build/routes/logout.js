'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// Form to Login
router.get('/', function (req, res, next) {
  req.logout();
  return res.redirect('/');
});

module.exports = router;