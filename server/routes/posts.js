import express from 'express';

import async from 'async';
import url from 'url';
import _ from 'lodash';
import moment from 'moment-timezone';

import modelss from '../../models';

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
    modelss.users
      .findById(req.user.id)
      .then((user) => {
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
      })
      .catch((err) => {
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

getCategories = (req, res, next) => {
  modelss.categories
    .findAll({
      where: { is_deleted: 0 }
    })
    .then((categories) => {
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
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
};

getPages = (req, res, next) => {
  modelss.posts
    .count({
      where: { is_deleted: 0 }
    })
    .then((count) => {
      pages = Math.ceil(count / pagingSize);
      return next();
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
};

getPagesWithCategory = (req, res, next) => {
  modelss.posts
    .count({
      where: { category_id: req.params.id, is_deleted: 0 }
    })
    .then((count) => {
      pages = Math.ceil(count / pagingSize);
      return next();
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
};

getPagesWithTag = (req, res, next) => {
  modelss.tags
    .findAll({
      where: { slug: req.params.slug },
      include: [ { model: modelss.posts, where: { is_deleted: 0 } } ]
    })
    .then((tag) => {
      pages = Math.ceil((tag[0] && tag[0].posts ? tag[0].posts.length : 0) / pagingSize);
      return next();
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
};

getPagesWithSearch = (req, res, next) => {
  modelss.posts
    .count({
      where: {
        is_deleted: 0,
        $and: {
          $or: [ { title: { $like: '%' + req.params.keyword + '%' } }, { text: { $like: '%' + req.params.keyword + '%' } } ]
        }
      }
      // where: { is_deleted: 0 }
    })
    .then((count) => {
      pages = Math.ceil(count / pagingSize);
      return next();
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
}

// Fetch all Posts
router.get('/', getCategories, (req, res, next) => {
  let page = +url.parse(req.url, true).query.page || 1;
  let offset = (page - 1) * pagingSize;

  modelss.posts
    .findAll({
      where: { is_deleted: 0 },
      offset: offset,
      limit: pagingSize,
      order: 'id DESC'
    })
    .then((posts) => {
      let description = '', keyword = '';

      for (let i = 0, len = posts.length; i < len; i++) {
        description += posts[i].title;
        if (i !== posts.length - 1) {
          description += ', ';
        }
      }

      for (let i = 0, len = fetchedCategories.length; i < len; i++) {
        keyword += fetchedCategories[i].name;

        if (i !== fetchedCategories.length - 1) {
          keyword += ', ';
        }
      }

      return res.render('posts/index',
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
            posts: posts,
            pages: pages,
            page: page,
            endPoint: 'root'
          }
      );
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Create Post
router.get('/new', isAuthor, (req, res, next) => {
  modelss.categories
    .findAll({
      where: { is_deleted: 0 }
    })
    .then((categories) => {
      let page = +url.parse(req.url, true).query.page || 1;

      return res.render('posts/new',
          {
            title: 'Jaewonism - NEW POST',
            asset: 'posts',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            categories: categories,
            page: page
          }
      );
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Create Post
router.post('/new', isAuthor, (req, res, next) => {
  let tags, postTitle, newSlug;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/\s/g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map((tag) => {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  async.waterfall([
    (cb) => {
      modelss.posts
        .findAll({
          where: { title: postTitle }
        })
        .then((posts) => {
          return cb(null, posts);
        })
        .catch((err) => {
          return next(err, req, res, next);
        });
    },
    (posts, cb) => {
      let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

      if (posts) {
        let numberForSlug = posts.length + 1;

        newSlug = newSlug + '-' + numberForSlug;
      }

      modelss.posts
        .create({
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
        })
        .then((post) => {
          saveTags(tags, (ids) => {
            return cb(null, post, ids);
          });
        })
        .catch((err) => {
          return cb(err);
        });
    },
    (post, ids, cb) => {
      ids.forEach((el, i) => {
        modelss.posts_tags
          .create({
            post_id: post.id,
            tag_id: el
          })
          .then((p_t) => {
            if (ids.length - 1 === i) {
              return cb(null, true);
            }
          })
          .catch((err) => {
            return cb(err);
          });
      });
    }
  ], (err, result) => {
    if (err) {
      return next(err, req, res, next);
    } else {
      return res.redirect('/posts');
    }
  });
});

// Fetch Post
router.get('/:id', isAuthor, (req, res, next) => {
  modelss.posts
    .find({
      where: { id: req.params.id, is_deleted: 0 },
      include: [ modelss.users, modelss.categories, modelss.tags, { model: modelss.comments, include: [ modelss.users ] } ]
    })
    .then((post) => {
      if (!post) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        let author, category, tags, page, comments, description, keyword = '';

        author = post.users;
        category = post.category;
        tags = post.tags;
        page = +url.parse(req.url, true).query.page || 1;
        comments = post.comments;
        description = post.text;

        let i = 0;
        for (; i < tags.length; i++) {
          keyword += tags[i].name;

          if (i !== tags.length - 1) {
            keyword += ', ';
          }
        }

        return res.render('posts/show',
            {
              title: 'Jaewonism - POST : ' + post.title,
              asset: 'posts',
              mode: config.mode,
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
              category: category,
              tags: tags,
              page: page
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Update Post
router.get('/update/:id', isAuthor, (req, res, next) => {
  async.waterfall([
    (cb) => {
      modelss.posts
        .find({
          where: { id: req.params.id, is_deleted: 0 },
          include: [ modelss.categories, modelss.tags ]
        })
        .then((post) => {
          if (!post) {
            return cb(null, null);
          } else {
            return cb(null, post);
          }
        })
        .catch((err) => {
          return cb(err);
        });
    },
    (post, cb) => {
      if (!post) {
        return cb(null, null);
      } else {
        modelss.categories
          .findAll({
            where: { is_deleted: 0 }
          })
          .then((categories) => {
            let result = {};

            result.post = post;
            result.categories = categories;

            return cb(null, result);
          })
          .catch((err) => {
            return cb(err);
          });
      }
    }
  ], (err, result) => {
    if (err) {
      return next(err, req, res, next);
    } else {
      if (result) {
        let category, tags, page;

        category = result.post.category;
        tags = result.post.tags;
        page = +url.parse(req.url, true).query.page || 1;

        return res.render('posts/update',
            {
              title: 'Jaewonism - MODIFY POST',
              asset: 'posts',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              post: result.post,
              categories: result.categories,
              category: category,
              tags: tags,
              page: page
            }
        );
      } else {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      }
    }
  });
});

// Update Post
router.post('/update/:id', isAuthor, (req, res, next) => {
  let tags, postTitle, newSlug;

  tags = req.body.tags;
  postTitle = req.body.title;
  newSlug = req.body.title.replace(/\s/g, '-').toLowerCase();

  if (tags) {
    tags = tags.split(',').map((tag) => {
      return tag.trim();
    });
  } else {
    tags = ['uncategories'];
  }

  async.waterfall([
    (cb) => {
      modelss.posts
        .findAll({
          where: { title: postTitle }
        })
        .then((posts) => {
          return cb(null, posts);
        })
        .catch((err) => {
          return cb(err);
        });
    },
    (posts, cb) => {
      let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

      if (posts) {
        let numberForSlug = posts.length + 1;

        newSlug = newSlug.replace(/\s\-\s\d+$/, '') + ' - ' + numberForSlug;
      }

      modelss.posts
        .update({
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
        })
        .then((post) => {
          saveTags(tags, (ids) => {
            return cb(null, req.params.id, ids);
          });
        })
        .catch((err) => {
          return cb(err);
        });
    },
    (postId, ids, cb) => {
      ids.forEach((el, i) => {
        modelss.posts_tags
          .create({
            post_id: postId,
            tag_id: el
          })
          .then((p_t) => {
            if (ids.length - 1 === i) {
              return cb(null, true);
            }
          })
          .catch((err) => {
            return cb(err);
          });
      });
    }
  ], (err, result) => {
    if (err) {
      return next(err, req, res, next);
    } else {
      req.flash('auth', '포스트 수정이 완료되었습니다.');
      return res.redirect('/posts/' + req.params.id);
    }
  });
});

// Form for Delete Post
router.get('/delete/:id', isAuthor, (req, res, next) => {
  modelss.posts
    .find({
      where: { id: req.params.id },
      include: [ modelss.categories ]
    })
    .then((post) => {
      if (!post) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        let page = url.parse(req.url, true).query.page >> 0 || 1;

        return res.render('posts/delete',
            {
              title: 'Jaewonism - DELETE POST',
              asset: 'posts',
              mode: config.mode,
              url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              categories: post.categories,
              post: post,
              page: page
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Delete Post
router.delete('/delete/:id', isAuthor, (req, res, next) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

  modelss.posts
    .update({
      is_deleted: 1,
      updated_at: dateStr
    }, {
      where: { id: req.params.id }
    })
    .then((post) => {
      return res.redirect('/posts');
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Fetch all Posts from a single Category
router.get('/categories/:id', getCategories, (req, res, next) => {
  let page = +url.parse(req.url, true).query.page || 1;
  let offset = (page - 1) * pagingSize;

  modelss.categories
    .find({
      where: { id: req.params.id },
      include: [ { model: modelss.posts, where: { is_deleted: 0 }, offset: offset, limit: pagingSize } ]
    })
    .then((category) => {
      if (!category) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        let posts, description = '', keyword = '';

        posts = category.posts;

        for (let i = 0, len = posts.length; i < len; i++) {
          description += posts[i].title;
          if (i !== posts.length - 1) {
            description += ', ';
          }
        }

        for (let i = 0, len = fetchedCategories.length; i < len; i++) {
          keyword += fetchedCategories[i].name;

          if (i !== fetchedCategories.length - 1) {
            keyword += ', ';
          }
        }

        return res.render('posts/index',
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
              category: category,
              posts: posts,
              pages: pages,
              page: page,
              endPoint: 'categories'
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Fetch all Posts from a single Tag
router.get('/tags/:slug', getCategories, (req, res, next) => {
  let page = +url.parse(req.url, true).query.page || 1;
  let offset = (page - 1) * pagingSize;

  modelss.tags
    .find({
      where: { slug: req.params.slug },
      include: [ { model: modelss.posts, where: { is_deleted: 0 }, offset: offset, limit: pagingSize } ]
    })
    .then((tag) => {
      if (!category) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        let posts, description = '', keyword = '';

        posts = tag.posts;

        for (let i = 0, len = posts.length; i < len; i++) {
          description += posts[i].title;

          if (i !== posts.length - 1) {
            description += ', ';
          }
        }

        for (let i = 0, len = fetchedCategories.length; i < len; i++) {
          keyword += fetchedCategories[i].name;

          if (i !== fetchedCategories.length - 1) {
            keyword += ', ';
          }
        }

        return res.render('posts/index',
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
              posts: posts,
              tag: tag,
              tagSlug: req.params.slug,
              pages: pages,
              page: page,
              endPoint: 'tags'
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Fetch all Posts from a single Tag
router.get('/search/:keyword', getCategories, (req, res, next) => {
  let page = +url.parse(req.url, true).query.page || 1;
  let offset = (page - 1) * pagingSize;

  modelss.posts
    .findAll({
      where: {
        is_deleted: 0,
        $and: {
          $or: [ { title: { $like: '%' + req.params.keyword + '%' } }, { text: { $like: '%' + req.params.keyword + '%' } } ]
        }
      }
    })
    .then((posts) => {
      let description = '', keyword = '';

      for (let i = 0, len = posts.length; i < len; i++) {
        description += posts[i].title;

        if (i !== posts.length - 1) {
          description += ', ';
        }
      }

      for (let i = 0, len = fetchedCategories.length; i < len; i++) {
        keyword += fetchedCategories[i].name;

        if (i !== fetchedCategories.length - 1) {
          keyword += ', ';
        }
      }

      return res.render('posts/index',
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
            posts: posts,
            pages: pages,
            page: page,
            endPoint: 'search'
          }
      );

    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

saveTags = (tags, afterSave) => {
  let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');
  let tagObjects = tags.map((tag) => {
    return {
      name: tag,
      slug: tag.replace(/ /g, '-').toLowerCase()
    };
  });

  async.waterfall([
    (cb) => {
      modelss.tags
        .findAll({
          where: { slug: { $in: _.map(tagObjects, 'slug') } }
        })
        .then((existingTags) => {
          let doNotExist = [];
          let ids = [];

          if (existingTags.length) {
            let existingSlugs = _.map(existingTags, 'slug');

            doNotExist = tagObjects.filter((t) => {
              return existingSlugs.indexOf(t.slug) < 0;
            });
          } else {
            doNotExist = tagObjects;
          }

          if (doNotExist.length) {
            doNotExist.forEach((el, i) => {
              el.created_at = dateStr;
              el.updated_at = dateStr;

              return modelss.tags
                .create(el)
                .then((t) => {
                  ids.push(t.id);
                  if (doNotExist.length - 1 === i) {
                    return cb(null, _.union(ids, _.map(existingTags, 'id')));
                  }
                })
                .catch((err) => {
                  throw err;
                });
            });
          } else {
            return cb(null, _.map(existingTags, 'id'));
          }
        })
        .catch((err) => {
          return cb(err);
        });
    }
  ], (err, result) => {
    if (err) {
      throw err;
    } else {
      return afterSave(result);
    }
  });
};

module.exports = router;

