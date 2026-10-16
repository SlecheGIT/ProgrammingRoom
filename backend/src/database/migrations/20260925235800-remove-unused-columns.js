'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserInRooms', 'language');
    await queryInterface.removeColumn('UserInRooms', 'user_code');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserInRooms', 'language', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('UserInRooms', 'user_code', { type: Sequelize.TEXT, allowNull: true });
  }
};
