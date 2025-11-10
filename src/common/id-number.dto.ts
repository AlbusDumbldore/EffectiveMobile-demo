import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class IdNumberDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
