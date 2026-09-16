import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.nodeEnv === 'development' ? console.log : false,
  dialectOptions: env.db.ssl ? { ssl: { rejectUnauthorized: false } } : {},
});

export async function connectDb() {
  await sequelize.authenticate();
  console.log(`Connected to MySQL at ${env.db.host}:${env.db.port}/${env.db.name}`);
}
