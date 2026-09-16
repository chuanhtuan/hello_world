// CommonJS config consumed by sequelize-cli (migrations/seeders).
// The application itself uses src/config/db.ts, which reads the same
// environment variables via src/config/env.ts.
require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'hello_world',
  password: process.env.DB_PASSWORD || 'changeme',
  database: process.env.DB_NAME || 'hello_world',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  dialect: 'mysql',
};

module.exports = {
  development: common,
  test: common,
  production: {
    ...common,
    dialectOptions: {
      // RDS requires SSL in most default parameter groups.
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    },
  },
};
