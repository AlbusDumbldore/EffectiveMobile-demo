import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number = 10;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset: number = 0;
}
