'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _models = require('../../db/models');

var _models2 = _interopRequireDefault(_models);

var _collections = require('../../db/collections');

var _collections2 = _interopRequireDefault(_collections);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _passportFacebook = require('passport-facebook');

var _passportFacebook2 = _interopRequireDefault(_passportFacebook);

var _passportTwitter = require('passport-twitter');

var _passportTwitter2 = _interopRequireDefault(_passportTwitter);

var _passportGoogleOauth = require('passport-google-oauth');

var _passportGoogleOauth2 = _interopRequireDefault(_passportGoogleOauth);

var _passportKakao = require('passport-kakao');

var _passportKakao2 = _interopRequireDefault(_passportKakao);

var _passportNaver = require('passport-naver');

var _passportNaver2 = _interopRequireDefault(_passportNaver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var LocalStrategy = _passportLocal2.default.Strategy;
var FacebookStrategy = _passportFacebook2.default.Strategy;
var TwitterStrategy = _passportTwitter2.default.Strategy;
var GoogleStrategy = _passportGoogleOauth2.default.OAuth2Strategy;
var KakaoStrategy = _passportKakao2.default.Strategy;
var NaverStrategy = _passportNaver2.default.Strategy;

var refer = '/';

// Form to Login
router.get('/', function (req, res, next) {
  refer = req.headers.referer;
  var flash = req.flash('auth');
  flash = flash.length ? flash : req.flash('error');
  res.render('login/index', {
    req: req,
    title: '로그인',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null,
    authFlash: flash,
    failed: false
  });
});

router.post('/', _passport2.default.authenticate('local', { successRedirect: refer, failureRedirect: '/login', failureFlash: true }));

_passport2.default.use(new LocalStrategy({
  usernameField: 'user_id',
  passwordField: 'password'
}, function (user_id, password, done) {
  _models2.default.User.forge({ user_id: user_id }).fetch().then(function (user) {
    if (user) {
      _bcrypt2.default.compare(password, user.toJSON().password, function (err, success) {
        if (success) {
          return done(null, { id: user.id });
        } else {
          return done(null, false, { message: 'ID 혹은 비밀번호가 잘못되었습니다.' });
        }
      });
    } else {
      return done(null, false, { message: 'ID 혹은 비밀번호가 잘못되었습니다.' });
    }
  }).catch(function (err) {
    return done(err, null);
  });
}));

_passport2.default.serializeUser(function (user, done) {
  return done(null, user);
});

_passport2.default.deserializeUser(function (user, done) {
  _models2.default.User.forge({ id: user.id }).fetch().then(function (user) {
    return done(null, user.toJSON());
  }).catch(function (err) {
    return done(err);
  });
});

module.exports = router;