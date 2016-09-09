'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function (req, res, next) {
  return res.redirect('/users/list/1');
});

// Fetch all Users
router.get('/list/:page', function (req, res, next) {
  _models2.default.users.findAll({
    where: { is_deleted: 0 }
  }).then(function (users) {
    return res.render('users/index', {
      title: '유저 리스트',
      asset: 'users',
      mode: _config2.default.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      users: users
    });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form to Create User
router.get('/new', function (req, res, next) {
  return res.render('users/new', {
    title: '회원 등록',
    asset: 'users',
    mode: _config2.default.mode,
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null
  });
});

// Create User
router.post('/new', function (req, res, next) {
  _models2.default.users.create({
    name: req.body.name,
    email: req.body.email
  }).then(function (user) {
    return res.redirect('/users/list/1');
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Fetch User
router.get('/:id', function (req, res, next) {
  _models2.default.users.findById(req.params.id).then(function (user) {
    if (!user) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('users/show', {
        title: '유저 조회',
        asset: 'users',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        user: user
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Update User
router.get('/update/:id', function (req, res, next) {
  _models2.default.users.findById(req.params.id).then(function (user) {
    if (!user) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('users/update', {
        title: '유저 수정',
        asset: 'users',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        user: user
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Update User
router.post('/update/:id', function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.users.update({
    name: req.body.name,
    email: req.body.email,
    updated_at: dateStr
  }, {
    where: { id: req.params.id }
  }).then(function (result) {
    if (result) {
      return res.redirect('/users/list/1');
    } else {
      throw new Error('존재하지 않는 유저입니다.');
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Delete User
router.get('/delete/:id', function (req, res, next) {
  _models2.default.users.findById(req.params.id).then(function (user) {
    if (!user) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('users/delete', {
        title: '유저 삭제',
        asset: 'users',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        user: user
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Delete User
router.delete('/delete/:id', function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.users.update({
    is_deleted: 1,
    updated_at: dateStr
  }, {
    where: { id: req.params.id }
  }).then(function (result) {
    if (result) {
      return res.redirect('/users/list/1');
    } else {
      throw new Error('존재하지 않는 유저입니다.');
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

module.exports = router;