'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      isDeleted: {
        field: 'is_deleted',
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      parentId: {
        field: 'parent_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
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
    return queryInterface.dropTable('categories');
  }
};
