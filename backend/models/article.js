'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Article.belongsTo(models.User, {
        foreignKey: "createdBy",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });

      Article.hasMany(models.Likedislike,{
        foreignKey : "article_id",
        onDelete:"CASCADE"
      })

      Article.hasMany(models.Image,{
        foreignKey:"article_id",
        onDelete:"CASCADE"
      })
    }
  }
  Article.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    helpfulCount: DataTypes.INTEGER,
    notHelpfulCount: DataTypes.INTEGER,
    views: DataTypes.INTEGER,
    lastViewedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};