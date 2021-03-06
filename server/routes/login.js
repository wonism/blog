import express from 'express';

import url from 'url';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';

import models from '../../models';

import passport from 'passport';
import passportLocal from 'passport-local';
import passportFacebook from 'passport-facebook';
import passportTwitter from 'passport-twitter';
import passportGoogle from 'passport-google-oauth';
import passportKakao from 'passport-kakao';
import passportNaver from 'passport-naver';

import config from '../../config/config.json';

const router = express.Router();

let LocalStrategy = passportLocal.Strategy;
let FacebookStrategy = passportFacebook.Strategy;
let TwitterStrategy = passportTwitter.Strategy;
let GoogleStrategy = passportGoogle.OAuth2Strategy;
let KakaoStrategy = passportKakao.Strategy;
let NaverStrategy = passportNaver.Strategy;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

// Form to Login
router.get('/', (req, res, next) => {
  let flash = req.flash('auth');
  flash = flash.length ? flash : req.flash('error');
  return res.render('login/index',
      {
        title: '로그인',
        asset: 'login',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        authFlash: flash,
        failed: false
      }
  );
});

router.post('/', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }));

router.get('/oauth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/oauth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/twitter', passport.authenticate('twitter'));

router.get('/oauth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/google', passport.authenticate('google', {
  scope: ['openid', 'email']
}));

router.get('/oauth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/kakao', passport.authenticate('kakao'));

router.get('/oauth/kakao/callback', passport.authenticate('kakao', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/oauth/naver', passport.authenticate('naver'));

router.get('/oauth/naver/callback', passport.authenticate('naver', {
  successRedirect: '/',
  failureRedirect: '/login/failed'
}));

router.get('/failed', ensureAuthenticated, (req, res) => {
  return res.send('failed');
});

passport.use(new LocalStrategy(
  {
    usernameField: 'user_id',
    passwordField: 'password'
  },
  function (user_id, password, done) {
    models.users
      .find({
        where: { user_id: user_id }
      })
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

passport.use(new FacebookStrategy({
    clientID: config.oauth.facebook.id,
    clientSecret: config.oauth.facebook.secret,
    callbackURL: config.oauth.facebook.callbackurl,
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(() => {
      let profileJson = profile._json;

      models.users
        .find({
          where: { email: profileJson.email }
        })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            let user_id = profileJson.id + '@facebook.com';
            let email = profileJson.email || profileJson.id + '@facebook.com';
            let name = profileJson.name;
            let image = profileJson.picture.data.url;
            bcrypt.genSalt(8, (err, salt) => {
              let password = salt;
              bcrypt.hash(password, salt, (err, hash) => {
                let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
                password = hash;

                models.users
                  .create({
                    user_id: user_id,
                    name: name,
                    email: email,
                    password: password,
                    salt: salt,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    level: 9,
                    from: 'facebook',
                    image: image,
                    created_at: dateStr,
                    updated_at: dateStr
                  })
                  .then((user) => {
                    return done(null, user);
                  })
                  .catch((err) => {
                    return done(err, null);
                  });
              });
            });
          }
        })
        .catch((err) => {
          return done(err, null);
        });
    });
  }
));

passport.use(new TwitterStrategy({
    consumerKey: config.oauth.twitter.consumerkey,
    consumerSecret: config.oauth.twitter.consumersecret,
    callbackURL: config.oauth.twitter.callbackurl
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(() => {
      let profileJson = profile._json;

      models.users
        .find({
          where: { email: profileJson.id_str + '@twitter.com' }
        })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            let user_id = profileJson.id_str + '@twitter.com';
            let email = profileJson.id_str + '@twitter.com';
            let name = profileJson.name;
            let image = profileJson.profile_image_url.replace(/$https?/, '').replace(/normal.jpg$/, '400x400.jpg');
            bcrypt.genSalt(8, (err, salt) => {
              let password = salt;
              bcrypt.hash(password, salt, (err, hash) => {
                let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
                password = hash;

                models.users
                  .create({
                    user_id: user_id,
                    name: name,
                    email: email,
                    password: password,
                    salt: salt,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    level: 9,
                    from: 'twitter',
                    image: image,
                    created_at: dateStr,
                    updated_at: dateStr
                  })
                  .then((user) => {
                    return done(null, user);
                  })
                  .catch((err) => {
                    return done(err, null);
                  });
              });
            });
          }
        })
        .catch((err) => {
          return done(err, null);
        });
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: config.oauth.google.clientid,
    clientSecret: config.oauth.google.clientsecret,
    callbackURL: config.oauth.google.callbackurl
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(() => {
      let profileJson = profile._json;

      models.users
        .find({
          where: { email: (profileJson.emails.length ? profileJson.emails[0].value : profileJson.id + '@googleplus.com') }
        })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            let user_id = profileJson.id + '@googleplus.com';
            let email = (profileJson.emails.length ? profileJson.emails[0].value : profileJson.id + '@googleplus.com');
            let name = profileJson.displayName;
            let image = (profileJson.image.isDefault ? '' : profileJson.image.url.replace(/$https?/, '').replace(/\?sz=\d{1,}$/, ''));
            bcrypt.genSalt(8, (err, salt) => {
              let password = salt;
              bcrypt.hash(password, salt, (err, hash) => {
                let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
                password = hash;

                models.users
                  .create({
                    user_id: user_id,
                    name: name,
                    email: email,
                    password: password,
                    salt: salt,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    level: 9,
                    from: 'google',
                    image: image,
                    created_at: dateStr,
                    updated_at: dateStr
                  })
                  .then((user) => {
                    return done(null, user);
                  })
                  .catch((err) => {
                    return done(err, null);
                  });
              });
            });
          }
        })
        .catch((err) => {
        });
    });
  }
));

passport.use(new KakaoStrategy({
    clientID: config.oauth.kakao.restapikey,
    callbackURL: config.oauth.kakao.callbackurl
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(() => {
      let profileJson = profile._json;

      models.users
        .find({
          where: { email: profileJson.id + '@kakao.com' }
        })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            let user_id = profileJson.id + '@kakao.com';
            let email = profileJson.id + '@kakao.com';
            let name = profileJson.properties.nickname;
            let image = profileJson.properties.profile_image;
            bcrypt.genSalt(8, (err, salt) => {
              let password = salt;
              bcrypt.hash(password, salt, (err, hash) => {
                let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
                password = hash;

                models.users
                  .create({
                    user_id: user_id,
                    name: name,
                    email: email,
                    password: password,
                    salt: salt,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    level: 9,
                    from: 'kakao',
                    image: image,
                    cteated_at: dateStr,
                    updated_at: dateStr
                  })
                  .then((user) => {
                    return done(null, user);
                  })
                  .catch((err) => {
                    return done(err, null);
                  });
              });
            });
          }
        })
        .catch((err) => {
          return done(err, null);
        });
    });
  }
));

passport.use(new NaverStrategy({
    clientID: config.oauth.naver.clientid,
    clientSecret: config.oauth.naver.clientsecret,
    callbackURL: config.oauth.naver.callbackurl
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(() => {
      let profileJson = profileJson;

      models.users
        .find({
          where: { email: profileJson.id + '@naver.com' }
        })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            let user_id = profileJson.id + '@naver.com';
            let email = profileJson.id + '@naver.com';
            let name = profileJson.properties.nickname;
            let image = profileJson.properties.profile_image;
            bcrypt.genSalt(8, (err, salt) => {
              let password = salt;
              bcrypt.hash(password, salt, (err, hash) => {
                let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
                password = hash;

                models.users
                  .create({
                    user_id: user_id,
                    name: name,
                    email: email,
                    password: password,
                    salt: salt,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    level: 9,
                    from: 'naver',
                    image: image,
                    created_at: dateStr,
                    updated_at: dateStr
                  })
                  .then((user) => {
                    return done(null, user);
                  })
                  .catch((err) => {
                    return done(err, null);
                  });
              });
            });
          }
        })
        .catch((err) => {
          return done(err, null);
        });
    });
  }
));

passport.serializeUser((user, done) => {
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  models.users
    .findById(user.id)
    .then((user) => {
      return done(null, user);
    })
    .catch((err) => {
      return done(err);
    });
});

module.exports = router;

