import { IsNotEmpty, IsString } from 'class-validator';

export class RejectReservationDto {
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}
