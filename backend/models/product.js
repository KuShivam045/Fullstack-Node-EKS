"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: "cat_id",
        // as: "categories",
      });
      Product.hasMany(models.Review,{
        foreignKey : "product_id"
      })
    }
  }
  Product.init(
    {
      title: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      cat_id: DataTypes.INTEGER,
      tags: DataTypes.STRING,
      description: DataTypes.TEXT("long"),
      ratings: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
