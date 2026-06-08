import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePhotographerDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;

  @IsOptional() @IsString() phone?: string;

  // If omitted the service auto-generates from firstName + lastName
  @IsOptional() @IsString() bookingSlug?: string;

  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() baseLocation?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) specializations?: string[];
}
