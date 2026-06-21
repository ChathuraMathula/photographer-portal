import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priceInCents?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationHours?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
