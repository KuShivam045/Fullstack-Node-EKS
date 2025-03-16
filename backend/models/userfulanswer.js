'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserfulAnswer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserfulAnswer.belongsTo(models.User,{
        foreignKey: "user_id",
        onDelete: "CASCADE",
      })
      UserfulAnswer.belongsTo(models.Answers,{
        foreignKey: "answer_id",
        onDelete: "CASCADE",
      })
    }
  }
  UserfulAnswer.init({
    like: DataTypes.INTEGER,
    unlike: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    answer_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserfulAnswer',
  });
  return UserfulAnswer;
};