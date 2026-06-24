import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ProcessPaymentDto {
  @IsString() @IsNotEmpty() token: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() packageId: string;
  @IsString() @IsNotEmpty() cardNumber: string;
  @IsString() @IsNotEmpty() expiryDate: string;
  @IsString() @IsNotEmpty() cvv: string;
  @IsString() @IsNotEmpty() cardholderName: string;
}
