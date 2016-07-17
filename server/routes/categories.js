import express from 'express';

import url from 'url';

import models from '../../db/models';
import collections from '../../db/collections';

import config from '../../config/config.json';

const router = express.Router();

let isAuthor;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.User.forge({ user_id: req.user.user_id })
    .fetch()
    .then((user) => {
      if ((user.toJSON().level >> 0) === 99) {
        userPk = user.toJSON().id;
        next();
      } else {
        req.flash('info', '포스트 작성 권한이 없습니다.');
        res.redirect('/posts');
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    req.flash('info', '포스트를 작성하려면 로그인을 해야합니다.');
    res.redirect('/login');
  }
};

// Fetch all Categories
router.get('/', isAuthor, (req, res, next) => {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .query((qb) => {
    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then((categories) => {
    res.render('categories/index',
        {
          title: '카테고리 리스트',
          asset: 'categories',
          mode: config.mode,
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          categories: categories.toJSON()
        }
    );
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form to Create Category
router.get('/new', isAuthor, (req, res, next) => {
  res.render('categories/new',
      {
        title: '카테고리 등록',
        asset: 'categories',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }
  );
});

// Create Category
router.post('/new', isAuthor, (req, res, next) => {
  models.Category.forge({ name: req.body.name })
  .save()
  .then((category) => {
    res.redirect('/categories');
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Fetch Category
router.get('/:id', isAuthor, (req, res, next) => {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch()
  .then((category) => {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('categories/show',
          {
            title: '카테고리 조회',
            asset: 'categories',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            category: category.toJSON()
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Update Category
router.get('/update/:id', isAuthor, (req, res, next) => {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch()
  .then((category) => {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('categories/update',
          {
            title: '카테고리 수정',
            asset: 'categories',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            category: category.toJSON()
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Update Category
router.post('/update/:id', isAuthor, (req, res, next) => {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ require: true })
  .then((category) => {
    category.save({ name: req.body.name || category.get('name') })
    .then(() => {
      res.redirect('/categories/' + req.params.id);
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

// Form for Delete Category
router.get('/delete/:id', isAuthor, (req, res, next) => {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch()
  .then((category) => {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('categories/delete',
          {
            title: '카테고리 삭제',
            asset: 'categories',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            category: category.toJSON()
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Delete Category
router.delete('/delete/:id', isAuthor, (req, res, next) => {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ require: true })
  .then((category) => {
    category.save({
      is_deleted: 1
    })
    .then(() => {
      res.redirect('/categories');
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

