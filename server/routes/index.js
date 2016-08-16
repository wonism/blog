import express from 'express';

import url from 'url';

import models from '../../models';

import config from '../../config/config.json';

const router = express.Router();

let pages;
let fetchedCategories;
let pagingSize = 5;

let getCategories, getPages;

getCategories = (req, res, next) => {
  models.categories
    .findAll({
      where: { is_deleted: 0 }
    })
    .then((categories) => {
      fetchedCategories = categories;
      getPages(req, res, next);
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
};

getPages = (req, res, next) => {
  models.posts
    .count({
      where: { is_deleted: 0 }
    })
    .then((count) => {
      pages = Math.ceil(count / pagingSize);
      next();
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
};

// Fetch all Posts
router.get('/', getCategories, (req, res, next) => {
  let page = +url.parse(req.url, true).query.page || 1;
  let offset = (page - 1) * pagingSize;

  models.posts
    .findAll({
      where: { is_deleted: 0 },
      offset: offset,
      limit: pagingSize,
      order: 'id DESC'
    })
    .then((posts) => {
      if (typeof page === 'number' && page > 1) {
        res.json({
          categories: fetchedCategories,
          posts: posts,
          pages: pages,
          page: page
        });
      } else {
        res.render('index',
            {
              title: 'Jaewonism',
              asset: 'main',
              mode: config.mode,
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
            }
        );
      }
    })
    .catch((err) => {
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

