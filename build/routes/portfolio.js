'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function (req, res, next) {
  res.render('portfolio/index', {
    req: req,
    title: 'Jaewonism',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/portfolio/goodoc.png',
    description: '포트폴리오 리스트입니다. 굿닥, Easy-map.js, Image-preview.js, Ciceron 등의 웹 페이지 및 오픈소스 개발을 하였습니다. Ruby on Rails, Node JS, Swift 에 관심이 많습니다.'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails, swift',
    userId: req.user ? req.user.user_id : null
  });
});

router.get('/goodoc', function (req, res, next) {
  res.render('portfolio/goodoc', {
    req: req,
    title: 'Jaewonism',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/portfolio/goodoc.png',
    description: 'Ruby on Rails 기반이며, Front-end 와 Back-end 개발을 담당하였습니다.'.substring(0, 255),
    keyword: 'portfolio, Front End, Goodoc, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Ruby on Rails, 굿닥',
    userId: req.user ? req.user.user_id : null
  });
});

router.get('/map', function (req, res, next) {
  res.render('portfolio/map', {
    req: req,
    title: 'Jaewonism',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/portfolio/map.png',
    description: 'Java Script 로 만들어진 구글맵 Open Source 입니다.'.substring(0, 255),
    keyword: 'portfolio, Front End, Google Map, Open Source, 포트폴리오, 웹개발자, Java Script, 구글맵, 오픈소스',
    userId: req.user ? req.user.user_id : null
  });
});

router.get('/ciceron', function (req, res, next) {
  res.render('portfolio/ciceron', {
    req: req,
    title: 'Jaewonism',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/portfolio/ciceron.png',
    description: 'Jaewonism\'s portfolio'.substring(0, 255),
    keyword: 'portfolio, Front End, Ciceron, 포트폴리오, 웹개발자, 프론트엔드, Java Script, 씨세른',
    userId: req.user ? req.user.user_id : null
  });
});

router.get('/preview', function (req, res, next) {
  res.render('portfolio/preview', {
    req: req,
    title: 'Jaewonism',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/portfolio/preview.png',
    description: '이미지 업로드 시 유효성 검사, 미리보기 기능 등을 제공하는 Java Script Open Source 입니다.'.substring(0, 255),
    keyword: 'portfolio, Front End, Image Upload, Open Source, 포트폴리오, 웹개발자, Java Script, 오픈소스',
    userId: req.user ? req.user.user_id : null
  });
});

module.exports = router;