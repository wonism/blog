'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _models = require('../../db/models');

var _models2 = _interopRequireDefault(_models);

var _collections = require('../../db/collections');

var _collections2 = _interopRequireDefault(_collections);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var userPk = void 0,
    fetchedCategories = void 0;
var isAuthor = void 0,
    getCategories = void 0,
    getPages = void 0,
    getPagesWithCategory = void 0,
    saveTags = void 0,
    getPagesWithTag = void 0,
    getPagesWithSearch = void 0;
var userCheckingArr = ['/new', '/update', '/delete'];
var userCheckingReg = new RegExp(userCheckingArr.join("|"));

var pages = void 0;
var pagingSize = 10;

isAuthor = function isAuthor(req, res, next) {
  if (req.user) {
    _models2.default.User.forge({ user_id: req.user.user_id }).fetch().then(function (user) {
      if (req.route.path.match(userCheckingReg)) {
        if (user.toJSON().level >> 0 === 99) {
          userPk = user.toJSON().id;
          getCategories(req, res, next);
        } else {
          req.flash('auth', '권한이 없습니다.');
          res.redirect('/posts');
        }
      } else {
        userPk = user.toJSON().id;
        getCategories(req, res, next);
      }
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    if (req.route.path.match(userCheckingReg)) {
      req.flash('auth', '포스트를 작성하려면 로그인을 해야합니다.');
      res.redirect('/login');
    } else {
      userPk = 0;
      getCategories(req, res, next);
    }
  }
};

getCategories = function getCategories(req, res, next) {
  _collections2.default.Categories.forge().query('where', 'is_deleted', 0).fetch().then(function (categories) {
    fetchedCategories = categories.toJSON();
    if (req.url.match(/\/categories\//)) {
      getPagesWithCategory(req, res, next);
    } else if (req.url.match(/\/tags\//)) {
      getPagesWithTag(req, res, next);
    } else if (req.url.match(/\/search\//)) {
      getPagesWithSearch(req, res, next);
    } else {
      getPages(req, res, next);
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPages = function getPages(req, res, next) {
  _collections2.default.Posts.forge({ id: 1 }).query('where', 'is_deleted', 0).count().then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithCategory = function getPagesWithCategory(req, res, next) {
  _collections2.default.Posts.forge({ id: 1 }).query('where', 'is_deleted', 0).query('where', 'category_id', req.params.id).count().then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithTag = function getPagesWithTag(req, res, next) {
  _models2.default.Tag.forge({ slug: req.params.slug }).fetch({ withRelated: [{
      'posts': function posts(qb) {
        qb.select('posts.id');
      }
    }] }).then(function (tag) {
    var posts = tag.related('posts');
    pages = Math.ceil(posts.length / pagingSize);
    next();
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithSearch = function getPagesWithSearch(req, res, next) {
  _collections2.default.Posts.forge({ id: 1 }).query('where', 'is_deleted', 0).query(function (qb) {
    qb.where('title', 'LIKE', '%' + req.params.keyword + '%');
    qb.orWhere('text', 'LIKE', '%' + req.params.keyword + '%');
  }).count().then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

// Fetch all Posts
router.get('/', getCategories, function (req, res, next) {
  _collections2.default.Posts.forge().query('where', 'is_deleted', 0).query(function (qb) {
    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      var offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  }).fetch().then(function (posts) {
    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1,
        description = '',
        keyword = '';

    var i = 0;
    for (; i < posts.toJSON().length; i++) {
      description += posts.toJSON()[i].title;

      if (i !== posts.toJSON().length - 1) {
        description += ', ';
      }
    }

    i = 0;
    for (; i < fetchedCategories.length; i++) {
      keyword += fetchedCategories[i].name;

      if (i !== fetchedCategories.length - 1) {
        keyword += ', ';
      }
    }

    res.render('posts/index', {
      req: req,
      title: 'Jaewonism - POST',
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: description.substring(0, 255),
      keyword: keyword,
      userId: req.user ? req.user.user_id : null,
      authFlash: req.flash('auth'),
      infoFlash: req.flash('info'),
      categories: fetchedCategories,
      categoryId: 0,
      posts: posts.toJSON(),
      pages: pages,
      page: page,
      endPoint: 'root'
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Create Post
router.get('/new', isAuthor, function (req, res, next) {
  _collections2.default.Categories.forge().query('where', 'is_deleted', 0).fetch().then(function (categories) {
    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

    res.render('posts/new', {
      req: req,
      title: 'Jaewonism - NEW POST',
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      categories: categories.toJSON(),
      page: page
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Create Post
router.post('/new', isAuthor, function (req, res, next) {
  var tags = void 0,
      postTitle = void 0,
      newSlug = void 0;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/ /g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map(function (tag) {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  _collections2.default.Posts.forge().query('where', 'title', postTitle).fetch().then(function (posts) {
    if (posts !== null) {
      var numberForSlug = posts.toJSON().length + 1;

      newSlug = newSlug + '-' + numberForSlug;
    }

    _models2.default.Post.forge({
      user_id: userPk,
      category_id: req.body.category_id,
      title: postTitle,
      thumbnail: req.body.thumbnail,
      background_image: req.body.background_image,
      slug: newSlug,
      html: req.body.html,
      text: req.body.html.replace(/<[^>]*>/g, '')
    }).save().then(function (post) {
      saveTags(tags).then(function (ids) {
        post.load(['tags']).then(function (tags) {
          tags.tags().attach(ids);
          res.redirect('/posts');
        }).catch(function (err) {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      }).catch(function (err) {
        console.log(err.message);
        res.render('500', { title: '500: Internal Server Error.' });
      });
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch Post
router.get('/:id', isAuthor, function (req, res, next) {
  _models2.default.Post.forge({ id: req.params.id, is_deleted: 0 }).fetch({ withRelated: [{
      'author': function author(qb) {},
      'category': function category(qb) {},
      'tags': function tags(qb) {},
      'comments': function comments(qb) {
        qb.orderBy('id', 'DESC');
      },
      'comments.user': function commentsUser(qb) {
        qb.select('users.id', 'users.name');
      }
    }] }).then(function (post) {
    if (!post) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      var author = void 0,
          category = void 0,
          tags = void 0,
          _page = void 0,
          comments = void 0,
          description = void 0,
          keyword = '';

      author = post.related('author');
      category = post.related('category');
      tags = post.related('tags');
      _page = _url2.default.parse(req.url, true).query.page >> 0 || 1;
      comments = post.related('comments');
      description = post.toJSON().text;

      var i = 0;
      for (; i < tags.toJSON().length; i++) {
        keyword += tags.toJSON()[i].name;

        if (i !== tags.toJSON().length - 1) {
          keyword += ', ';
        }
      }

      res.render('posts/show', {
        req: req,
        title: 'Jaewonism - POST : ' + post.toJSON().title,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: description.substring(0, 255),
        keyword: keyword,
        author: author.toJSON(),
        userId: req.user ? req.user.user_id : null,
        userPk: userPk || 0,
        authFlash: req.flash('auth'),
        infoFlash: req.flash('info'),
        post: post.toJSON(),
        comments: comments.toJSON() || null,
        categories: fetchedCategories,
        category: category.toJSON(),
        tags: tags.toJSON(),
        page: _page
      });
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Update Post
router.get('/update/:id', isAuthor, function (req, res, next) {
  _models2.default.Post.forge({ id: req.params.id, is_deleted: 0 }).fetch({ withRelated: ['category', 'tags'] }).then(function (post) {
    if (!post) {
      res.render('404', { title: '404: Page Not Found.' });
    } else {
      (function () {
        var category = void 0,
            tags = void 0,
            page = void 0;

        page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

        _collections2.default.Categories.forge().query('where', 'is_deleted', 0).fetch().then(function (categories) {
          if (post.toJSON().user_id >> 0 === userPk >> 0) {
            category = post.related('category');
            tags = post.related('tags');

            res.render('posts/update', {
              req: req,
              title: 'Jaewonism - MODIFY POST',
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              post: post.toJSON(),
              categories: categories.toJSON(),
              category: category.toJSON(),
              tags: tags.toJSON(),
              page: page
            });
          } else {
            req.flash('auth', '권한이 없습니다.');
            res.redirect('/posts/' + req.params.id);
          }
        }).catch(function (err) {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      })();
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Update Post
router.post('/update/:id', isAuthor, function (req, res, next) {
  var tags = void 0,
      postTitle = void 0,
      newSlug = void 0;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/ /g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map(function (tag) {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  _collections2.default.Posts.forge().query('where', 'title', postTitle).fetch().then(function (posts) {
    if (posts !== null) {
      var numberForSlug = posts.toJSON().length + 1;

      newSlug = newSlug + '-' + numberForSlug;
    }

    _models2.default.Post.forge({ id: req.params.id, is_deleted: 0 }).fetch({ require: true }).then(function (post) {
      if (post.toJSON().user_id >> 0 === userPk >> 0) {
        post.save({
          category_id: req.body.category_id || post.get('category_id'),
          title: req.body.title || post.get('title'),
          slug: newSlug,
          thumbnail: req.body.thumbnail || post.get('thumbnail'),
          background_image: req.body.background_image || post.get('background_image'),
          html: req.body.html || post.get('html'),
          text: req.body.html.replace(/<[^>]*>/g, '') || post.get('html').replace(/<[^>]*>/g, '')
        }).then(function (post) {
          saveTags(tags).then(function (ids) {
            post.load(['tags']).then(function (tags) {
              var tagArr = void 0,
                  tagCounter = void 0;

              tagArr = post.related('tags').toJSON();

              tagCounter = 0;
              for (; tagCounter < tagArr.length; tagCounter++) {
                tags.tags().detach(tagArr[tagCounter].id);
              }

              tags.tags().attach(ids);

              req.flash('auth', '포스트 수정이 완료되었습니다.');
              res.redirect('/posts/' + req.params.id);
            }).catch(function (err) {
              console.log(err.message);
              res.render('500', { title: '500: Internal Server Error.' });
            });
          }).catch(function (err) {
            console.log(err.message);
            res.render('500', { title: '500: Internal Server Error.' });
          });
        }).catch(function (err) {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      } else {
        req.flash('auth', '잘못된 접근입니다.');
        res.redirect('/posts/' + req.params.id);
      }
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Delete Post
router.get('/delete/:id', isAuthor, function (req, res, next) {
  _collections2.default.Categories.forge().query('where', 'is_deleted', 0).fetch().then(function (categories) {
    _models2.default.Post.forge({ id: req.params.id, is_deleted: 0 }).fetch().then(function (post) {
      if (!post) {
        res.render('404', { title: '404: Page Not Found.' });
      } else {
        page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

        res.render('posts/delete', {
          req: req,
          title: 'Jaewonism - DELETE POST',
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          categories: categories.toJSON(),
          post: post.toJSON(),
          page: page
        });
      }
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Delete Post
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.Post.forge({ id: req.params.id, is_deleted: 0 }).fetch({ require: true }).then(function (post) {
    post.save({
      is_deleted: 1
    }).then(function () {
      res.redirect('/posts');
    }).catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Category
router.get('/categories/:id', getCategories, function (req, res, next) {
  _models2.default.Category.forge({ id: req.params.id, is_deleted: 0 }).fetch({ withRelated: [{
      'posts': function posts(qb) {
        var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

        if (typeof page === 'number' && page > 0) {
          var offset = (page - 1) * pagingSize;

          qb.offset(offset).limit(pagingSize);
        }

        qb.orderBy('id', 'DESC');
      }
    }] }).then(function (category) {
    if (category) {
      var posts = void 0,
          _page2 = void 0,
          description = '',
          keyword = '';

      posts = category.related('posts');
      _page2 = _url2.default.parse(req.url, true).query.page >> 0 || 1;

      var i = 0;
      for (; i < posts.toJSON().length; i++) {
        description += posts.toJSON()[i].title;

        if (i !== posts.toJSON().length - 1) {
          description += ', ';
        }
      }

      i = 0;
      for (; i < fetchedCategories.length; i++) {
        keyword += fetchedCategories[i].name;

        if (i !== fetchedCategories.length - 1) {
          keyword += ', ';
        }
      }

      res.render('posts/index', {
        req: req,
        title: 'Jaewonism - POST',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: description.substring(0, 255),
        keyword: keyword,
        userId: req.user ? req.user.user_id : null,
        authFlash: req.flash('auth'),
        infoFlash: req.flash('info'),
        categories: fetchedCategories,
        categoryId: req.params.id,
        category: category.toJSON(),
        posts: posts.toJSON(),
        pages: pages,
        page: _page2,
        endPoint: 'categories'
      });
    } else {
      res.redirect('/posts');
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Tag
router.get('/tags/:slug', getCategories, function (req, res, next) {
  _models2.default.Tag.forge({ slug: req.params.slug }).fetch({ withRelated: [{
      'posts': function posts(qb) {
        var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

        if (typeof page === 'number' && page > 0) {
          var offset = (page - 1) * pagingSize;

          qb.offset(offset).limit(pagingSize);
        }
        qb.orderBy('id', 'DESC');
      }
    }] }).then(function (tag) {
    if (tag) {
      var posts = void 0,
          _page3 = void 0,
          description = '',
          keyword = '';

      posts = tag.related('posts');
      _page3 = _url2.default.parse(req.url, true).query.page >> 0 || 1;

      var i = 0;
      for (; i < posts.toJSON().length; i++) {
        description += posts.toJSON()[i].title;

        if (i !== posts.toJSON().length - 1) {
          description += ', ';
        }
      }

      i = 0;
      for (; i < fetchedCategories.length; i++) {
        keyword += fetchedCategories[i].name;

        if (i !== fetchedCategories.length - 1) {
          keyword += ', ';
        }
      }

      res.render('posts/index', {
        req: req,
        title: 'Jaewonism - POST',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: description.substring(0, 255),
        keyword: keyword,
        userId: req.user ? req.user.user_id : null,
        authFlash: req.flash('auth'),
        infoFlash: req.flash('info'),
        categories: fetchedCategories,
        categoryId: 0,
        posts: posts.toJSON(),
        tag: tag.toJSON(),
        tagSlug: req.params.slug,
        pages: pages,
        page: _page3,
        endPoint: 'tags'
      });
    } else {
      res.redirect('/posts');
    }
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Tag
router.get('/search/:keyword', getCategories, function (req, res, next) {
  _collections2.default.Posts.forge().query('where', 'is_deleted', 0).query(function (qb) {
    qb.where('title', 'LIKE', '%' + req.params.keyword + '%');
    qb.orWhere('text', 'LIKE', '%' + req.params.keyword + '%');

    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      var offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  }).fetch().then(function (posts) {
    var page = _url2.default.parse(req.url, true).query.page >> 0 || 1,
        description = '',
        keyword = '';

    var i = 0;
    for (; i < posts.toJSON().length; i++) {
      description += posts.toJSON()[i].title;

      if (i !== posts.toJSON().length - 1) {
        description += ', ';
      }
    }

    i = 0;
    for (; i < fetchedCategories.length; i++) {
      keyword += fetchedCategories[i].name;

      if (i !== fetchedCategories.length - 1) {
        keyword += ', ';
      }
    }

    res.render('posts/index', {
      req: req,
      title: 'Jaewonism - POST',
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: description.substring(0, 255),
      keyword: keyword,
      userId: req.user ? req.user.user_id : null,
      authFlash: req.flash('auth'),
      infoFlash: req.flash('info'),
      categories: fetchedCategories,
      categoryId: 0,
      posts: posts.toJSON(),
      pages: pages,
      page: page,
      endPoint: 'search'
    });
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

saveTags = function saveTags(tags) {
  var tagObjects = tags.map(function (tag) {
    return {
      name: tag,
      slug: tag.replace(/ /g, '-').toLowerCase()
    };
  });

  return _collections2.default.Tags.forge().query('whereIn', 'slug', _lodash2.default.map(tagObjects, 'slug')).fetch().then(function (existingTags) {
    var doNotExist = [];
    existingTags = existingTags.toJSON();

    if (existingTags.length > 0) {
      (function () {
        var existingSlugs = _lodash2.default.map(existingTags, 'slug');
        doNotExist = tagObjects.filter(function (t) {
          return existingSlugs.indexOf(t.slug) < 0;
        });
      })();
    } else {
      doNotExist = tagObjects;
    }

    return new _collections2.default.Tags(doNotExist).mapThen(function (model) {
      return model.save().then(function () {
        return model.get('id');
      });
    }).then(function (ids) {
      return _lodash2.default.union(ids, _lodash2.default.map(existingTags, 'id'));
    });
  });
};

module.exports = router;