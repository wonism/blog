'use strict';
module.exports = function(sequelize, DataTypes) {
  var images = sequelize.define('images', {
    original: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    background: DataTypes.STRING,
    processing_type: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    tableName: 'images',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return images;
};
