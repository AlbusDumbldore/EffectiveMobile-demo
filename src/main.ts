import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import { Container } from 'inversify';
import { logRoutes } from './bootstrap';
import RedisModule from './cache/redis.module';
import { appConfig } from './config';
import { connectToPostgres } from './database/connect';
import JwtModule from './jwt/jwt.module';
import logger from './logger';
import { ErrorHandler, SessionMiddleware } from './middlewares';
import { UserController } from './modules/user/user.controller';
import UserModule from './modules/user/user.module';
import { setupSwagger } from './swagger/setup-swagger';

const bootstrap = async () => {
  const appContainer = new Container();

  await appContainer.load(UserModule, RedisModule, JwtModule);

  await connectToPostgres();

  const server = express();

  server.use(express.json());
  server.use(SessionMiddleware);

  const userController = appContainer.get(UserController);

  server.use('/api/user', userController.router);

  setupSwagger(server);

  server.use(ErrorHandler);

  logRoutes(server);

  server.listen(appConfig.port, () => {
    logger.info(`Server is started on port ${appConfig.port}`);
  });
};

bootstrap();
