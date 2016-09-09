import express from 'express';

import url from 'url';
import formidable from 'formidable';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';

import models from '../../models';

import config from '../../config/config.json';

const router = express.Router();

let isSafe;
let errType = '';

// Form to Join
router.get('/', (req, res, next) => {
  res.render('join/index',
      {
        title: '회원가입',
        asset: 'join',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }
  );
});

// Join
router.post('/', (req, res, next) => {
  let form = new formidable.IncomingForm();
  let fields = [];

  form.parse(req, (err, fields, files) => {
    models.users
      .find({
        where: {
          $or: [
            { user_id: fields.user_id },
            { email: fields.email }
          ]
        }
      })
      .then((user) => {
        if (user) {
          if (user.user_id === fields.user_id) {
            req.flash('errType', 'duplicateId');
            res.render('join/index',
                {
                  title: '회원가입',
                  asset: 'join',
                  mode: config.mode,
                  url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
                  image: req.protocol + '://' + req.headers.host + '/images/logo.png',
                  description: 'Jaewonism\'s blog'.substring(0, 255),
                  keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
                  userId: req.user ? req.user.user_id : null,
                  errType: req.flash('errType')
                }
            );
          } else if (user.email === fields.email) {
            req.flash('errType', 'duplicateEmail');
            res.render('join/index',
                {
                  title: '회원가입',
                  asset: 'join',
                  mode: config.mode,
                  url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
                  image: req.protocol + '://' + req.headers.host + '/images/logo.png',
                  description: 'Jaewonism\'s blog'.substring(0, 255),
                  keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
                  userId: req.user ? req.user.user_id : null,
                  errType: req.flash('errType')
                }
            );
          }
        } else {
          if (isSafe(fields.user_id, fields.email, fields.password)) {
            bcrypt.genSalt(8, (err, salt) => {
              bcrypt.hash(fields.password, salt, (err, hash) => {
                let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

                models.users
                  .create({
                    user_id: fields.user_id,
                    name: fields.name,
                    email: fields.email,
                    password: hash,
                    salt: salt,
                    access_token: 9,
                    refresh_token: 9,
                    level: 9,
                    created_at: dateStr,
                    updated_at: dateStr
                  })
                  .then((user) => {
                    return res.redirect('/login');
                  })
                  .catch((err) => {
                    return next(err, req, res, next);
                  });
              });
            });
          } else {
            req.flash('errType', errType);
            return res.render('join/index',
                {
                  title: '회원가입',
                  asset: 'join',
                  mode: config.mode,
                  url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
                  image: req.protocol + '://' + req.headers.host + '/images/logo.png',
                  description: 'Jaewonism\'s blog'.substring(0, 255),
                  keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
                  userId: req.user ? req.user.user_id : null,
                  errType: req.flash('errType')
                }
            );
          }
        }
      })
      .catch((err) => {
        return next(err, req, res, next);
      });
  });
});

router.post('/check_id', (req, res, next) => {
  if (isSafe(req.body.user_id, null, null)) {
    models.users
      .find({
        where: { user_id: req.body.user_id }
      })
      .then((user) => {
        if (user) {
          res.send({ success: false, checkTarget: 'id', errType: 'duplicateId' });
        } else {
          res.send({ success: true, checkTarget: 'id' });
        }
      })
      .catch((err) => {
        return next(err, req, res, next);
      });
  } else {
    res.send({ success: false, checkTarget: 'id', errType: errType });
  }
});

router.post('/check_em', (req, res, next) => {
  if (isSafe(null, req.body.email, null)) {
    models.users
      .find({
        where: { email: req.body.email }
      })
      .then((user) => {
        if (user) {
          res.send({ success: false, checkTarget: 'email', errType: 'duplicateEmail' });
        } else {
          res.send({ success: true, checkTarget: 'email' });
        }
      })
      .catch((err) => {
        return next(err, req, res, next);
      });
  } else {
    res.send({ success: false, checkTarget: 'email', errType: errType });
  }
});

router.post('/check_pw', (req, res, next) => {
  if (isSafe(req.body.user_id, null, req.body.password)) {
    res.send({ success: true, checkTarget: 'password' });
  } else {
    res.send({ success: false, checkTarget: 'password', errType: errType });
  }
});

isSafe = (id, email, password) => {
  errType = '';

  if (password) {
    let checkNumber, checkEnglish;

    checkNumber = password.search(/[0-9]/g);
    checkEnglish = password.search(/[a-z]/ig);

    if (!password.match(/^(?=.*[a-zA-Z])(?=.*[\s+=_\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\])(?=.*[0-9]).{8,16}$/)) {
      errType = 'pwLength';
      return false;
    }

    if (checkNumber < 0 || checkEnglish < 0) {
      errType = 'mix';
      return false;
    }

    if (!password.match(/[\s+=_\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\/]/)) {
      errType = 'pwSpecial';
      return false;
    }

    if (/(\w)\1\1\1/.test(password)) {
      errType = 'repetition';
      return false;
    }

    if (typeof id === 'string' && id.length >= 6 && id.length <= 15 && password.search(id) > -1) {
      errType = 'includeId';
      return false;
    }
  }

  if (id) {
    if (id.match(/[\s+=\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\/]/)) {
      errType = 'idSpecial';
      return false;
    }

    if (!(id.length >= 6 && id.length <= 15)) {
      errType = 'idLength';
      return false;
    }
  }

  if (email) {
    if (!email.match(/(\w)+\@(\w)+\.(\w)+/)) {
      errType = 'invalidEmail';
      return false;
    }
  }

  return true;
};

module.exports = router;

