import express from 'express';

import url from 'url';
import bcrypt from 'bcrypt';

import models from '../../db/models';
import collections from '../../db/collections';

import passport from 'passport';
import passportLocal from 'passport-local';
import passportFacebook from 'passport-facebook';
import passportTwitter from 'passport-twitter';
import passportGoogle from 'passport-google-oauth';
import passportKakao from 'passport-kakao';
import passportNaver from 'passport-naver';

const router = express.Router();

let LocalStrategy = passportLocal.Strategy;
let FacebookStrategy = passportFacebook.Strategy;
let TwitterStrategy = passportTwitter.Strategy;
let GoogleStrategy = passportGoogle.OAuth2Strategy;
let KakaoStrategy = passportKakao.Strategy;
let NaverStrategy = passportNaver.Strategy;

let refer = '/';

// Form to Login
router.get('/', (req, res, next) => {
  refer = req.headers.referer;
  let flash = req.flash('auth');
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

router.post('/', passport.authenticate('local', { successRedirect: refer, failureRedirect: '/login', failureFlash: true }));

passport.use(new LocalStrategy(
  {
    usernameField: 'user_id',
    passwordField: 'password'
  },
  function (user_id, password, done) {
    models.User.forge({ user_id: user_id })
    .fetch()
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.toJSON().password, (err, success) => {
          if (success) {
            return done(null, { id: user.id });
          } else {
            return done(null, false, { message: 'ID 혹은 비밀번호가 잘못되었습니다.' });
          }
        });
      } else {
        return done(null, false, { message: 'ID 혹은 비밀번호가 잘못되었습니다.' });
      }
    })
    .catch((err) => {
      return done(err, null);
    });
  }
));

passport.serializeUser((user, done) => {
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  models.User.forge({ id: user.id })
  .fetch()
  .then((user) => {
    return done(null, user.toJSON());
  })
  .catch((err) => {
    return done(err);
  });
});

module.exports = router;

