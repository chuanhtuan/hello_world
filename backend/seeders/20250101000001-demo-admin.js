'use strict';
const bcrypt = require('bcryptjs');

// Seeds a default admin account for first login.
// IMPORTANT: change this password immediately after first login in any real deployment.
module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        email: 'admin@helloworld.local',
        passwordHash,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { email: 'admin@helloworld.local' });
  },
};
