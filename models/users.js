'use strict';
module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('users', {
    user_id: DataTypes.STRING,
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    password: DataTypes.STRING,
    salt: DataTypes.STRING,
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    level: DataTypes.INTEGER,
    from: DataTypes.STRING,
    is_deleted: DataTypes.BOOLEAN,
    detail_information: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    tableName: 'users',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return users;
};
