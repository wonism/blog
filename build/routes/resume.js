'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function (req, res, next) {
  return res.render('resume/index', {
    title: 'Jaewonism',
    asset: 'resume',
    mode: _config2.default.mode,
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/portfolio/goodoc.png',
    description: '굿닥, Easy-map.js, Image-preview.js, Ciceron 등의 웹 페이지 및 오픈소스 개발을 하였습니다. Ruby on Rails, Node JS, Swift 에 관심이 많습니다.'.substring(0, 255),
    keyword: 'resume, 이력서, portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails, swift',
    userId: req.user ? req.user.user_id : null
  });
});

module.exports = router;