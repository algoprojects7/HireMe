import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateWorkerDto {
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
