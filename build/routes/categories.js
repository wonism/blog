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

var isAuthor = void 0;

isAuthor = function isAuthor(req, res, next) {
  if (req.user) {
    _models2.default.users.findById(req.user.id).then(function (user) {
      if (+user.level === 99) {
        return next();
      } else {
        req.flash('info', '접근 권한이 없습니다.');
        return res.redirect('/posts');
      }
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  } else {
    req.flash('info', '로그인을 해주세요.');
    return res.redirect('/login');
  }
};

// Fetch all Categories
router.get('/', isAuthor, function (req, res, next) {
  _models2.default.categories.findAll({
    where: { is_deleted: 0 },
    order: 'id DESC'
  }).then(function (categories) {
    return res.render('categories/index', {
      title: '카테고리 리스트',
      asset: 'categories',
      mode: _config2.default.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      categories: categories
    });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form to Create Category
router.get('/new', isAuthor, function (req, res, next) {
  return res.render('categories/new', {
    title: '카테고리 등록',
    asset: 'categories',
    mode: _config2.default.mode,
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null
  });
});

// Create Category
router.post('/new', isAuthor, function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.categories.create({
    name: req.body.name,
    created_at: dateStr,
    updated_at: dateStr
  }).then(function (category) {
    return res.redirect('/categories');
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Fetch Category
router.get('/:id', isAuthor, function (req, res, next) {
  _models2.default.categories.find({
    where: { id: req.params.id, is_deleted: 0 }
  }).then(function (category) {
    if (!category) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('categories/show', {
        title: '카테고리 조회',
        asset: 'categories',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        category: category.toJSON()
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Update Category
router.get('/update/:id', isAuthor, function (req, res, next) {
  _models2.default.categories.find({
    where: { id: req.params.id, is_deleted: 0 }
  }).then(function (category) {
    if (!category) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('categories/update', {
        title: '카테고리 수정',
        asset: 'categories',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        category: category.toJSON()
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Update Category
router.post('/update/:id', isAuthor, function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.categories.update({
    name: req.body.name,
    updated_at: dateStr
  }, {
    where: {
      id: req.params.id,
      is_deleted: 0
    }
  }).then(function (result) {
    if (result) {
      return res.redirect('/categories/' + req.params.id);
    } else {
      throw new Error('존재하지 않는 카테고리입니다.');
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Delete Category
router.get('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.categories.find({
    where: { id: req.params.id, is_deleted: 0 }
  }).then(function (category) {
    if (!category) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('categories/delete', {
        title: '카테고리 삭제',
        asset: 'categories',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        category: category.toJSON()
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Delete Category
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.categories.update({
    is_deleted: 1,
    updated_at: dateStr
  }, {
    where: {
      id: req.params.id,
      is_deleted: 0
    }
  }).then(function (result) {
    if (result) {
      return res.redirect('/categories');
    } else {
      throw new Error('존재하지 않는 카테고리입니다.');
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

module.exports = router;