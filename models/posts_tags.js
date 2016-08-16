'use strict';
module.exports = function(sequelize, DataTypes) {
  var posts_tags = sequelize.define('posts_tags', {
    post_id: DataTypes.INTEGER,
    tag_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    tableName: 'posts_tags',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return posts_tags;
};
