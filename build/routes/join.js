'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var isSafe = void 0;
var errType = '';

// Form to Join
router.get('/', function (req, res, next) {
  res.render('join/index', {
    title: '회원가입',
    asset: 'join',
    mode: _config2.default.mode,
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null
  });
});

// Join
router.post('/', function (req, res, next) {
  var form = new _formidable2.default.IncomingForm();
  var fields = [];

  form.parse(req, function (err, fields, files) {
    _models2.default.users.find({
      where: {
        $or: [{ user_id: fields.user_id }, { email: fields.email }]
      }
    }).then(function (user) {
      if (user) {
        if (user.user_id === fields.user_id) {
          req.flash('errType', 'duplicateId');
          res.render('join/index', {
            title: '회원가입',
            asset: 'join',
            mode: _config2.default.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            errType: req.flash('errType')
          });
        } else if (user.email === fields.email) {
          req.flash('errType', 'duplicateEmail');
          res.render('join/index', {
            title: '회원가입',
            asset: 'join',
            mode: _config2.default.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            errType: req.flash('errType')
          });
        }
      } else {
        if (isSafe(fields.user_id, fields.email, fields.password)) {
          _bcrypt2.default.genSalt(8, function (err, salt) {
            _bcrypt2.default.hash(fields.password, salt, function (err, hash) {
              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

              _models2.default.users.create({
                user_id: fields.user_id,
                name: fields.name,
                email: fields.email,
                password: hash,
                salt: salt,
                access_token: 9,
                refresh_token: 9,
                level: 9,
                created_at: dateStr,
                updated_at: dateStr
              }).then(function (user) {
                return res.redirect('/login');
              }).catch(function (err) {
                return next(err, req, res, next);
              });
            });
          });
        } else {
          req.flash('errType', errType);
          return res.render('join/index', {
            title: '회원가입',
            asset: 'join',
            mode: _config2.default.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            errType: req.flash('errType')
          });
        }
      }
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  });
});

router.post('/check_id', function (req, res, next) {
  if (isSafe(req.body.user_id, null, null)) {
    _models2.default.users.find({
      where: { user_id: req.body.user_id }
    }).then(function (user) {
      if (user) {
        res.send({ success: false, checkTarget: 'id', errType: 'duplicateId' });
      } else {
        res.send({ success: true, checkTarget: 'id' });
      }
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  } else {
    res.send({ success: false, checkTarget: 'id', errType: errType });
  }
});

router.post('/check_em', function (req, res, next) {
  if (isSafe(null, req.body.email, null)) {
    _models2.default.users.find({
      where: { email: req.body.email }
    }).then(function (user) {
      if (user) {
        res.send({ success: false, checkTarget: 'email', errType: 'duplicateEmail' });
      } else {
        res.send({ success: true, checkTarget: 'email' });
      }
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  } else {
    res.send({ success: false, checkTarget: 'email', errType: errType });
  }
});

router.post('/check_pw', function (req, res, next) {
  if (isSafe(req.body.user_id, null, req.body.password)) {
    res.send({ success: true, checkTarget: 'password' });
  } else {
    res.send({ success: false, checkTarget: 'password', errType: errType });
  }
});

isSafe = function isSafe(id, email, password) {
  errType = '';

  if (password) {
    var checkNumber = void 0,
        checkEnglish = void 0;

    checkNumber = password.search(/[0-9]/g);
    checkEnglish = password.search(/[a-z]/ig);

    if (!password.match(/^(?=.*[a-zA-Z])(?=.*[\s+=_\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\])(?=.*[0-9]).{8,16}$/)) {
      errType = 'pwLength';
      return false;
    }

    if (checkNumber < 0 || checkEnglish < 0) {
      errType = 'mix';
      return false;
    }

    if (!password.match(/[\s+=_\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\/]/)) {
      errType = 'pwSpecial';
      return false;
    }

    if (/(\w)\1\1\1/.test(password)) {
      errType = 'repetition';
      return false;
    }

    if (typeof id === 'string' && id.length >= 6 && id.length <= 15 && password.search(id) > -1) {
      errType = 'includeId';
      return false;
    }
  }

  if (id) {
    if (id.match(/[\s+=\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\/]/)) {
      errType = 'idSpecial';
      return false;
    }

    if (!(id.length >= 6 && id.length <= 15)) {
      errType = 'idLength';
      return false;
    }
  }

  if (email) {
    if (!email.match(/(\w)+\@(\w)+\.(\w)+/)) {
      errType = 'invalidEmail';
      return false;
    }
  }

  return true;
};

module.exports = router;