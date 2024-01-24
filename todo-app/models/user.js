



'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
   
    static associate(models) {
      // define association here
      User.hasMany(models.Todo,{
        foreignKey: 'userId'
      })
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false, 
      validate: {
          notNull: true,
          len: 1
      }
   },
    LastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false, 
      validate: {
          notNull: true,
          len: 1
      }
   },
   password: {
    type: DataTypes.STRING,
    allowNull: false, 
    validate: {
        notNull: true,
        len: 6
    }
 },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
