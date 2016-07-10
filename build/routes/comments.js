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

var userPk = void 0,
    userName = void 0;
var isAuthor = void 0,
    getPages = void 0;

var pages = void 0;
var pagingSize = 10;

isAuthor = function isAuthor(req, res, next) {
  if (req.user) {
    _models2.default.User.forge({ user_id: req.user.user_id }).fetch().then(function (user) {
      if (user) {
        userPk = user.toJSON().id;
        userName = user.toJSON().name;
        next();
      } else {
        res.type('json');
        res.json({ result: 0 });
      }
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    res.type('json');
    res.json({ result: 0 });
  }
};

getPages = function getPages(req, res, next) {
  _collections2.default.Comments.forge({ id: 1 }).query('where', 'is_deleted', 0).count().then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

// Create Post
router.post('/new', isAuthor, function (req, res, next) {
  _models2.default.Comment.forge({ post_id: req.body.post_id, user_id: userPk, comment: req.body.comment, parent_id: req.body.parent_id }).save().then(function (comment) {
    res.type('json');
    res.json({ comment: comment.toJSON(), commenter: userName });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

module.exports = router;