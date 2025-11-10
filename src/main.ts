import 'reflect-metadata';
import express from 'express';
import { Container } from 'inversify';
import { logRoutes } from './bootstrap';
import RedisModule from './cache/redis.module';
import { appConfig } from './config';
import { connectToPostgres } from './database/connect';
import logger from './logger';
import { ErrorHandler } from './middlewares/error.handler';
import { UserController } from './modules/user/user.controller';
import UserModule from './modules/user/user.module';
import { setupSwagger } from './swagger/setup-swagger';

const bootstrap = async () => {
  const appContainer = new Container();

  await appContainer.load(UserModule, RedisModule);

  await connectToPostgres();

  const server = express();

  const userController = appContainer.get(UserController);

  server.use('/user', userController.router);

  setupSwagger(server);

  server.use(ErrorHandler);

  logRoutes(server);

  server.listen(appConfig.port, () => {
    logger.info(`Server is started on port ${appConfig.port}`);
  });
};

bootstrap();
