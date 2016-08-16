'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      user_id: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(20)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(50)
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      image: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      salt: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      refreshToken: {
        field: 'refresh_token',
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      accessToken: {
        field: 'access_token',
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      level: {
        allowNull: false,
        type: Sequelize.INTEGER(3)
      },
      from: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      isDeleted: {
        field: 'is_deleted',
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      detailInformation: {
        field: 'detail_information',
        allowNull: false,
        type: Sequelize.TEXT
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
    }, {
      timestamps: true,
      underscored: true
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
