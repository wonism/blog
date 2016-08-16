'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      userId: {
        field: 'user_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      categoryId: {
        field: 'category_id',
        allowNull: false,
        type: Sequelize.INTEGER(10).UNSIGNED
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      slug: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(60)
      },
      thumbnail: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      backgroundImage: {
        field: 'background_image',
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      html: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      text: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      isDeleted: {
        field: 'is_deleted',
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      commentsCount: {
        field: 'comments_count',
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
    }, {
      timestamps: true,
      underscored: true
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('posts');
  }
};
