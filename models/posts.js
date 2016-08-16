'use strict';
module.exports = function(sequelize, DataTypes) {
  var posts = sequelize.define('posts', {
    user_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    background_image: DataTypes.STRING,
    html: DataTypes.TEXT,
    text: DataTypes.TEXT,
    is_deleted: DataTypes.BOOLEAN,
    comments_count: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        posts.belongsToMany(models.tags, {
          through: models.posts_tags
        });

        posts.belongsTo(models.users, {
          foreignKey: 'user_id',
          constraints: false
        });

        posts.belongsTo(models.categories, {
          foreignKey: 'category_id',
          constraints: false
        });

        posts.hasMany(models.comments, { forienKey: 'post_id' });
      }
    },
    tableName: 'posts',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return posts;
};
