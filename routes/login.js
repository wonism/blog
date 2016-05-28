var express = require('express');
var router = express.Router();

var url = require('url');

var pool = require('../config/dbconfig');
var orm = require('sequelize');

var models = require('../db/models');
var collections = require('../db/collections');

var bcrypt = require('bcrypt');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var refer = '';

passport.use(new LocalStrategy(
  {
    usernameField: 'user_id',
    passwordField: 'password'
  },
  function (user_id, password, done) {
    models.User.forge({ user_id: user_id })
    .fetch()
    .then(function (user) {
      if (user) {
        bcrypt.compare(password, user.toJSON().password, function (err, success) {
          if (success) {
            return done(null, user);
            // req.session.u53r = user.toJSON().user_id;
            /*
            if (refer) {
              res.redirect(refer);
            } else {
              res.redirect('/');
            }
            */
          } else {
            return done(null, false, { message: 'ID 혹은 비밀번호가 잘못되었습니다.' });
            /*
            req.session.destroy(function (err) {
              if (err) {
                console.log(err.message);
                res.render('500', { req: req, title: '500: Internal Server Error.'});
              }
            });
            res.render('login/index', { req: req, title: '로그인', userId: null, authFlash: 'ID 혹은 비밀번호가 잘못되었습니다.', failed: true });
            */
          }
        });
      } else {
        return done(null, false, { message: 'ID 혹은 비밀번호가 잘못되었습니다.' });
      }
    })
    .catch(function (err) {
      return done(err, null);
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done ) {
  models.User.forge({ user_id: user.user_id })
  .fetch()
  .then(function (user) {
    done(null, user.toJSON());
  })
  .catch(function (err) {
    done(err);
  });
});

// Form to Login
router.get('/', function (req, res, next) {
  refer = req.headers.referer;
  var flash = req.flash('auth');
  flash = flash.length ? flash : req.flash('error');
  res.render('login/index',
      {
        req: req,
        title: '로그인',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        authFlash: flash,
        failed: false
      }
  );
});

router.post(
    '/',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }),
    function (req, res, next) {
      res.redirect('/');
    }
);

// Login
/*
router.post('/', function (req, res, next) {
  models.User.forge({ user_id: req.body.user_id })
  .fetch()
  .then(function (user) {
    if (user) {
      bcrypt.compare(req.body.password, user.toJSON().password, function (err, success) {
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
*/

module.exports = router;

