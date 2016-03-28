var express = require('express');
var router = express.Router();

var url = require('url');

var mysql = require('mysql');
var pool = require('../config/dbconfig');

var pool = require('../config/dbconfig');
var orm = require('sequelize');
var _ = require('lodash');

var models = require('../db/models');
var collections = require('../db/collections');

var pages;
var fetchedCategories;
var pagingSize = 5;

var getCategories, getPages;

getCategories = function (req, res, next) {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then(function (categories) {
    fetchedCategories = categories.toJSON();
    getPages(req, res, next);
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPages = function (req, res, next) {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .count()
  .then(function(count) {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

// Fetch all Posts
router.get('/', getCategories, function (req, res, next) {
  collections.Posts.forge()
  .query('where', 'is_deleted', 0)
  .query(function (qb) {
    var page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      var offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then(function (posts) {
    var page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 1) {
      res.json({
                 categories: fetchedCategories,
                 posts: posts.toJSON(),
                 pages: pages,
                 page: page
      });
    } else {
      res.render('index',
          {
            req: req,
            title: 'Jaewonism',
            userId: req.user ? req.user.user_id : null,
            categories: fetchedCategories,
            posts: posts.toJSON(),
            pages: pages,
            page: page,
            endPoint: 'root'
          }
      );
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

/*
router.get('/', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    conn.query('SELECT * FROM boards', function (err, rows) {
      if (err) {
        console.error('err : ' + err);
      }

      res.render('index', { req: req, title: 'test', userId: req.user ? req.user.user_id : null, isRoot: true, rows: rows });
      conn.release();
    });
  });
});
*/

module.exports = router;

