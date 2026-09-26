'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'passwordHash', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('PENDING', 'ACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE', // existing rows (created before this migration) are treated as already active
    });

    await queryInterface.addColumn('users', 'provider', {
      type: Sequelize.ENUM('LOCAL', 'GOOGLE'),
      allowNull: false,
      defaultValue: 'LOCAL',
    });

    await queryInterface.addColumn('users', 'googleId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'activationToken', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'activationTokenExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // New signups going forward should default to PENDING; only the
    // defaultValue for pre-existing rows above needed to be ACTIVE.
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('PENDING', 'ACTIVE'),
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'activationTokenExpires');
    await queryInterface.removeColumn('users', 'activationToken');
    await queryInterface.removeColumn('users', 'googleId');
    await queryInterface.removeColumn('users', 'provider');
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.changeColumn('users', 'passwordHash', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
