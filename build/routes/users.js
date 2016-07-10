'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _models = require('../../db/models');

var _models2 = _interopRequireDefault(_models);

var _collections = require('../../db/collections');

var _collections2 = _interopRequireDefault(_collections);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function (req, res, next) {
  res.redirect('/users/index/1');
});

// Fetch all Users
router.get('/list/:page', function (req, res, next) {
  _collections2.default.Users.forge().query('where', 'is_deleted', 0).fetch().then(function (collection) {
    res.render('users/index', {
      req: req,
      title: '유저 리스트',
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      users: collection.toJSON()
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form to Create User
router.get('/new', function (req, res, next) {
  res.render('users/new', {
    req: req,
    title: '회원 등록',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null
  });
});

// Create User
router.post('/new', function (req, res, next) {
  _models2.default.User.forge({
    name: req.body.name,
    email: req.body.email
  }).save().then(function (user) {
    res.redirect('/users/index/1');
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch User
router.get('/show/:id', function (req, res, next) {
  _models2.default.User.forge({ id: req.params.id }).fetch().then(function (user) {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      res.render('users/show', {
        req: req,
        title: '유저 조회',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        user: user.toJSON()
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Update User
router.get('/update/:id', function (req, res, next) {
  _models2.default.User.forge({ id: req.params.id }).fetch().then(function (user) {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      res.render('users/update', {
        req: req,
        title: '유저 수정',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        user: user.toJSON()
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Update User
router.post('/update/:id', function (req, res, next) {
  _models2.default.User.forge({ id: req.params.id }).fetch({ require: true }).then(function (user) {
    user.save({
      name: req.body.name || user.get('name'),
      email: req.body.email || user.get('email')
    }).then(function () {
      res.redirect('/users/index/1');
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Delete User
router.get('/delete/:id', function (req, res, next) {
  _models2.default.User.forge({ id: req.params.id }).fetch().then(function (user) {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      res.render('users/delete', {
        req: req,
        title: '유저 삭제',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        user: user.toJSON()
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Delete User
router.delete('/delete/:id', function (req, res, next) {
  _models2.default.User.forge({ id: req.params.id }).fetch({ require: true }).then(function (user) {
    user.save({
      is_deleted: 1
    }).then(function () {
      res.redirect('/users/index/1');
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

module.exports = router;