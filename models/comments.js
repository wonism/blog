'use strict';
module.exports = function(sequelize, DataTypes) {
  var comments = sequelize.define('comments', {
    post_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    parent_id: DataTypes.INTEGER,
    is_deleted: DataTypes.BOOLEAN,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        comments.belongsTo(models.posts, {
          onDelete: 'CASCADE',
          foreignKey: 'post_id'
        });

        comments.belongsTo(models.users, {
          onDelete: 'CASCADE',
          foreignKey: 'user_id'
        });
      }
    },
    tableName: 'comments',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return comments;
};
