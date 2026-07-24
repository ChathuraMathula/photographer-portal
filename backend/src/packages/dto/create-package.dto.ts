import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(0)
  priceInCents!: number;

  @IsInt()
  @Min(0)
  durationHours!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @IsString()
  @IsOptional()
  depositType?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  depositValue?: number;
}
