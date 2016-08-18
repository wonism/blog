'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
    queryInterface.changeColumn('posts', 'is_deleted', { defaultValue: 0 });
    queryInterface.changeColumn('posts', 'comments_count', { defaultValue: 0 });
    queryInterface.changeColumn('images', 'processing_type', { defaultValue: 0 });
    queryInterface.changeColumn('comments', 'is_deleted', { defaultValue: 0 });
    queryInterface.changeColumn('comments', 'parent_id', { defaultValue: 0 });
    queryInterface.changeColumn('categories', 'is_deleted', { defaultValue: 0 });
    queryInterface.changeColumn('categories', 'is_deleted', { defaultValue: 0 });
    */
    return [
      queryInterface.changeColumn('posts_tags', 'is_deleted', { type: Sequelize.BOOLEAN, defaultValue: 0 }),
      queryInterface.changeColumn('posts', 'is_deleted', { type: Sequelize.BOOLEAN, defaultValue: 0 }),
      queryInterface.changeColumn('posts', 'comments_count', { type: Sequelize.INTEGER(10).UNSIGNED, defaultValue: 0 }),
      queryInterface.changeColumn('images', 'processing_type', { type: Sequelize.INTEGER, defaultValue: 0 }),
      queryInterface.changeColumn('comments', 'is_deleted', { type: Sequelize.BOOLEAN, defaultValue: 0 }),
      queryInterface.changeColumn('comments', 'parent_id', { type: Sequelize.INTEGER(10).UNSIGNED, defaultValue: 0 }),
      queryInterface.changeColumn('categories', 'is_deleted', { type: Sequelize.BOOLEAN, defaultValue: 0 }),
      queryInterface.changeColumn('categories', 'is_deleted', { type: Sequelize.BOOLEAN, defaultValue: 0 })
    ]
  },

  down: function (queryInterface, Sequelize) {
    return [];
  }
};
