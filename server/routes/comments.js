import express from 'express';

import url from 'url';

import models from '../../db/models';
import collections from '../../db/collections';

const router = express.Router();

let userPk, userName;
let isAuthor, getPages;

let pages;
let pagingSize = 10;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.User.forge({ user_id: req.user.user_id })
    .fetch()
    .then((user) => {
      if (user) {
        userPk = user.toJSON().id;
        userName = user.toJSON().name;
        next();
      } else {
        res.type('json');
        res.json({ result: 0 });
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    res.type('json');
    res.json({ result: 0 });
  }
};

getPages = (req, res, next) => {
  collections.Comments.forge({ id: 1 })
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

// Create Post
router.post('/new', isAuthor, (req, res, next) => {
  models.Comment.forge({ post_id: req.body.post_id, user_id: userPk, comment: req.body.comment, parent_id: req.body.parent_id })
  .save()
  .then((comment) => {
    res.type('json');
    res.json({ comment: comment.toJSON(), commenter: userName });
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

module.exports = router;

