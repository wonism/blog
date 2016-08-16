'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('comments', {
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
      userId: {
        field: 'user_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      comment: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      parentId: {
        field: 'parent_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      isDeleted: {
        field: 'is_deleted',
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('comments');
  }
};
