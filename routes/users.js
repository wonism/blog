var express = require('express');
var router = express.Router();

var pool = require('../config/dbconfig');
var orm = require('sequelize');

var models = require('../db/models');
var collections = require('../db/collections');

router.get('/', function (req, res, next) {
  res.redirect('/users/index/1');
});

// Fetch all Users
router.get('/list/:page', function (req, res, next) {
  collections.Users.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then(function (collection) {
    res.render('users/index', { req: req, title: '유저 리스트', userId: req.session.u5er, users: collection.toJSON() });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form to Create User
router.get('/new', function (req, res, next) {
  res.render('users/new', { req: req, title: '회원 등록', userId: req.session.u5er });
});

// Create User
router.post('/new', function (req, res, next) {
  models.User.forge({
    name: req.body.name,
    email: req.body.email
  })
  .save()
  .then(function (user) {
    res.redirect('/users/index/1');
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Fetch User
router.get('/show/:id', function (req, res, next) {
  models.User.forge({ id: req.params.id })
  .fetch()
  .then(function (user) {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('users/show', { req: req, title: '유저 조회', userId: req.session.u5er, user: user.toJSON() });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Update User
router.get('/update/:id', function (req, res, next) {
  models.User.forge({ id: req.params.id })
  .fetch()
  .then(function (user) {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('users/update', { req: req, title: '유저 수정', userId: req.session.u5er, user: user.toJSON() });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Update User
router.post('/update/:id', function (req, res, next) {
  models.User.forge({ id: req.params.id })
  .fetch({ require: true })
  .then(function (user) {
    user.save({
      name: req.body.name || user.get('name'),
      email: req.body.email || user.get('email')
    })
    .then(function () {
      res.redirect('/users/index/1');
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.'});
    });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Delete User
router.get('/delete/:id', function (req, res, next) {
  models.User.forge({ id: req.params.id })
  .fetch()
  .then(function (user) {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('users/delete', { req: req, title: '유저 삭제', userId: req.session.u5er, user: user.toJSON() });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Delete User
router.delete('/delete/:id', function (req, res, next) {
  models.User.forge({ id: req.params.id })
  .fetch({ require: true })
  .then(function (user) {
    user.save({
      is_deleted: 1
    })
    .then(function () {
      res.redirect('/users/index/1');
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.'});
    });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

module.exports = router;

