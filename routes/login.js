var express = require('express');
var router = express.Router();

var formidable = require('formidable');

var pool = require('../config/dbconfig');
var orm = require('sequelize');

var models = require('../db/models');
var collections = require('../db/collections');

var bcrypt = require('bcrypt');

var refer = '';

// Form to Login
router.get('/', function (req, res, next) {
  refer = req.headers.referer;
  res.render('login/index', { req: req, title: '로그인', userId: req.session.u53r, authFlash: req.flash('auth'), failed: false });
});

// Login
router.post('/', function (req, res, next) {
  var form = new formidable.IncomingForm();
  var fields = [];

  form.parse(req, function (err, fields, files) {
    models.User.forge({ user_id: fields.user_id })
    .fetch()
    .then(function (user) {
      if (user) {
        bcrypt.compare(fields.password, user.toJSON().password, function (err, success) {
          if (success) {
            req.session.u53r = user.toJSON().user_id;
            if (refer) {
              res.redirect(refer);
            } else {
              res.redirect('/');
            }
          } else {
            req.session.destroy(function (err) {
              if (err) {
                console.log(err.message);
                res.render('500', { req: req, title: '500: Internal Server Error.'});
              }
            });
            res.render('login/index', { req: req, title: '로그인', userId: null, authFlash: 'ID 혹은 비밀번호가 잘못되었습니다.', failed: true });
          }
        });
      } else {
        res.render('login/index', { req: req, title: '로그인', userId: null, authFlash: 'ID 혹은 비밀번호가 잘못되었습니다.', failed: true });
      }
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { req: req, title: '500: Internal Server Error.'});
    });
  });
});

module.exports = router;

