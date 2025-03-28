'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('superAdmin', 'admin', 'user'),
      allowNull: false, // Optional: enforce non-null values
      defaultValue: 'user', // Optional: set a default value
    },
    password: DataTypes.STRING,
    otp : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};