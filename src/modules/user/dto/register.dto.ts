import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  fullName: string;

  @IsDateString({}, { message: 'Дата рождения должна быть в формате YYYY-MM-DD' })
  birthDate: Date;

  @IsEmail()
  @MaxLength(40)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';
}
