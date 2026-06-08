import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateBookingDto {
  // Customer details
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;

  // Shoot details
  @IsDateString() date: string;           // "YYYY-MM-DD"
  @IsString() @Matches(TIME_RE) startTime: string; // "HH:MM"
  @IsString() @Matches(TIME_RE) endTime: string;   // "HH:MM"
  @IsString() @IsNotEmpty() eventType: string;

  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() notes?: string;
}
