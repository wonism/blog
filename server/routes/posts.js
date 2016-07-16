import express from 'express';

import url from 'url';
import _ from 'lodash';

import models from '../../db/models';
import collections from '../../db/collections';

import config from '../../config/config.json';

const router = express.Router();

let userPk, fetchedCategories;
let isAuthor, getCategories, getPages, getPagesWithCategory, saveTags, getPagesWithTag, getPagesWithSearch;
let userCheckingArr = ['/new', '/update', '/delete'];
let userCheckingReg = new RegExp(userCheckingArr.join("|"));

let pages;
let pagingSize = 10;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.User.forge({ user_id: req.user.user_id })
    .fetch()
    .then((user) => {
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
    .catch((err) => {
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

getCategories = (req, res, next) => {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then((categories) => {
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
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPages = (req, res, next) => {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .count()
  .then((count) => {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithCategory = (req, res, next) => {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .query('where', 'category_id', req.params.id)
  .count()
  .then((count) => {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithTag = (req, res, next) => {
  models.Tag.forge({ slug: req.params.slug })
  .fetch(
      { withRelated: [
        {
          'posts': (qb) => { qb.select('posts.id'); },
        }
      ]}
  )
  .then((tag) => {
    let posts = tag.related('posts');
    pages = Math.ceil(posts.length / pagingSize);
    next();
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
};

getPagesWithSearch = (req, res, next) => {
  collections.Posts.forge({ id: 1 })
  .query('where', 'is_deleted', 0)
  .query((qb) => {
    qb.where('title', 'LIKE', '%' + req.params.keyword + '%');
    qb.orWhere('text', 'LIKE', '%' + req.params.keyword + '%');
  })
  .count()
  .then((count) => {
    pages = Math.ceil(count / pagingSize);
    next();
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
}

// Fetch all Posts
router.get('/', getCategories, (req, res, next) => {
  collections.Posts.forge()
  .query('where', 'is_deleted', 0)
  .query((qb) => {
    let page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      let offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then((posts) => {
    let page = url.parse(req.url, true).query.page >> 0 || 1, description = '', keyword = '';

    let i = 0;
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

    res.render('posts/index',
        {
          title: 'Jaewonism - POST',
          asset: 'posts',
          mode: config.mode,
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
        }
    );
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Create Post
router.get('/new', isAuthor, (req, res, next) => {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then((categories) => {
    let page = url.parse(req.url, true).query.page >> 0 || 1;

    res.render('posts/new',
        {
          title: 'Jaewonism - NEW POST',
          asset: 'posts',
          mode: config.mode,
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          categories: categories.toJSON(),
          page: page
        }
    );
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Create Post
router.post('/new', isAuthor, (req, res, next) => {
  let tags, postTitle, newSlug;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/ /g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map((tag) => {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  collections.Posts.forge()
  .query('where', 'title', postTitle)
  .fetch()
  .then((posts) => {
    if (posts !== null) {
      let numberForSlug = posts.toJSON().length + 1;

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
      text: req.body.html.replace(/<[^>]*>/g, '')
    })
    .save()
    .then((post) => {
      saveTags(tags)
      .then((ids) => {
        post.load(['tags'])
        .then((tags) => {
          tags.tags().attach(ids);
          res.redirect('/posts');
        })
        .catch((err) => {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      })
      .catch((err) => {
        console.log(err.message);
        res.render('500', { title: '500: Internal Server Error.' });
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    })
  }).catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch Post
router.get('/:id', isAuthor, (req, res, next) => {
  models.Post.forge({ id: req.params.id, is_deleted: 0 })
  .fetch(
      { withRelated: [
        {
          'author': (qb) => { },
          'category': (qb) => { },
          'tags': (qb) => { },
          'comments': (qb) => { qb.orderBy('id', 'DESC'); },
          'comments.user': (qb) => { qb.select('users.id', 'users.name'); }
        }
      ]}
  )
  .then((post) => {
    if (!post) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      let author, category, tags, page, comments, description, keyword = '';

      author = post.related('author');
      category = post.related('category');
      tags = post.related('tags');
      page = url.parse(req.url, true).query.page >> 0 || 1;
      comments = post.related('comments');
      description = post.toJSON().text;

      let i = 0;
      for (; i < tags.toJSON().length; i++) {
        keyword += tags.toJSON()[i].name;

        if (i !== tags.toJSON().length - 1) {
          keyword += ', ';
        }
      }

      res.render('posts/show',
          {
            title: 'Jaewonism - POST : ' + post.toJSON().title,
            asset: 'posts',
            mode: config.mode,
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
            page: page
          }
      );
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Update Post
router.get('/update/:id', isAuthor, (req, res, next) => {
  models.Post.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ withRelated: ['category', 'tags'] })
  .then((post) => {
    if (!post) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      let category, tags, page;

      page = url.parse(req.url, true).query.page >> 0 || 1;

      collections.Categories.forge()
      .query('where', 'is_deleted', 0)
      .fetch()
      .then((categories) => {
        if (post.toJSON().user_id >> 0 === userPk >> 0) {
          category = post.related('category');
          tags = post.related('tags');

          res.render('posts/update',
              {
                title: 'Jaewonism - MODIFY POST',
                asset: 'posts',
                mode: config.mode,
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
              }
          );
        } else {
          req.flash('auth', '권한이 없습니다.');
          res.redirect('/posts/' + req.params.id);
        }
      })
      .catch((err) => {
        console.log(err.message);
        res.render('500', { title: '500: Internal Server Error.' });
      });
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Update Post
router.post('/update/:id', isAuthor, (req, res, next) => {
  let tags, postTitle, newSlug;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/ /g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map((tag) => {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  collections.Posts.forge()
  .query('where', 'title', postTitle)
  .fetch()
  .then((posts) => {
    if (posts !== null) {
      let numberForSlug = posts.toJSON().length + 1;

      newSlug = newSlug + '-' + numberForSlug;
    }

    models.Post.forge({ id: req.params.id, is_deleted: 0 })
    .fetch({ require: true })
    .then((post) => {
      if (post.toJSON().user_id >> 0 === userPk >> 0) {
        post.save({
          category_id: req.body.category_id || post.get('category_id'),
          title: req.body.title || post.get('title'),
          slug: newSlug,
          thumbnail: req.body.thumbnail || post.get('thumbnail'),
          background_image: req.body.background_image || post.get('background_image'),
          html: req.body.html || post.get('html'),
          text: req.body.html.replace(/<[^>]*>/g, '') || post.get('html').replace(/<[^>]*>/g, '')
        })
        .then((post) => {
          saveTags(tags)
          .then((ids) => {
            post.load(['tags'])
            .then((tags) => {
              let tagArr, tagCounter;

              tagArr = post.related('tags').toJSON();

              tagCounter = 0;
              for (; tagCounter < tagArr.length; tagCounter++) {
                tags.tags().detach(tagArr[tagCounter].id);
              }

              tags.tags().attach(ids);

              req.flash('auth', '포스트 수정이 완료되었습니다.');
              res.redirect('/posts/' + req.params.id);
            })
            .catch((err) => {
              console.log(err.message);
              res.render('500', { title: '500: Internal Server Error.' });
            });
          })
          .catch((err) => {
            console.log(err.message);
            res.render('500', { title: '500: Internal Server Error.' });
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.render('500', { title: '500: Internal Server Error.' });
        });
      } else {
        req.flash('auth', '잘못된 접근입니다.');
        res.redirect('/posts/' + req.params.id);
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  }).catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Form for Delete Post
router.get('/delete/:id', isAuthor, (req, res, next) => {
  collections.Categories.forge()
  .query('where', 'is_deleted', 0)
  .fetch()
  .then((categories) => {
    models.Post.forge({ id: req.params.id, is_deleted: 0 })
    .fetch()
    .then((post) => {
      if (!post) {
        res.render('404', { title: '404: Page Not Found.'});
      } else {
        page = url.parse(req.url, true).query.page >> 0 || 1;

        res.render('posts/delete',
            {
              title: 'Jaewonism - DELETE POST',
              asset: 'posts',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              categories: categories.toJSON(),
              post: post.toJSON(),
              page: page
            }
        );
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Delete Post
router.delete('/delete/:id', isAuthor, (req, res, next) => {
  models.Post.forge({ id: req.params.id, is_deleted: 0 })
  .fetch({ require: true })
  .then((post) => {
    post.save({
      is_deleted: 1
    })
    .then(() => {
      res.redirect('/posts');
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Category
router.get('/categories/:id', getCategories, (req, res, next) => {
  models.Category.forge({ id: req.params.id, is_deleted: 0 })
  .fetch(
      { withRelated: [
        {
          'posts': (qb) => {
            let page = url.parse(req.url, true).query.page >> 0 || 1;

            if (typeof page === 'number' && page > 0) {
              let offset = (page - 1) * pagingSize;

              qb.offset(offset).limit(pagingSize);
            }

            qb.orderBy('id', 'DESC');
          }
        }
      ]}
  )
  .then((category) => {
    if (category) {
      let posts, page, description = '', keyword = '';

      posts = category.related('posts');
      page = url.parse(req.url, true).query.page >> 0 || 1;

      let i = 0;
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

      res.render('posts/index',
          {
            title: 'Jaewonism - POST',
            asset: 'posts',
            mode: config.mode,
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
            page: page,
            endPoint: 'categories'
          }
      );
    } else {
      res.redirect('/posts');
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Tag
router.get('/tags/:slug', getCategories, (req, res, next) => {
  models.Tag.forge({ slug: req.params.slug })
  .fetch(
      { withRelated: [
        {
          'posts': (qb) => {
            let page = url.parse(req.url, true).query.page >> 0 || 1;

            if (typeof page === 'number' && page > 0) {
              let offset = (page - 1) * pagingSize;

              qb.offset(offset).limit(pagingSize);
            }
            qb.orderBy('id', 'DESC');
          }
        }
      ]}
  )
  .then((tag) => {
    if (tag) {
      let posts, page, description = '', keyword = '';

      posts = tag.related('posts');
      page = url.parse(req.url, true).query.page >> 0 || 1;

      let i = 0;
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

      res.render('posts/index',
          {
            title: 'Jaewonism - POST',
            asset: 'posts',
            mode: config.mode,
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
            page: page,
            endPoint: 'tags'
          }
      );
    } else {
      res.redirect('/posts');
    }
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

// Fetch all Posts from a single Tag
router.get('/search/:keyword', getCategories, (req, res, next) => {
  collections.Posts.forge()
  .query('where', 'is_deleted', 0)
  .query((qb) => {
    qb.where('title', 'LIKE', '%' + req.params.keyword + '%');
    qb.orWhere('text', 'LIKE', '%' + req.params.keyword + '%');

    let page = url.parse(req.url, true).query.page >> 0 || 1;

    if (typeof page === 'number' && page > 0) {
      let offset = (page - 1) * pagingSize;

      qb.offset(offset).limit(pagingSize);
    }

    qb.orderBy('id', 'DESC');
  })
  .fetch()
  .then((posts) => {
    let page = url.parse(req.url, true).query.page >> 0 || 1, description = '', keyword = '';

    let i = 0;
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

    res.render('posts/index',
        {
          title: 'Jaewonism - POST',
          asset: 'posts',
          mode: config.mode,
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
        }
    );
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.' });
  });
});

saveTags = (tags) => {
  let tagObjects = tags.map((tag) => {
    return {
      name: tag,
      slug: tag.replace(/ /g, '-').toLowerCase()
    };
  });

  return collections.Tags.forge()
  .query('whereIn', 'slug', _.map(tagObjects, 'slug'))
  .fetch()
  .then((existingTags) => {
    let doNotExist = [];
    existingTags = existingTags.toJSON();

    if (existingTags.length > 0) {
      let existingSlugs = _.map(existingTags, 'slug');
      doNotExist = tagObjects.filter((t) => {
        return existingSlugs.indexOf(t.slug) < 0;
      });
    } else {
      doNotExist = tagObjects;
    }

    return new collections.Tags(doNotExist).mapThen((model) => {
      return model.save()
      .then(() => {
        return model.get('id');
      });
    })
    .then((ids) => {
      return _.union(ids, _.map(existingTags, 'id'));
    });
  });
};

module.exports = router;

