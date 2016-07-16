import express from 'express';

import url from 'url';

import models from '../../db/models';
import collections from '../../db/collections';

import config from '../../config/config.json';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect('/users/index/1');
});

// Fetch all Users
router.get('/list/:page', (req, res, next) => {
  collections.Users.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then((collection) => {
    res.render('users/index',
        {
          title: '유저 리스트',
          asset: 'users',
          mode: config.mode,
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          users: collection.toJSON()
        }
    );
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form to Create User
router.get('/new', (req, res, next) => {
  res.render('users/new',
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
  models.User.forge({
    name: req.body.name,
    email: req.body.email
  })
  .save()
  .then((user) => {
    res.redirect('/users/index/1');
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Fetch User
router.get('/show/:id', (req, res, next) => {
  models.User.forge({ id: req.params.id })
  .fetch()
  .then((user) => {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('users/show',
          {
            title: '유저 조회',
            asset: 'users',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            user: user.toJSON()
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Update User
router.get('/update/:id', (req, res, next) => {
  models.User.forge({ id: req.params.id })
  .fetch()
  .then((user) => {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('users/update',
          {
            title: '유저 수정',
            asset: 'users',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            user: user.toJSON()
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Update User
router.post('/update/:id', (req, res, next) => {
  models.User.forge({ id: req.params.id })
  .fetch({ require: true })
  .then((user) => {
    user.save({
      name: req.body.name || user.get('name'),
      email: req.body.email || user.get('email')
    })
    .then(() => {
      res.redirect('/users/index/1');
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.'});
    });
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Delete User
router.get('/delete/:id', (req, res, next) => {
  models.User.forge({ id: req.params.id })
  .fetch()
  .then((user) => {
    if (!user) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('users/delete',
          {
            title: '유저 삭제',
            asset: 'users',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            user: user.toJSON()
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Delete User
router.delete('/delete/:id', (req, res, next) => {
  models.User.forge({ id: req.params.id })
  .fetch({ require: true })
  .then((user) => {
    user.save({
      is_deleted: 1
    })
    .then(() => {
      res.redirect('/users/index/1');
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.'});
    });
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

module.exports = router;

