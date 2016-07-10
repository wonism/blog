'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function (req, res, next) {
  res.render('photos/index', {
    req: req,
    title: 'Jaewonism',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s photo'.substring(0, 255),
    keyword: 'blog, photo, instagram, 블록, 사진, 인스타그램, jaewonism',
    userId: req.user ? req.user.user_id : null
  });
});

module.exports = router;