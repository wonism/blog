'use strict';
module.exports = function(sequelize, DataTypes) {
  var categories = sequelize.define('categories', {
    name: DataTypes.STRING,
    is_deleted: DataTypes.BOOLEAN,
    parent_id: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        categories.hasMany(models.posts, { forienKey: 'category_id' });
      }
    },
    tableName: 'categories',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return categories;
};
