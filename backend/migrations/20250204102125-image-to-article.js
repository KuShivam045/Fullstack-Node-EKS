'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  await  queryInterface.addColumn('articles', 'images',{
    type:Sequelize.STRING,
    allowNull:true
  })
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.removeColumn("articles","images")
  }
};
