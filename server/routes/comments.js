import express from 'express';

import url from 'url';
import moment from 'moment-timezone';

import models from '../../models';

const router = express.Router();

let userPk, userName;
let isAuthor, getPages;

let pages;
let pagingSize = 10;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.users
      .findById(req.user.id)
      .then((user) => {
        userPk = user.id;
        userName = user.name;
        next();
      })
      .catch((err) => {
        return next(err, req, res, next);
      });
  } else {
    return res.send({ result: 0 });
  }
};

getPages = (req, res, next) => {
  collections.Comments.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .count()
  .then((count) => {
    pages = Math.ceil(count / pagingSize);
    return next();
  })
  .catch((err) => {
    return next(err, req, res, next);
  });
};

// Create Post
router.post('/new', isAuthor, (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  models.comments
    .create({
      post_id: req.body.post_id,
      user_id: userPk,
      comment: req.body.comment,
      parent_id: req.body.parent_id,
      created_at: dateStr,
      updated_at: dateStr
    })
    .then((comment) => {
      return res.send({ comment: comment, commenter: userName });
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

module.exports = router;

