import { Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum Environment {
  prod = 'prod',
  dev = 'dev',
}

export class AppConfigDto {
  @IsEnum(Environment)
  env: Environment;

  @IsNumber()
  @Type(() => Number)
  port: number;
}
