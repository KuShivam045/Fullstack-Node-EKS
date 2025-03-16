"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Products", "cat_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
      allowNull: true, // Allow null values initially
      onUpdate: "CASCADE", // Update cat_id if Category is updated
      onDelete: "SET NULL", // Set cat_id to null if Category is deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Products", "cat_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
