'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'super@admin.com',
        role:"superAdmin",
        password:"password",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'First',
        lastName: 'Admin',
        email: 'first@admin.com',
        role:"admin",
        password:"password",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'First',
        lastName: 'User',
        email: 'first@user.com',
        role:"user",
        password:"password",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
