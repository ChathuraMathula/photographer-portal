import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterStudioDto {
  @IsNotEmpty()
  @IsString()
  studioName!: string;

  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  studioSlug!: string;

  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  baseLocation?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  locationMapLink?: string;

  @IsOptional()
  @IsString()
  coordinates?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
