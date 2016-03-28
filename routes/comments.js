var express = require('express');
var router = express.Router();

var url = require('url');

var pool = require('../config/dbconfig');
var orm = require('sequelize');
var _ = require('lodash');

var models = require('../db/models');
var collections = require('../db/collections');

var userPk, userName;
var isAuthor;

var pages;
var pagingSize = 10;

isAuthor = function (req, res, next) {
  if (req.user) {
    models.User.forge({ user_id: req.user.user_id })
    .fetch()
    .then(function (user) {
      if (user) {
        userPk = user.toJSON().id;
        userName = user.toJSON().name;
        next();
      } else {
        res.type('json');
        res.json({ result: 0 });
      }
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    res.type('json');
    res.json({ result: 0 });
  }
};

getPages = function (req, res, next) {
  collections.Comments.forge({ id: 1 })
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

// Create Post
router.post('/new', isAuthor, function (req, res, next) {
  models.Comment.forge({ post_id: req.body.post_id, user_id: userPk, comment: req.body.comment, parent_id: req.body.parent_id })
  .save()
  .then(function (comment) {
    res.type('json');
    res.json({ comment: comment.toJSON(), commenter: userName });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

module.exports = router;

