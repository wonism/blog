'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('posts_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      postId: {
        field: 'post_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      tagId: {
        field: 'tag_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      isDeleted: {
        field: 'is_deleted',
        allowNull: false,
        type: Sequelize.BOOLEAN
      }
    }, {
      timestamps: false,
      underscored: true
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('posts_tags');
  }
};
