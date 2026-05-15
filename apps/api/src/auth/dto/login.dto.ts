import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  mobileNumber: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
