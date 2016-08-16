'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

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
    _models2.default.users.findById(req.user.id).then(function (user) {
      if (req.route.path.match(userCheckingReg)) {
        if (+user.level === 99) {
          userPk = user.id;
          return getCategories(req, res, next);
        } else {
          req.flash('auth', '권한이 없습니다.');
          return res.redirect('/posts');
        }
      } else {
        userPk = user.id;
        return getCategories(req, res, next);
      }
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  } else {
    if (req.route.path.match(userCheckingReg)) {
      req.flash('auth', '포스트를 작성하려면 로그인을 해야합니다.');
      return res.redirect('/login');
    } else {
      userPk = 0;
      return getCategories(req, res, next);
    }
  }
};

getCategories = function getCategories(req, res, next) {
  _models2.default.categories.findAll({
    where: { is_deleted: 0 }
  }).then(function (categories) {
    fetchedCategories = categories;

    if (req.url.match(/\/categories\//)) {
      return getPagesWithCategory(req, res, next);
    } else if (req.url.match(/\/tags\//)) {
      return getPagesWithTag(req, res, next);
    } else if (req.url.match(/\/search\//)) {
      return getPagesWithSearch(req, res, next);
    } else {
      return getPages(req, res, next);
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

getPages = function getPages(req, res, next) {
  _models2.default.posts.count({
    where: { is_deleted: 0 }
  }).then(function (count) {
    pages = Math.ceil(count / pagingSize);
    return next();
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

getPagesWithCategory = function getPagesWithCategory(req, res, next) {
  _models2.default.posts.count({
    where: { category_id: req.params.id, is_deleted: 0 }
  }).then(function (count) {
    pages = Math.ceil(count / pagingSize);
    return next();
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

getPagesWithTag = function getPagesWithTag(req, res, next) {
  _models2.default.tags.findAll({
    where: { slug: req.params.slug },
    include: [{ model: _models2.default.posts, where: { is_deleted: 0 } }]
  }).then(function (tag) {
    pages = Math.ceil((tag[0] && tag[0].posts ? tag[0].posts.length : 0) / pagingSize);
    return next();
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

getPagesWithSearch = function getPagesWithSearch(req, res, next) {
  _models2.default.posts.count({
    where: {
      is_deleted: 0,
      $and: {
        $or: [{ title: { $like: '%' + req.params.keyword + '%' } }, { text: { $like: '%' + req.params.keyword + '%' } }]
      }
    }
    // where: { is_deleted: 0 }
  }).then(function (count) {
    pages = Math.ceil(count / pagingSize);
    return next();
  }).catch(function (err) {
    return next(err, req, res, next);
  });
};

// Fetch all Posts
router.get('/', getCategories, function (req, res, next) {
  var page = +_url2.default.parse(req.url, true).query.page || 1;
  var offset = (page - 1) * pagingSize;

  _models2.default.posts.findAll({
    where: { is_deleted: 0 },
    offset: offset,
    limit: pagingSize,
    order: 'id DESC'
  }).then(function (posts) {
    var description = '',
        keyword = '';

    for (var i = 0, len = posts.length; i < len; i++) {
      description += posts[i].title;
      if (i !== posts.length - 1) {
        description += ', ';
      }
    }

    for (var _i = 0, _len = fetchedCategories.length; _i < _len; _i++) {
      keyword += fetchedCategories[_i].name;

      if (_i !== fetchedCategories.length - 1) {
        keyword += ', ';
      }
    }

    return res.render('posts/index', {
      title: 'Jaewonism - POST',
      asset: 'posts',
      mode: _config2.default.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: description.substring(0, 255),
      keyword: keyword,
      userId: req.user ? req.user.user_id : null,
      authFlash: req.flash('auth'),
      infoFlash: req.flash('info'),
      categories: fetchedCategories,
      categoryId: 0,
      posts: posts,
      pages: pages,
      page: page,
      endPoint: 'root'
    });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Create Post
router.get('/new', isAuthor, function (req, res, next) {
  _models2.default.categories.findAll({
    where: { is_deleted: 0 }
  }).then(function (categories) {
    var page = +_url2.default.parse(req.url, true).query.page || 1;

    return res.render('posts/new', {
      title: 'Jaewonism - NEW POST',
      asset: 'posts',
      mode: _config2.default.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      categories: categories,
      page: page
    });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Create Post
router.post('/new', isAuthor, function (req, res, next) {
  var tags = void 0,
      postTitle = void 0,
      newSlug = void 0;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/\s/g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map(function (tag) {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  _async2.default.waterfall([function (cb) {
    _models2.default.posts.findAll({
      where: { title: postTitle }
    }).then(function (posts) {
      return cb(null, posts);
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  }, function (posts, cb) {
    var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

    if (posts) {
      var numberForSlug = posts.length + 1;

      newSlug = newSlug + '-' + numberForSlug;
    }

    _models2.default.posts.create({
      user_id: userPk,
      category_id: req.body.category_id,
      title: postTitle,
      thumbnail: req.body.thumbnail,
      background_image: req.body.background_image,
      slug: newSlug,
      html: req.body.html,
      text: req.body.html.replace(/<[^>]*>/g, ''),
      created_at: dateStr,
      updated_at: dateStr
    }).then(function (post) {
      saveTags(tags, function (ids) {
        return cb(null, post, ids);
      });
    }).catch(function (err) {
      return cb(err);
    });
  }, function (post, ids, cb) {
    ids.forEach(function (el, i) {
      _models2.default.posts_tags.create({
        post_id: post.id,
        tag_id: el
      }).then(function (p_t) {
        if (ids.length - 1 === i) {
          return cb(null, true);
        }
      }).catch(function (err) {
        return cb(err);
      });
    });
  }], function (err, result) {
    if (err) {
      return next(err, req, res, next);
    } else {
      return res.redirect('/posts');
    }
  });
});

// Fetch Post
router.get('/:id', isAuthor, function (req, res, next) {
  _models2.default.posts.find({
    where: { id: req.params.id, is_deleted: 0 },
    include: [_models2.default.users, _models2.default.categories, _models2.default.tags, { model: _models2.default.comments, include: [_models2.default.users] }]
  }).then(function (post) {
    if (!post) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      var author = void 0,
          _category = void 0,
          tags = void 0,
          page = void 0,
          comments = void 0,
          description = void 0,
          keyword = '';

      author = post.users;
      _category = post.category;
      tags = post.tags;
      page = +_url2.default.parse(req.url, true).query.page || 1;
      comments = post.comments;
      description = post.text;

      var i = 0;
      for (; i < tags.length; i++) {
        keyword += tags[i].name;

        if (i !== tags.length - 1) {
          keyword += ', ';
        }
      }

      return res.render('posts/show', {
        title: 'Jaewonism - POST : ' + post.title,
        asset: 'posts',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: description.substring(0, 255),
        keyword: keyword,
        author: author,
        userId: req.user ? req.user.user_id : null,
        userPk: userPk || 0,
        authFlash: req.flash('auth'),
        infoFlash: req.flash('info'),
        post: post,
        comments: comments || null,
        categories: fetchedCategories,
        category: _category,
        tags: tags,
        page: page
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Update Post
router.get('/update/:id', isAuthor, function (req, res, next) {
  _async2.default.waterfall([function (cb) {
    _models2.default.posts.find({
      where: { id: req.params.id, is_deleted: 0 },
      include: [_models2.default.categories, _models2.default.tags]
    }).then(function (post) {
      if (!post) {
        return cb(null, null);
      } else {
        return cb(null, post);
      }
    }).catch(function (err) {
      return cb(err);
    });
  }, function (post, cb) {
    if (!post) {
      return cb(null, null);
    } else {
      _models2.default.categories.findAll({
        where: { is_deleted: 0 }
      }).then(function (categories) {
        var result = {};

        result.post = post;
        result.categories = categories;

        return cb(null, result);
      }).catch(function (err) {
        return cb(err);
      });
    }
  }], function (err, result) {
    if (err) {
      return next(err, req, res, next);
    } else {
      if (result) {
        var _category2 = void 0,
            tags = void 0,
            page = void 0;

        _category2 = result.post.category;
        tags = result.post.tags;
        page = +_url2.default.parse(req.url, true).query.page || 1;

        return res.render('posts/update', {
          title: 'Jaewonism - MODIFY POST',
          asset: 'posts',
          mode: _config2.default.mode,
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          post: result.post,
          categories: result.categories,
          category: _category2,
          tags: tags,
          page: page
        });
      } else {
        return res.status(404).render('404', { title: '404: Page Not Found.' });
      }
    }
  });
});

// Update Post
router.post('/update/:id', isAuthor, function (req, res, next) {
  var tags = void 0,
      postTitle = void 0,
      newSlug = void 0;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/\s/g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map(function (tag) {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  _async2.default.waterfall([function (cb) {
    _models2.default.posts.findAll({
      where: { title: postTitle }
    }).then(function (posts) {
      return cb(null, posts);
    }).catch(function (err) {
      return cb(err);
    });
  }, function (posts, cb) {
    var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

    if (posts) {
      var numberForSlug = posts.length + 1;

      newSlug = newSlug.replace(/\s\-\s\d+$/, '') + ' - ' + numberForSlug;
    }

    _models2.default.posts.update({
      user_id: userPk,
      category_id: req.body.category_id,
      title: postTitle,
      thumbnail: req.body.thumbnail,
      background_image: req.body.background_image,
      slug: newSlug,
      html: req.body.html,
      text: req.body.html.replace(/<[^>]*>/g, ''),
      created_at: dateStr,
      updated_at: dateStr
    }, {
      where: { id: req.params.id }
    }).then(function (post) {
      saveTags(tags, function (ids) {
        return cb(null, req.params.id, ids);
      });
    }).catch(function (err) {
      return cb(err);
    });
  }, function (postId, ids, cb) {
    ids.forEach(function (el, i) {
      _models2.default.posts_tags.create({
        post_id: postId,
        tag_id: el
      }).then(function (p_t) {
        if (ids.length - 1 === i) {
          return cb(null, true);
        }
      }).catch(function (err) {
        return cb(err);
      });
    });
  }], function (err, result) {
    if (err) {
      return next(err, req, res, next);
    } else {
      req.flash('auth', '포스트 수정이 완료되었습니다.');
      return res.redirect('/posts/' + req.params.id);
    }
  });
});

// Form for Delete Post
router.get('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.posts.find({
    where: { id: req.params.id },
    include: [_models2.default.categories]
  }).then(function (post) {
    if (!post) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      var page = _url2.default.parse(req.url, true).query.page >> 0 || 1;

      return res.render('posts/delete', {
        title: 'Jaewonism - DELETE POST',
        asset: 'posts',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null,
        categories: post.categories,
        post: post,
        page: page
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Delete Post
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  _models2.default.posts.update({
    is_deleted: 1,
    updated_at: dateStr
  }, {
    where: { id: req.params.id }
  }).then(function (post) {
    return res.redirect('/posts');
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Fetch all Posts from a single Category
router.get('/categories/:id', getCategories, function (req, res, next) {
  var page = +_url2.default.parse(req.url, true).query.page || 1;
  var offset = (page - 1) * pagingSize;

  _models2.default.categories.find({
    where: { id: req.params.id },
    include: [{ model: _models2.default.posts, where: { is_deleted: 0 }, offset: offset, limit: pagingSize }]
  }).then(function (category) {
    if (!category) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      var posts = void 0,
          description = '',
          keyword = '';

      posts = category.posts;

      for (var i = 0, len = posts.length; i < len; i++) {
        description += posts[i].title;
        if (i !== posts.length - 1) {
          description += ', ';
        }
      }

      for (var _i2 = 0, _len2 = fetchedCategories.length; _i2 < _len2; _i2++) {
        keyword += fetchedCategories[_i2].name;

        if (_i2 !== fetchedCategories.length - 1) {
          keyword += ', ';
        }
      }

      return res.render('posts/index', {
        title: 'Jaewonism - POST',
        asset: 'posts',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: description.substring(0, 255),
        keyword: keyword,
        userId: req.user ? req.user.user_id : null,
        authFlash: req.flash('auth'),
        infoFlash: req.flash('info'),
        categories: fetchedCategories,
        categoryId: req.params.id,
        category: category,
        posts: posts,
        pages: pages,
        page: page,
        endPoint: 'categories'
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Fetch all Posts from a single Tag
router.get('/tags/:slug', getCategories, function (req, res, next) {
  var page = +_url2.default.parse(req.url, true).query.page || 1;
  var offset = (page - 1) * pagingSize;

  _models2.default.tags.find({
    where: { slug: req.params.slug },
    include: [{ model: _models2.default.posts, where: { is_deleted: 0 }, offset: offset, limit: pagingSize }]
  }).then(function (tag) {
    if (!category) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      var posts = void 0,
          description = '',
          keyword = '';

      posts = tag.posts;

      for (var i = 0, len = posts.length; i < len; i++) {
        description += posts[i].title;

        if (i !== posts.length - 1) {
          description += ', ';
        }
      }

      for (var _i3 = 0, _len3 = fetchedCategories.length; _i3 < _len3; _i3++) {
        keyword += fetchedCategories[_i3].name;

        if (_i3 !== fetchedCategories.length - 1) {
          keyword += ', ';
        }
      }

      return res.render('posts/index', {
        title: 'Jaewonism - POST',
        asset: 'posts',
        mode: _config2.default.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: description.substring(0, 255),
        keyword: keyword,
        userId: req.user ? req.user.user_id : null,
        authFlash: req.flash('auth'),
        infoFlash: req.flash('info'),
        categories: fetchedCategories,
        categoryId: 0,
        posts: posts,
        tag: tag,
        tagSlug: req.params.slug,
        pages: pages,
        page: page,
        endPoint: 'tags'
      });
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Fetch all Posts from a single Tag
router.get('/search/:keyword', getCategories, function (req, res, next) {
  var page = +_url2.default.parse(req.url, true).query.page || 1;
  var offset = (page - 1) * pagingSize;

  _models2.default.posts.findAll({
    where: {
      is_deleted: 0,
      $and: {
        $or: [{ title: { $like: '%' + req.params.keyword + '%' } }, { text: { $like: '%' + req.params.keyword + '%' } }]
      }
    }
  }).then(function (posts) {
    var description = '',
        keyword = '';

    for (var i = 0, len = posts.length; i < len; i++) {
      description += posts[i].title;

      if (i !== posts.length - 1) {
        description += ', ';
      }
    }

    for (var _i4 = 0, _len4 = fetchedCategories.length; _i4 < _len4; _i4++) {
      keyword += fetchedCategories[_i4].name;

      if (_i4 !== fetchedCategories.length - 1) {
        keyword += ', ';
      }
    }

    return res.render('posts/index', {
      title: 'Jaewonism - POST',
      asset: 'posts',
      mode: _config2.default.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: description.substring(0, 255),
      keyword: keyword,
      userId: req.user ? req.user.user_id : null,
      authFlash: req.flash('auth'),
      infoFlash: req.flash('info'),
      categories: fetchedCategories,
      categoryId: 0,
      posts: posts,
      pages: pages,
      page: page,
      endPoint: 'search'
    });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

saveTags = function saveTags(tags, afterSave) {
  var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
  var tagObjects = tags.map(function (tag) {
    return {
      name: tag,
      slug: tag.replace(/ /g, '-').toLowerCase()
    };
  });

  _async2.default.waterfall([function (cb) {
    _models2.default.tags.findAll({
      where: { slug: { $in: _lodash2.default.map(tagObjects, 'slug') } }
    }).then(function (existingTags) {
      var doNotExist = [];
      var ids = [];

      if (existingTags.length) {
        (function () {
          var existingSlugs = _lodash2.default.map(existingTags, 'slug');

          doNotExist = tagObjects.filter(function (t) {
            return existingSlugs.indexOf(t.slug) < 0;
          });
        })();
      } else {
        doNotExist = tagObjects;
      }

      if (doNotExist.length) {
        doNotExist.forEach(function (el, i) {
          el.created_at = dateStr;
          el.updated_at = dateStr;

          return _models2.default.tags.create(el).then(function (t) {
            ids.push(t.id);
            if (doNotExist.length - 1 === i) {
              return cb(null, _lodash2.default.union(ids, _lodash2.default.map(existingTags, 'id')));
            }
          }).catch(function (err) {
            throw err;
          });
        });
      } else {
        return cb(null, _lodash2.default.map(existingTags, 'id'));
      }
    }).catch(function (err) {
      return cb(err);
    });
  }], function (err, result) {
    if (err) {
      throw err;
    } else {
      return afterSave(result);
    }
  });
};

module.exports = router;