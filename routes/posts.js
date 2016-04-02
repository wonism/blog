var express = require('express');
var router = express.Router();

var url = require('url');

var pool = require('../config/dbconfig');
var orm = require('sequelize');
var _ = require('lodash');

var models = require('../db/models');
var collections = require('../db/collections');

var userPk, fetchedCategories;
var isAuthor, getCategories, getPages, getPagesWithCategory, saveTags;
var userCheckingArr = ['/new', '/update', '/delete'];
var userCheckingReg = new RegExp(userCheckingArr.join("|"));

var pages;
var fetchedCategories;
var pagingSize = 10;

isAuthor = function (req, res, next) {
  if (req.user) {
    models.User.forge({ user_id: req.user ? req.user.user_id : null })
    .fetch()
    .then(function (user) {
      if (req.route.path.match(userCheckingReg)) {
        if ((user.toJSON().level >> 0) === 99) {
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
    })
    .catch(function (err) {
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

getCategories = function (req, res, next) {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then(function (categories) {
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
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPages = function (req, res, next) {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .count()
  .then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithCategory = function (req, res, next) {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .query('where', 'category_id', req.params.id)
  .count()
  .then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithTag = function (req, res, next) {
  models.Tag.forge({ slug: req.params.slug })
  .fetch(
      { withRelated: [
        {
          'posts': function (qb) { qb.select('posts.id'); },
        }
      ]}
  )
  .then(function (tag) {
    var posts = tag.related('posts');
    pages = Math.ceil(posts.length / pagingSize);
    next();
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithSearch = function (req, res, next) {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .query(function (qb) {
    qb.where('title', 'LIKE', '%' + req.params.keyword + '%');
    qb.orWhere('text', 'LIKE', '%' + req.params.keyword + '%');
  })
  .count()
  .then(function (count) {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
}

// Fetch all Posts
router.get('/', getCategories, function (req, res, next) {
  collections.Posts.forge()
  .query('where', 'is_deleted', 0)
  .query(function (qb) {
    var page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      var offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then(function (posts) {
    var page = url.parse(req.url, true).query.page >> 0 || 1;

    res.render('posts/index',
        {
          req: req,
          title: 'Jaewonism - POST',
          userId: req.user ? req.user.user_id : null,
          authFlash: req.flash('auth'),
          infoFlash: req.flash('info'),
          categories: fetchedCategories,
          categoryId: 0,
          posts: posts.toJSON(),
          pages: pages,
          page: page,
          endPoint: 'root'
        }
    );
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Create Post
router.get('/new', isAuthor, function (req, res, next) {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then(function (categories) {
    var page = url.parse(req.url, true).query.page >> 0 || 1;
    res.render('posts/new',
        {
          req: req,
          title: 'Jaewonism - NEW POST',
          userId: req.user ? req.user.user_id : null,
          categories: categories.toJSON(),
          page: page
        }
    );
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Create Post
router.post('/new', isAuthor, function (req, res, next) {
  var tags, postTitle, newSlug;

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

  collections.Posts.forge()
  .query('where', 'title', postTitle)
  .fetch()
  .then(function (posts) {
    if (posts !== null) {
      var numberForSlug = posts.toJSON().length + 1;

      newSlug = newSlug + '-' + numberForSlug;
    }

    models.Post.forge({
      user_id: userPk,
      category_id: req.body.category_id,
      title: postTitle,
      thumbnail: req.body.thumbnail,
      background_image: req.body.background_image,
      slug: newSlug,
      html: req.body.html,
      text: req.body.html.replace(/<[^>]*>/, '')
    })
    .save()
    .then(function (post) {
      saveTags(tags)
      .then(function (ids) {
        post.load(['tags'])
        .then(function (tags) {
          tags.tags().attach(ids);
          res.redirect('/posts');
        })
        .catch(function (err) {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      })
      .catch(function (err) {
        console.log(err.message);
        res.render('500', { title: '500: Internal Server Error.' });
      });
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    })
  }).catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch Post
router.get('/:id', isAuthor, function (req, res, next) {
  models.Post.forge({ id: req.params.id, is_deleted: 0 })
  .fetch(
      { withRelated: [
        {
          'author': function (qb) { },
          'category': function (qb) { },
          'tags': function (qb) { },
          'comments': function (qb) { qb.orderBy('id', 'DESC'); },
          'comments.user': function (qb) { qb.select('users.id', 'users.name'); }
        }
      ]}
  )
  .then(function (post) {
    if (!post) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      var author, category, tags, page, comments;

      author = post.related('author');
      category = post.related('category');
      tags = post.related('tags');
      page = url.parse(req.url, true).query.page >> 0 || 1;
      comments = post.related('comments');

      res.render('posts/show',
          {
            req: req,
            title: 'Jaewonism - POST : ' + post.toJSON().title,
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
            page: page
          }
      );
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Update Post
router.get('/update/:id', isAuthor, function (req, res, next) {
  models.Post.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ withRelated: ['category', 'tags'] })
  .then(function (post) {
    if (!post) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      var category, tags, page;

      page = url.parse(req.url, true).query.page >> 0 || 1;

      collections.Categories.forge()
      .query('where', 'is_deleted', 0)
      .fetch()
      .then(function (categories) {
        if (post.toJSON().user_id >> 0 === userPk >> 0) {
          category = post.related('category');
          tags = post.related('tags');

          res.render('posts/update',
              {
                req: req,
                title: 'Jaewonism - MODIFY POST',
                userId: req.user ? req.user.user_id : null,
                post: post.toJSON(),
                categories: categories.toJSON(),
                category: category.toJSON(),
                tags: tags.toJSON(),
                page: page
              }
          );
        } else {
          req.flash('auth', '권한이 없습니다.');
          res.redirect('/posts/' + req.params.id);
        }
      })
      .catch(function (err) {
        console.log(err.message);
        res.render('500', { title: '500: Internal Server Error.' });
      });
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Update Post
router.post('/update/:id', isAuthor, function (req, res, next) {
  var tags, postTitle, newSlug;

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

  collections.Posts.forge()
  .query('where', 'title', postTitle)
  .fetch()
  .then(function (posts) {
    if (posts !== null) {
      var numberForSlug = posts.toJSON().length + 1;

      newSlug = newSlug + '-' + numberForSlug;
    }

    models.Post.forge({ id: req.params.id, is_deleted: 0 })
    .fetch({ require: true })
    .then(function (post) {
      if (post.toJSON().user_id >> 0 === userPk >> 0) {
        post.save({
          category_id: req.body.category_id || post.get('category_id'),
          title: req.body.title || post.get('title'),
          slug: newSlug,
          thumbnail: req.body.thumbnail || post.get('thumbnail'),
          background_image: req.body.background_image || post.get('background_image'),
          html: req.body.html || post.get('html'),
          text: req.body.html.replace(/<[^>]*>/, '') || post.get('html').replace(/<[^>]*>/, '')
        })
        .then(function (post) {
          saveTags(tags)
          .then(function (ids) {
            post.load(['tags'])
            .then(function (tags) {
              var tagArr, tagCounter;

              tagArr = post.related('tags').toJSON();

              tagCounter = 0;
              for (; tagCounter < tagArr.length; tagCounter++) {
                tags.tags().detach(tagArr[tagCounter].id);
              }

              tags.tags().attach(ids);

              req.flash('auth', '포스트 수정이 완료되었습니다.');
              res.redirect('/posts/' + req.params.id);
            })
            .catch(function (err) {
              console.log(err.message);
              res.render('500', { title: '500: Internal Server Error.' });
            });
          })
          .catch(function (err) {
            console.log(err.message);
            res.render('500', { title: '500: Internal Server Error.' });
          });
        })
        .catch(function (err) {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      } else {
        req.flash('auth', '잘못된 접근입니다.');
        res.redirect('/posts/' + req.params.id);
      }
    })
    .catch(function (err) {
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
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then(function (categories) {
    models.Post.forge({ id: req.params.id, is_deleted: 0 })
    .fetch()
    .then(function (post) {
      if (!post) {
        res.render('404', { title: '404: Page Not Found.'});
      } else {
        page = url.parse(req.url, true).query.page >> 0 || 1;

        res.render('posts/delete',
            {
              req: req,
              title: 'Jaewonism - DELETE POST',
              userId: req.user ? req.user.user_id : null,
              categories: categories.toJSON(),
              post: post.toJSON(),
              page: page
            }
        );
      }
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Delete Post
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  models.Post.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ require: true })
  .then(function (post) {
    post.save({
      is_deleted: 1
    })
    .then(function () {
      res.redirect('/posts');
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Category
router.get('/categories/:id', getCategories, function (req, res, next) {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch(
      { withRelated: [
        {
          'posts': function (qb) {
            var page = url.parse(req.url, true).query.page >> 0 || 1;

            if (typeof page === 'number' && page > 0) {
              var offset = (page - 1) * pagingSize;

              qb.offset(offset).limit(pagingSize);
            }

            qb.orderBy('id', 'DESC');
          }
        }
      ]}
  )
  .then(function (category) {
    if (category) {
      var posts, page;

      posts = category.related('posts');
      page = url.parse(req.url, true).query.page >> 0 || 1;

      res.render('posts/index',
          {
            req: req,
            title: 'Jaewonism - POST',
            userId: req.user ? req.user.user_id : null,
            authFlash: req.flash('auth'),
            infoFlash: req.flash('info'),
            categories: fetchedCategories,
            categoryId: req.params.id,
            category: category.toJSON(),
            posts: posts.toJSON(),
            pages: pages,
            page: page,
            endPoint: 'categories'
          }
      );
    } else {
      res.redirect('/posts');
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Tag
router.get('/tags/:slug', getCategories, function (req, res, next) {
  models.Tag.forge({ slug: req.params.slug })
  .fetch(
      { withRelated: [
        {
          'posts': function (qb) {
            var page = url.parse(req.url, true).query.page >> 0 || 1;

            if (typeof page === 'number' && page > 0) {
              var offset = (page - 1) * pagingSize;

              qb.offset(offset).limit(pagingSize);
            }
            qb.orderBy('id', 'DESC');
          }
        }
      ]}
  )
  .then(function (tag) {
    if (tag) {
      var posts, page;

      posts = tag.related('posts');
      page = url.parse(req.url, true).query.page >> 0 || 1;

      res.render('posts/index',
          {
            req: req,
            title: 'Jaewonism - POST',
            userId: req.user ? req.user.user_id : null,
            authFlash: req.flash('auth'),
            infoFlash: req.flash('info'),
            categories: fetchedCategories,
            categoryId: 0,
            posts: posts.toJSON(),
            tag: tag.toJSON(),
            tagSlug: req.params.slug,
            pages: pages,
            page: page,
            endPoint: 'tags'
          }
      );
    } else {
      res.redirect('/posts');
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Tag
router.get('/search/:keyword', getCategories, function (req, res, next) {
  collections.Posts.forge()
  .query('where', 'is_deleted', 0)
  .query(function (qb) {
    qb.where('title', 'LIKE', '%' + req.params.keyword + '%');
    qb.orWhere('text', 'LIKE', '%' + req.params.keyword + '%');

    var page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      var offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then(function (posts) {
    var page = url.parse(req.url, true).query.page >> 0 || 1;

    res.render('posts/index',
        {
          req: req,
          title: 'Jaewonism - POST',
          userId: req.user ? req.user.user_id : null,
          authFlash: req.flash('auth'),
          infoFlash: req.flash('info'),
          categories: fetchedCategories,
          categoryId: 0,
          posts: posts.toJSON(),
          pages: pages,
          page: page,
          endPoint: 'search'
        }
    );
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

saveTags = function (tags) {
  var tagObjects = tags.map(function (tag) {
    return {
      name: tag,
      slug: tag.replace(/ /g, '-').toLowerCase()
    };
  });

  return collections.Tags.forge()
  .query('whereIn', 'slug', _.map(tagObjects, 'slug'))
  .fetch()
  .then(function (existingTags) {
    var doNotExist = [];
    existingTags = existingTags.toJSON();

    if (existingTags.length > 0) {
      var existingSlugs = _.map(existingTags, 'slug');
      doNotExist = tagObjects.filter(function (t) {
        return existingSlugs.indexOf(t.slug) < 0;
      });
    } else {
      doNotExist = tagObjects;
    }

    return new collections.Tags(doNotExist).mapThen(function (model) {
      return model.save()
      .then(function () {
        return model.get('id');
      });
    })
    .then(function (ids) {
      return _.union(ids, _.map(existingTags, 'id'));
    });
  });
};

module.exports = router;

