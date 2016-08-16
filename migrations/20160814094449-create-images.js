'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      original: {
        allowNull: false,
        type: Sequelize.STRING
      },
      thumbnail: {
        allowNull: true,
        type: Sequelize.STRING
      },
      background: {
        allowNull: true,
        type: Sequelize.STRING
      },
      processingType: {
        field: 'processing_type',
        allowNull: false,
        defaultvalue: 0,
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('images');
  }
};
