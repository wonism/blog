'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _models = require('../../db/models');

var _models2 = _interopRequireDefault(_models);

var _collections = require('../../db/collections');

var _collections2 = _interopRequireDefault(_collections);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var isSafe = void 0;
var errType = '';

// Form to Join
router.get('/', function (req, res, next) {
  res.render('join/index', {
    req: req,
    title: '회원가입',
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
    _models2.default.User.forge().query(function (qb) {
      qb.where('user_id', fields.user_id).orWhere('email', fields.email);
    }).fetch().then(function (user) {
      if (user) {
        if (user.toJSON().user_id === fields.user_id) {
          req.flash('errType', 'duplicateId');
          res.render('join/index', {
            req: req,
            title: '회원가입',
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            errType: req.flash('errType')
          });
        } else if (user.toJSON().email === fields.email) {
          req.flash('errType', 'duplicateEmail');
          res.render('join/index', {
            req: req,
            title: '회원가입',
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
              fields.password = hash;
              _models2.default.User.forge({ user_id: fields.user_id, name: fields.name, email: fields.email, password: fields.password, salt: salt, access_token: 9, level: 9 }).save().then(function (user) {
                // req.user.user_id = user.toJSON().user_id;
                // res.redirect('/');
                res.redirect('/login');
              }).catch(function (err) {
                console.log(err.message);
                res.render('500', { req: req, title: '500: Internal Server Error.' });
              });
            });
          });
        } else {
          req.flash('errType', errType);
          res.render('join/index', {
            req: req,
            title: '회원가입',
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
      console.log(err.message);
      res.render('500', { req: req, title: '500: Internal Server Error.' });
    });
  });
});

router.post('/check_id', function (req, res, next) {
  if (isSafe(req.body.user_id, null, null)) {
    _models2.default.User.forge().query(function (qb) {
      qb.where('user_id', req.body.user_id);
    }).fetch().then(function (user) {
      if (user) {
        res.type('json');
        res.json({ success: false, checkTarget: 'id', errType: 'duplicateId' });
      } else {
        res.type('json');
        res.json({ success: true, checkTarget: 'id' });
      }
    }).catch(function (err) {
      res.type('json');
      res.json({ success: false, err: err.message });
    });
  } else {
    res.type('json');
    res.json({ success: false, checkTarget: 'id', errType: errType });
  }
});

router.post('/check_em', function (req, res, next) {
  console.log(req.body.email);
  if (isSafe(null, req.body.email, null)) {
    _models2.default.User.forge().query(function (qb) {
      qb.where('email', req.body.email);
    }).fetch().then(function (user) {
      if (user) {
        res.type('json');
        res.json({ success: false, checkTarget: 'email', errType: 'duplicateEmail' });
      } else {
        res.type('json');
        res.json({ success: true, checkTarget: 'email' });
      }
    }).catch(function (err) {
      res.type('json');
      res.json({ success: false, err: err.message });
    });
  } else {
    res.type('json');
    res.json({ success: false, checkTarget: 'email', errType: errType });
  }
});

router.post('/check_pw', function (req, res, next) {
  if (isSafe(req.body.user_id, null, req.body.password)) {
    res.type('json');
    res.json({ success: true, checkTarget: 'password' });
  } else {
    res.type('json');
    res.json({ success: false, checkTarget: 'password', errType: errType });
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