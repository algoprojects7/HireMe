import { IsString, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

export enum ReviewRole {
  PROVIDER_TO_WORKER = 'PROVIDER_TO_WORKER',
  WORKER_TO_PROVIDER = 'WORKER_TO_PROVIDER',
}

export class CreateReviewDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsEnum(ReviewRole)
  role: ReviewRole;
}
