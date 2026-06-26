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
  @IsOptional()
  packageIds!: string[];

  @IsInt()
  @Min(0)
  advancePaymentPriceInCents!: number;

  @IsString()
  @IsOptional()
  quotationNotes?: string;

  @IsOptional()
  packageDeposits?: Record<string, number>;

  @IsOptional()
  usePackageWiseDeposit?: boolean;

  @IsOptional()
  customPackage?: {
    name: string;
    description?: string;
    priceInCents: number;
    durationHours: number;
    includes: string[];
    depositType: 'universal' | 'fixed' | 'percentage';
    depositValue: number;
  };
}
