'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Answers.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });
      Answers.belongsTo(models.Questions, {
        foreignKey: "question_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });
      Answers.hasOne(models.UserfulAnswer,{
        foreignKey: "answer_id",
      })
    }
  }
  Answers.init({
    content: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    question_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Answers',
  });
  return Answers;
};