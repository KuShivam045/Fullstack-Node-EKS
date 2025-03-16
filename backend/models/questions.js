"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Questions.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });
      Questions.hasOne(models.Answers,{
        foreignKey : "question_id"
      })
      Questions.hasOne(models.UserfulAnswer,{
        foreignKey : "answer_id"
      })
    }
  }
  Questions.init(
    {
      title: DataTypes.STRING,
      details: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "answered", "closed", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      user_id:DataTypes.INTEGER,
      rejectreason: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Questions",
    }
  );
  return Questions;
};
