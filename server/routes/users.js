import express from 'express';

import url from 'url';
import moment from 'moment-timezone';

import models from '../../models';

import config from '../../config/config.json';

const router = express.Router();

router.get('/', (req, res, next) => {
  return res.redirect('/users/list/1');
});

// Fetch all Users
router.get('/list/:page', (req, res, next) => {
  models.users
    .findAll({
      where: { is_deleted: 0 }
    })
    .then((users) => {
      return res.render('users/index',
          {
            title: '유저 리스트',
            asset: 'users',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            users: users
          }
      );
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form to Create User
router.get('/new', (req, res, next) => {
  return res.render('users/new',
      {
        title: '회원 등록',
        asset: 'users',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }
  );
});

// Create User
router.post('/new', (req, res, next) => {
  models.users
    .create({
      name: req.body.name,
      email: req.body.email
    })
    .then((user) => {
      return res.redirect('/users/list/1');
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Fetch User
router.get('/:id', (req, res, next) => {
  models.users
    .findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('users/show',
            {
              title: '유저 조회',
              asset: 'users',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              user: user
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Update User
router.get('/update/:id', (req, res, next) => {
  models.users
    .findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('users/update',
            {
              title: '유저 수정',
              asset: 'users',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              user: user
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Update User
router.post('/update/:id', (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  models.users
    .update({
      name: req.body.name,
      email: req.body.email,
      updated_at: dateStr
    }, {
      where: { id: req.params.id }
    })
    .then((result) => {
      if (result) {
        return res.redirect('/users/list/1');
      } else {
        throw new Error('존재하지 않는 유저입니다.');
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Delete User
router.get('/delete/:id', (req, res, next) => {
  models.users
    .findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('users/delete',
            {
              title: '유저 삭제',
              asset: 'users',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              user: user
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Delete User
router.delete('/delete/:id', (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  models.users
    .update({
      is_deleted: 1,
      updated_at: dateStr
    }, {
      where: { id: req.params.id }
    })
    .then((result) => {
      if (result) {
        return res.redirect('/users/list/1');
      } else {
        throw new Error('존재하지 않는 유저입니다.');
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

module.exports = router;

