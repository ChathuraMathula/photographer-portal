import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdatePhotographerProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsString()
  baseLocation?: string;

  @IsOptional()
  @IsBoolean()
  isAvailableForBooking?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedEventTypes?: string[];

  @IsOptional()
  @IsBoolean()
  allowCustomEventTypes?: boolean;

  @IsOptional()
  @IsString()
  universalDepositType?: string;

  @IsOptional()
  @IsNumber()
  universalDepositValue?: number;

  @IsOptional()
  @IsString()
  offlineMessage?: string;

  @IsOptional()
  @IsBoolean()
  showManualBookingInTopbar?: boolean;

  @IsOptional()
  @IsBoolean()
  showAcceptBookingsInTopbar?: boolean;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  locationMapLink?: string;

  @IsOptional()
  @IsBoolean()
  showMapPreviewOnBookingPage?: boolean;
}
