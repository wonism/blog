import express from 'express';

import url from 'url';
import moment from 'moment-timezone';

import models from '../../models';

import config from '../../config/config.json';

const router = express.Router();

let isAuthor;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.users
      .findById(req.user.id)
      .then((user) => {
        if (+user.level === 99) {
          return next();
        } else {
          req.flash('info', '접근 권한이 없습니다.');
          return res.redirect('/posts');
        }
      })
      .catch((err) => {
        return next(err, req, res, next);
      });
  } else {
    req.flash('info', '로그인을 해주세요.');
    return res.redirect('/login');
  }
};

// Fetch all Categories
router.get('/', isAuthor, (req, res, next) => {
  models.categories
    .findAll({
      where: { is_deleted: 0 },
      order: 'id DESC'
    })
    .then((categories) => {
      return res.render('categories/index',
          {
            title: '카테고리 리스트',
            asset: 'categories',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            categories: categories
          }
      );
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form to Create Category
router.get('/new', isAuthor, (req, res, next) => {
  return res.render('categories/new',
      {
        title: '카테고리 등록',
        asset: 'categories',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }
  );
});

// Create Category
router.post('/new', isAuthor, (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  models.categories
    .create({
      name: req.body.name,
      created_at: dateStr,
      updated_at: dateStr
    })
    .then((category) => {
      return res.redirect('/categories');
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Fetch Category
router.get('/:id', isAuthor, (req, res, next) => {
  models.categories
    .find({
      where: { id: req.params.id, is_deleted: 0 }
    })
    .then((category) => {
      if (!category) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('categories/show',
            {
              title: '카테고리 조회',
              asset: 'categories',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              category: category.toJSON()
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Update Category
router.get('/update/:id', isAuthor, (req, res, next) => {
  models.categories
    .find({
      where: { id: req.params.id, is_deleted: 0 }
    })
    .then((category) => {
      if (!category) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('categories/update',
            {
              title: '카테고리 수정',
              asset: 'categories',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              category: category.toJSON()
            }
        );
      }

    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Update Category
router.post('/update/:id', isAuthor, (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  models.categories
    .update({
      name: req.body.name,
      updated_at: dateStr
    }, {
      where: {
        id: req.params.id,
        is_deleted: 0
      }
    })
    .then((result) => {
      if (result) {
        return res.redirect('/categories/' + req.params.id);
      } else {
        throw new Error('존재하지 않는 카테고리입니다.');
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Delete Category
router.get('/delete/:id', isAuthor, (req, res, next) => {
  models.categories
    .find({
      where: { id: req.params.id, is_deleted: 0 }
    })
    .then((category) => {
      if (!category) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('categories/delete',
            {
              title: '카테고리 삭제',
              asset: 'categories',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              category: category.toJSON()
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Delete Category
router.delete('/delete/:id', isAuthor, (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  models.categories
    .update({
      is_deleted: 1,
      updated_at: dateStr
    }, {
      where: {
        id: req.params.id,
        is_deleted: 0
      }
    })
    .then((result) => {
      if (result) {
        return res.redirect('/categories');
      } else {
        throw new Error('존재하지 않는 카테고리입니다.');
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

module.exports = router;

