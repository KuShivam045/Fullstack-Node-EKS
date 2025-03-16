'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Likedislike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Likedislike.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });
      Likedislike.belongsTo(models.Article, {
        foreignKey: "article_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });
    }
  }
  Likedislike.init({
    like: DataTypes.INTEGER,
    dislike: DataTypes.INTEGER,
    views: DataTypes.INTEGER,
    user_id:DataTypes.INTEGER,
    article_id:DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Likedislike',
  });
  return Likedislike;
};