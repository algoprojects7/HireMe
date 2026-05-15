import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '@repo/types';

export class RegisterDto {
  @IsNotEmpty()
  mobileNumber: string;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  tenantId?: string;
}
