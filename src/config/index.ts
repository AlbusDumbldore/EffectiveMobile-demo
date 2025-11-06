import { config as readEnv } from 'dotenv';
import { validate } from '../validation';
import { AppConfigDto } from './dto';

readEnv();

type EnvStructure<T = any> = {
  [key in keyof T]: T[key] extends object ? EnvStructure<T[key]> : string | undefined;
};

const rawConfig: EnvStructure<AppConfigDto> = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
};

export const appConfig = validate(AppConfigDto, rawConfig);
