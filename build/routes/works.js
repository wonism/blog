'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// import models from '../../models';

router.get('/', function (req, res, next) {
    return res.redirect('/works/selfie');
    /*
    return res.render('works/selfie_with_js', {
        title: 'Jaewonism',
        asset: 'works',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        endPoint: 'root'
    });
    */
});

router.get('/selfie', function (req, res, next) {
    return res.render('works/selfie_with_js', {
        title: 'Jaewonism',
        asset: 'selfie',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        endPoint: 'root'
    });
});

module.exports = router;