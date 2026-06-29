import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Matches,
} from 'class-validator';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateManualBookingDto {
  @IsString() @IsNotEmpty() firstName!: string;
  @IsString() @IsNotEmpty() lastName!: string;
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() phone!: string;

  @IsDateString() date!: string; // "YYYY-MM-DD"
  @IsString() @Matches(TIME_RE) startTime!: string; // "HH:MM"
  @IsString() @Matches(TIME_RE) endTime!: string; // "HH:MM"
  @IsString() @IsNotEmpty() eventType!: string;

  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() locationMapLink?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() packageId?: string;
  @IsOptional() @IsNumber() advancePaymentPriceInCents?: number;
  @IsOptional() @IsNumber() totalAmountInCents?: number;
}
