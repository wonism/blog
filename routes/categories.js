var express = require('express');
var router = express.Router();

var pool = require('../config/dbconfig');
var orm = require('sequelize');

var models = require('../db/models');
var collections = require('../db/collections');

isAuthor = function (req, res, next) {
  if (req.session.u53r) {
    models.User.forge({ user_id: req.session.u53r })
    .fetch()
    .then(function (user) {
      if ((user.toJSON().level >> 0) === 99) {
        userPk = user.toJSON().id;
        next();
      } else {
        req.flash('info', '포스트 작성 권한이 없습니다.');
        res.redirect('/posts');
      }
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    req.flash('info', '포스트를 작성하려면 로그인을 해야합니다.');
    res.redirect('/login');
  }
};

// Fetch all Categories
router.get('/', isAuthor, function (req, res, next) {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .query(function (qb) {
    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then(function (categories) {
    console.log(categories);
    res.render('categories/index', { req: req, title: '카테고리 리스트', userId: req.session.u5er, categories: categories.toJSON() });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form to Create Category
router.get('/new', isAuthor, function (req, res, next) {
  res.render('categories/new', { req: req, title: '카테고리 등록', userId: req.session.u5er });
});

// Create Category
router.post('/new', isAuthor, function (req, res, next) {
  models.Category.forge({ name: req.body.name })
  .save()
  .then(function (category) {
    res.redirect('/categories');
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Fetch Category
router.get('/:id', isAuthor, function (req, res, next) {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch()
  .then(function (category) {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('categories/show', { req: req, title: '카테고리 조회', userId: req.session.u5er, category: category.toJSON() });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Update Category
router.get('/update/:id', isAuthor, function (req, res, next) {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch()
  .then(function (category) {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('categories/update', { req: req, title: '카테고리 수정', userId: req.session.u5er, category: category.toJSON() });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Update Category
router.post('/update/:id', isAuthor, function (req, res, next) {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ require: true })
  .then(function (category) {
    category.save({ name: req.body.name || category.get('name') })
    .then(function () {
      res.redirect('/categories/' + req.params.id);
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

// Form for Delete Category
router.get('/delete/:id', isAuthor, function (req, res, next) {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch()
  .then(function (category) {
    if (!category) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('categories/delete', { req: req, title: '카테고리 삭제', userId: req.session.u5er, category: category.toJSON() });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Delete Category
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ require: true })
  .then(function (category) {
    category.save({
      is_deleted: 1
    })
    .then(function () {
      res.redirect('/categories');
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

