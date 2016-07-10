var config = require('../config/config.json');

var knex = require('knex')({
  client: config.rdb.client,
  connection: {
    host     : config.rdb.host,
    port     : config.rdb.port,
    user     : config.rdb.user,
    password : config.rdb.password,
    database : config.rdb.database,
    charset  : config.rdb.charset
  }
});

var Bookshelf = require('bookshelf')(knex);
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

