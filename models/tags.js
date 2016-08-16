'use strict';
module.exports = function(sequelize, DataTypes) {
  var tags = sequelize.define('tags', {
    slug: DataTypes.STRING,
    name: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        tags.belongsToMany(models.posts, {
          through: models.posts_tags
        });

      }
    },
    tableName: 'tags',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return tags;
};
