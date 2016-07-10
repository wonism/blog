import express from 'express';

import url from 'url';

import models from '../../db/models';
import collections from '../../db/collections';

const router = express.Router();

let pages;
let fetchedCategories;
let pagingSize = 5;

let getCategories, getPages;

getCategories = (req, res, next) => {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then((categories) => {
    fetchedCategories = categories.toJSON();
    getPages(req, res, next);
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPages = (req, res, next) => {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .count()
  .then((count) => {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

// Fetch all Posts
router.get('/', getCategories, (req, res, next) => {
  collections.Posts.forge()
  .query('where', 'is_deleted', 0)
  .query((qb) => {
    let page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      let offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then((posts) => {
    let page = url.parse(req.url, true).query.page >> 0 || 1;

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
          }
      );
    }
  })
  .catch((err) => {
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

      res.render('index', { req: req, title: 'test', userId: req.user ? req.user.user_id : null, isRoot: true, rows: rows });
      conn.release();
    });
  });
});
*/

module.exports = router;

