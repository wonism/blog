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

var isAuthor = void 0;

isAuthor = function isAuthor(req, res, next) {
  if (req.user) {
    _models2.default.User.forge({ user_id: req.user.user_id }).fetch().then(function (user) {
      if (user.toJSON().level >> 0 === 99) {
        userPk = user.toJSON().id;
        next();
      } else {
        req.flash('info', '포스트 작성 권한이 없습니다.');
        res.redirect('/posts');
      }
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    req.flash('info', '포스트를 작성하려면 로그인을 해야합니다.');
    res.redirect('/login');
  }
};

// Fetch all Categories
router.get('/', isAuthor, function (req, res, next) {
  _collections2.default.Categories.forge().query('where', 'is_deleted', 0).query(function (qb) {
    qb.orderBy('id', 'DESC');
  }).fetch().then(function (categories) {
    res.render('categories/index', {
      req: req,
      title: '카테고리 리스트',
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      categories: categories.toJSON()
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form to Create Category
router.get('/new', isAuthor, function (req, res, next) {
  res.render('categories/new', {
    req: req,
    title: '카테고리 등록',
    url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null
  });
});

// Create Category
router.post('/new', isAuthor, function (req, res, next) {
  _models2.default.Category.forge({ name: req.body.name }).save().then(function (category) {
    res.redirect('/categories');
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch Category
router.get('/:id', isAuthor, function (req, res, next) {
  _models2.default.Category.forge({ id: req.params.id, is_deleted: 0 }).fetch().then(function (category) {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      res.render('categories/show', {
        req: req,
        title: '카테고리 조회',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        category: category.toJSON()
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Update Category
router.get('/update/:id', isAuthor, function (req, res, next) {
  _models2.default.Category.forge({ id: req.params.id, is_deleted: 0 }).fetch().then(function (category) {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      res.render('categories/update', {
        req: req,
        title: '카테고리 수정',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        category: category.toJSON()
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Update Category
router.post('/update/:id', isAuthor, function (req, res, next) {
  _models2.default.Category.forge({ id: req.params.id, is_deleted: 0 }).fetch({ require: true }).then(function (category) {
    category.save({ name: req.body.name || category.get('name') }).then(function () {
      res.redirect('/categories/' + req.params.id);
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Delete Category
router.get('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.Category.forge({ id: req.params.id, is_deleted: 0 }).fetch().then(function (category) {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      res.render('categories/delete', {
        req: req,
        title: '카테고리 삭제',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        category: category.toJSON()
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Delete Category
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.Category.forge({ id: req.params.id, is_deleted: 0 }).fetch({ require: true }).then(function (category) {
    category.save({
      is_deleted: 1
    }).then(function () {
      res.redirect('/categories');
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