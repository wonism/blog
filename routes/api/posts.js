function saveTags(tags) {
  var tagObjects = tags.map(function (tag) {
    return {
      name: tag,
      slug: tag.replace(/ /g, '-').toLowerCase()
    };
  });

  return Tags.forge()
  .query('whereIn', 'slug', _.pluck(tagObjects, 'slug'))
  .fetch()
  .then(function (existingTags) {
    var doNotExist = [];

    existingTags = existingTags.toJSON();

    if (existingTags.length > 0) {
      var existingSlugs = _.pluck(existingTags, 'slug');

      doNotExist = tagObjects.filter(function (t) {
        return existingSlugs.indexOf(t.slug) < 0;
      });
    }
    else {
      doNotExist = tagObjects;
    }

    return new Tags(doNotExist).mapThen(function(model) {
      return model.save()
      .then(function() {
        return model.get('id');
      });
    })
    .then(function (ids) {
      return _.union(ids, _.pluck(existingTags, 'id'));
    });
  });
}


router.route('/posts')
  // fetch all posts
  .get(function (req, res) {
    Posts.forge()
    .fetch()
    .then(function (collection) {
      res.json({error: false, data: collection.toJSON()});
    })
    .otherwise(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

router.route('/posts/:id')
  // fetch a post by id
  .get(function (req, res) {
    Post.forge({id: req.params.id})
    .fetch({withRelated: ['categories', 'tags']})
    .then(function (post) {
      if (!post) {
        res.status(404).json({error: true, data: {}});
      }
      else {
        res.json({error: false, data: post.toJSON()});
      }
    })
    .otherwise(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });



router.route('/posts')

  .post(function (req, res) {
    var tags = req.body.tags;

   // parse tags variable
    if (tags) {
      tags = tags.split(',').map(function (tag){
        return tag.trim();
      });
    }
    else {
      tags = ['uncategorised'];
    }

    // save post variables
    Post.forge({
      user_id: req.body.user_id,
      category_id: req.body.category_id,
      title: req.body.title,
      slug: req.body.title.replace(/ /g, '-').toLowerCase(),
      html: req.body.post
    })
    .save()
    .then(function (post) {

      // post successfully saved
      // save tags
      saveTags(tags)
      .then(function (ids) {

        post.load(['tags'])
        .then(function (model) {

          // attach tags to post
          model.tags().attach(ids);

          res.json({error: false, data: {message: 'Tags saved'}});
        })
        .otherwise(function (err) {
          res.status(500).json({error: true, data: {message: err.message}});
        });
      })
      .otherwise(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .otherwise(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });


router.route('/posts/category/:id')
  .get(function (req, res) {
    Category.forge({id: req.params.id})
    .fetch({withRelated: ['posts']})
    .then(function (category) {
      var posts = category.related('posts');

      res.json({error: false, data: posts.toJSON()});
    })
    .otherwise(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

router.route('/posts/tag/:slug')
  .get(function (req, res) {
    Tag.forge({slug: req.params.slug})
    .fetch({withRelated: ['posts']})
    .then(function (tag) {
      var posts = tag.related('posts');

      res.json({error: false, data: posts.toJSON()});
    })
    .otherwise(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

