"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated user is deleted
      });

      // define association with Product model
      Review.belongsTo(models.Product, {
        foreignKey: "product_id",
        onDelete: "CASCADE", // Optional: Deletes the review if the associated product is deleted
      });
    }
  }
  Review.init(
    {
      rate: DataTypes.INTEGER,
      reviews: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
