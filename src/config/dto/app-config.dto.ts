import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { JwtConfigDto } from './jwt.config.dto';
import { PostgresConfigDto } from './postgres.config.dto';

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

  @IsString()
  redisUrl: string;

  @ValidateNested()
  @Transform(({ value }) => plainToInstance(JwtConfigDto, value))
  jwt: JwtConfigDto;

  @ValidateNested()
  @Transform(({ value }) => plainToInstance(PostgresConfigDto, value))
  postgres: PostgresConfigDto;
}
