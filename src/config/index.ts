/* eslint-disable */
import { config as readEnv } from 'dotenv';
import { validate } from '../validation';
import { AppConfigDto } from './dto';
import process from 'node:process';

readEnv();

type EnvStructure<T = any> = {
  [key in keyof T]: T[key] extends object ? EnvStructure<T[key]> : string | undefined;
};

const rawConfig: EnvStructure<AppConfigDto> = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,

  redisUrl: process.env.REDIS_URL,

  postgres: {
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    username: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
};

export const appConfig = validate(AppConfigDto, rawConfig);
