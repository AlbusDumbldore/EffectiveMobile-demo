import 'reflect-metadata';
import express from 'express';
import { appConfig } from './config';
import { setupSwagger } from './swagger/setup-swagger';

const bootstrap = async () => {
  const server = express();

  setupSwagger(server);

  server.listen(appConfig.port);
};

bootstrap();
