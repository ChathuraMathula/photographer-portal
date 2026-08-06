import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';

export class RegisterPhotographerDto {
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
  bookingSlug!: string;

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
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsString()
  locationMapLink?: string;

  @IsOptional()
  @IsString()
  coordinates?: string;
}
