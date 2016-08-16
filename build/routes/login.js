'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

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

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var LocalStrategy = _passportLocal2.default.Strategy;
var FacebookStrategy = _passportFacebook2.default.Strategy;
var TwitterStrategy = _passportTwitter2.default.Strategy;
var GoogleStrategy = _passportGoogleOauth2.default.OAuth2Strategy;
var KakaoStrategy = _passportKakao2.default.Strategy;
var NaverStrategy = _passportNaver2.default.Strategy;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

// Form to Login
router.get('/', function (req, res, next) {
  var flash = req.flash('auth');
  flash = flash.length ? flash : req.flash('error');
  return res.render('login/index', {
    title: '로그인',
    asset: 'login',
    mode: _config2.default.mode,
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null,
    authFlash: flash,
    failed: false
  });
});

router.post('/', _passport2.default.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }));

router.get('/oauth/facebook', _passport2.default.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/oauth/facebook/callback', _passport2.default.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/twitter', _passport2.default.authenticate('twitter'));

router.get('/oauth/twitter/callback', _passport2.default.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/google', _passport2.default.authenticate('google', {
  scope: ['openid', 'email']
}));

router.get('/oauth/google/callback', _passport2.default.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/kakao', _passport2.default.authenticate('kakao'));

router.get('/oauth/kakao/callback', _passport2.default.authenticate('kakao', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/naver', _passport2.default.authenticate('naver'));

router.get('/oauth/naver/callback', _passport2.default.authenticate('naver', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/failed', ensureAuthenticated, function (req, res) {
  return res.send('failed');
});

_passport2.default.use(new LocalStrategy({
  usernameField: 'user_id',
  passwordField: 'password'
}, function (user_id, password, done) {
  _models2.default.users.find({
    where: { user_id: user_id }
  }).then(function (user) {
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

_passport2.default.use(new FacebookStrategy({
  clientID: _config2.default.oauth.facebook.id,
  clientSecret: _config2.default.oauth.facebook.secret,
  callbackURL: _config2.default.oauth.facebook.callbackurl,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var profileJson = profile._json;

    _models2.default.users.find({
      where: { email: profileJson.email }
    }).then(function (user) {
      if (user) {
        return done(null, user);
      } else {
        (function () {
          var user_id = profileJson.id + '@facebook.com';
          var email = profileJson.email || profileJson.id + '@facebook.com';
          var name = profileJson.name;
          var image = profileJson.picture.data.url;
          _bcrypt2.default.genSalt(8, function (err, salt) {
            var password = salt;
            _bcrypt2.default.hash(password, salt, function (err, hash) {
              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
              password = hash;

              _models2.default.users.create({
                user_id: user_id,
                name: name,
                email: email,
                password: password,
                salt: salt,
                access_token: accessToken,
                refresh_token: refreshToken,
                level: 9,
                from: 'facebook',
                image: image,
                created_at: dateStr,
                updated_at: dateStr
              }).then(function (user) {
                return done(null, user);
              }).catch(function (err) {
                return done(err, null);
              });
            });
          });
        })();
      }
    }).catch(function (err) {
      return done(err, null);
    });
  });
}));

_passport2.default.use(new TwitterStrategy({
  consumerKey: _config2.default.oauth.twitter.consumerkey,
  consumerSecret: _config2.default.oauth.twitter.consumersecret,
  callbackURL: _config2.default.oauth.twitter.callbackurl
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var profileJson = profile._json;

    _models2.default.users.find({
      where: { email: profileJson.id_str + '@twitter.com' }
    }).then(function (user) {
      if (user) {
        return done(null, user);
      } else {
        (function () {
          var user_id = profileJson.id_str + '@twitter.com';
          var email = profileJson.id_str + '@twitter.com';
          var name = profileJson.name;
          var image = profileJson.profile_image_url.replace(/$https?/, '').replace(/normal.jpg$/, '400x400.jpg');
          _bcrypt2.default.genSalt(8, function (err, salt) {
            var password = salt;
            _bcrypt2.default.hash(password, salt, function (err, hash) {
              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
              password = hash;

              _models2.default.users.create({
                user_id: user_id,
                name: name,
                email: email,
                password: password,
                salt: salt,
                access_token: accessToken,
                refresh_token: refreshToken,
                level: 9,
                from: 'twitter',
                image: image,
                created_at: dateStr,
                updated_at: dateStr
              }).then(function (user) {
                return done(null, user);
              }).catch(function (err) {
                return done(err, null);
              });
            });
          });
        })();
      }
    }).catch(function (err) {
      return done(err, null);
    });
  });
}));

_passport2.default.use(new GoogleStrategy({
  clientID: _config2.default.oauth.google.clientid,
  clientSecret: _config2.default.oauth.google.clientsecret,
  callbackURL: _config2.default.oauth.google.callbackurl
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var profileJson = profile._json;

    _models2.default.users.find({
      where: { email: profileJson.emails.length ? profileJson.emails[0].value : profileJson.id + '@googleplus.com' }
    }).then(function (user) {
      if (user) {
        return done(null, user);
      } else {
        (function () {
          var user_id = profileJson.id + '@googleplus.com';
          var email = profileJson.emails.length ? profileJson.emails[0].value : profileJson.id + '@googleplus.com';
          var name = profileJson.displayName;
          var image = profileJson.image.isDefault ? '' : profileJson.image.url.replace(/$https?/, '').replace(/\?sz=\d{1,}$/, '');
          _bcrypt2.default.genSalt(8, function (err, salt) {
            var password = salt;
            _bcrypt2.default.hash(password, salt, function (err, hash) {
              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
              password = hash;

              _models2.default.users.create({
                user_id: user_id,
                name: name,
                email: email,
                password: password,
                salt: salt,
                access_token: accessToken,
                refresh_token: refreshToken,
                level: 9,
                from: 'google',
                image: image,
                created_at: dateStr,
                updated_at: dateStr
              }).then(function (user) {
                return done(null, user);
              }).catch(function (err) {
                return done(err, null);
              });
            });
          });
        })();
      }
    }).catch(function (err) {});
  });
}));

_passport2.default.use(new KakaoStrategy({
  clientID: _config2.default.oauth.kakao.restapikey,
  callbackURL: _config2.default.oauth.kakao.callbackurl
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var profileJson = profile._json;

    _models2.default.users.find({
      where: { email: profileJson.id + '@kakao.com' }
    }).then(function (user) {
      if (user) {
        return done(null, user);
      } else {
        (function () {
          var user_id = profileJson.id + '@kakao.com';
          var email = profileJson.id + '@kakao.com';
          var name = profileJson.properties.nickname;
          var image = profileJson.properties.profile_image;
          _bcrypt2.default.genSalt(8, function (err, salt) {
            var password = salt;
            _bcrypt2.default.hash(password, salt, function (err, hash) {
              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
              password = hash;

              _models2.default.users.create({
                user_id: user_id,
                name: name,
                email: email,
                password: password,
                salt: salt,
                access_token: accessToken,
                refresh_token: refreshToken,
                level: 9,
                from: 'kakao',
                image: image,
                cteated_at: dateStr,
                updated_at: dateStr
              }).then(function (user) {
                return done(null, user);
              }).catch(function (err) {
                return done(err, null);
              });
            });
          });
        })();
      }
    }).catch(function (err) {
      return done(err, null);
    });
  });
}));

_passport2.default.use(new NaverStrategy({
  clientID: _config2.default.oauth.naver.clientid,
  clientSecret: _config2.default.oauth.naver.clientsecret,
  callbackURL: _config2.default.oauth.naver.callbackurl
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var profileJson = profileJson;

    _models2.default.users.find({
      where: { email: profileJson.id + '@naver.com' }
    }).then(function (user) {
      if (user) {
        return done(null, user);
      } else {
        (function () {
          var user_id = profileJson.id + '@naver.com';
          var email = profileJson.id + '@naver.com';
          var name = profileJson.properties.nickname;
          var image = profileJson.properties.profile_image;
          _bcrypt2.default.genSalt(8, function (err, salt) {
            var password = salt;
            _bcrypt2.default.hash(password, salt, function (err, hash) {
              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
              password = hash;

              _models2.default.users.create({
                user_id: user_id,
                name: name,
                email: email,
                password: password,
                salt: salt,
                access_token: accessToken,
                refresh_token: refreshToken,
                level: 9,
                from: 'naver',
                image: image,
                created_at: dateStr,
                updated_at: dateStr
              }).then(function (user) {
                return done(null, user);
              }).catch(function (err) {
                return done(err, null);
              });
            });
          });
        })();
      }
    }).catch(function (err) {
      return done(err, null);
    });
  });
}));

_passport2.default.serializeUser(function (user, done) {
  return done(null, user);
});

_passport2.default.deserializeUser(function (user, done) {
  _models2.default.users.findById(user.id).then(function (user) {
    return done(null, user);
  }).catch(function (err) {
    return done(err);
  });
});

module.exports = router;