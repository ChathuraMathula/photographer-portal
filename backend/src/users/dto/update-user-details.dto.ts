import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDetailsDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  bookingSlug?: string;
}
