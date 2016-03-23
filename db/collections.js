var knex = require('../config/knexconfig');
var Bookshelf = require('bookshelf') (knex);
var models = require('./models');

var collections = {
  Users: Bookshelf.Collection.extend({
    model: models.User
  }),

  Posts: Bookshelf.Collection.extend({
    model: models.Post
  }),

  Categories: Bookshelf.Collection.extend({
    model: models.Category
  }),

  Tags: Bookshelf.Collection.extend({
    model: models.Tag
  }),

  Images: Bookshelf.Collection.extend({
    model: models.Image
  }),

  Comments: Bookshelf.Collection.extend({
    model: models.Comment
  }),

  Lottos: Bookshelf.Collection.extend({
    model: models.Lotto
  })
};

module.exports = collections;

