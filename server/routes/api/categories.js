router.route('/categories')
  // fetch all categories
  .get(function (req, res) {
    collections.Categories.forge()
    .fetch()
    .then(function (collection) {
      res.json({error: false, data: collection.toJSON()});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  // create a new category
  .post(function (req, res) {
    models.Category.forge({name: req.body.name})
    .save()
    .then(function (category) {
      res.json({error: false, data: {id: category.get('id')}});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });
router.route('/categories/:id')
  // fetch all categories
  .get(function (req, res) {
    models.Category.forge({id: req.params.id})
    .fetch()
    .then(function (category) {
      if(!category) {
        res.status(404).json({error: true, data: {}});
      }
      else {
        res.json({error: false, data: category.toJSON()});
      }
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  // update a category
  .put(function (req, res) {
    models.Category.forge({id: req.params.id})
    .fetch({require: true})
    .then(function (category) {
      category.save({name: req.body.name || category.get('name')})
      .then(function () {
        res.json({error: false, data: {message: 'Category updated'}});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  // delete a category
  .delete(function (req, res) {
    models.Category.forge({id: req.params.id})
    .fetch({require: true})
    .then(function (category) {
      category.destroy()
      .then(function () {
        res.json({error: true, data: {message: 'Category successfully deleted'}});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

