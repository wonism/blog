'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

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
    _models2.default.users.findById(req.user.id).then(function (user) {
      userPk = user.id;
      userName = user.name;
      next();
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  } else {
    return res.send({ result: 0 });
  }
};

getPages = function getPages(req, res, next) {
  collections.Comments.forge({ id: 1 }).query('where', 'is_deleted', 0).count().then(function (count) {
    pages = Math.ceil(count / pagingSize);
    return next();
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

// Create Post
router.post('/new', isAuthor, function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.comments.create({
    post_id: req.body.post_id,
    user_id: userPk,
    comment: req.body.comment,
    parent_id: req.body.parent_id,
    created_at: dateStr,
    updated_at: dateStr
  }).then(function (comment) {
    return res.send({ comment: comment, commenter: userName });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

module.exports = router;