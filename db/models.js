var knex = require('../config/knexconfig');
var Bookshelf = require('bookshelf') (knex);

var User = Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});

var Post = Bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  category: function () {
    return this.belongsTo(Category, 'category_id');
  },
  tags: function () {
    return this.belongsToMany(Tag);
  },
  author: function () {
    return this.belongsTo(User);
  },
  comments: function () {
    return this.hasMany(Comment, 'post_id');
  }
});

var Category = Bookshelf.Model.extend({
  tableName: 'categories',
  hasTimestamps: true,
  posts: function () {
    return this.hasMany(Post, 'category_id');
  }
});

var Tag = Bookshelf.Model.extend({
  tableName: 'tags',
  hasTimestamps: true,
  posts: function () {
    return this.belongsToMany(Post);
  }
});

var Image = Bookshelf.Model.extend({
  tableName: 'images',
  hasTimestamps: true
});

var Comment = Bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
  post: function () {
    return this.belongsTo(Post, 'post_id');
  },
  user: function () {
    return this.belongsTo(User, 'user_id');
  }
});

var Lotto = Bookshelf.Model.extend({
  tableName: 'lottos',
  hasTimestamps: true
});

var models = {
  User: User,
  Post: Post,
  Category: Category,
  Tag: Tag,
  Image: Image,
  Comment: Comment,
  Lotto: Lotto
};

module.exports = models;

