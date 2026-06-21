import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProposeQuotationDto {
  @IsArray()
  @IsString({ each: true })
  packageIds!: string[];

  @IsInt()
  @Min(0)
  advancePaymentPriceInCents!: number;

  @IsString()
  @IsOptional()
  quotationNotes?: string;
}
