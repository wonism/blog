'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _models = require('../../db/models');

var _models2 = _interopRequireDefault(_models);

var _collections = require('../../db/collections');

var _collections2 = _interopRequireDefault(_collections);

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
  _collections2.default.Categories.forge().query('where', 'is_deleted', 0).fetch().then(function (categories) {
    fetchedCategories = categories.toJSON();
    getPages(req, res, next);
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPages = function getPages(req, res, next) {
  _collections2.default.Posts.forge({ id: 1 }).query('where', 'is_deleted', 0).count().then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

// Fetch all Posts
router.get('/', getCategories, function (req, res, next) {
  _collections2.default.Posts.forge().query('where', 'is_deleted', 0).query(function (qb) {
    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      var offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  }).fetch().then(function (posts) {
    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 1) {
      res.json({
        categories: fetchedCategories,
        posts: posts.toJSON(),
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
        posts: posts.toJSON(),
        pages: pages,
        page: page,
        endPoint: 'root'
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
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