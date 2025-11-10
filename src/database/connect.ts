import { Sequelize } from 'sequelize-typescript';
import { appConfig } from '../config';
import logger from '../logger';
import { UserEntity } from './entities/user.entity';

export const connectToPostgres = async () => {
  // Create connection
  const connection = new Sequelize({
    ...appConfig.postgres,
    dialect: 'postgres',
    logging: false,
  });

  connection.addModels([UserEntity]);

  // Ping database
  try {
    await connection.authenticate();
  } catch (err) {
    logger.error("Can't connect to Postgres:");
    logger.error(err);
    throw err;
  }

  // Synchronize tables
  await connection.sync({ alter: true });

  logger.info('Successfully connected to PostgreSQL');
};
