'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var pages = void 0;
var fetchedCategories = void 0;
var pagingSize = 5;

var getCategories = void 0,
    getPages = void 0;

getCategories = function getCategories(req, res, next) {
  _models2.default.categories.findAll({
    where: { is_deleted: 0 }
  }).then(function (categories) {
    fetchedCategories = categories;
    getPages(req, res, next);
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

getPages = function getPages(req, res, next) {
  _models2.default.posts.count({
    where: { is_deleted: 0 }
  }).then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

// Fetch all Posts
router.get('/', getCategories, function (req, res, next) {
  var page = +_url2.default.parse(req.url, true).query.page || 1;
  var offset = (page - 1) * pagingSize;

  _models2.default.posts.findAll({
    where: { is_deleted: 0 },
    offset: offset,
    limit: pagingSize,
    order: 'id DESC'
  }).then(function (posts) {
    if (typeof page === 'number' && page > 1) {
      res.json({
        categories: fetchedCategories,
        posts: posts,
        pages: pages,
        page: page
      });
    } else {
      res.render('index', {
        title: 'Jaewonism',
        asset: 'main',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        categories: fetchedCategories,
        posts: posts,
        pages: pages,
        page: page,
        endPoint: 'root'
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

/*
var mysql = require('mysql');
var config = require('PATH/TO/config.json');

var pool = mysql.createPool({
  connectionLimit: 3,
  host: config.rdb.host,
  user: config.rdb.user,
  port: config.rdb.port,
  password: config.rdb.password,
  database: config.rdb.database
});

router.get('/', (req, res, next) => {
  pool.getConnection((err, conn) => {
    conn.query('SELECT * FROM boards', (err, rows) => {
      if (err) {
        console.error('err : ' + err);
      }

      res.send(rows);
      conn.release();
    });
  });
});
*/

module.exports = router;