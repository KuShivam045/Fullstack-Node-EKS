'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('answers', 'satisfied',{
      type: Sequelize.INTEGER,
      allowNull: true,
    })
    await queryInterface.addColumn('answers', 'not-satisfied',{
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('answers', 'satisfied');
    await queryInterface.removeColumn('answers', 'not-satisfied');
  }
};
