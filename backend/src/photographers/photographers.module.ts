import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PhotographersController } from './photographers.controller';
import { PhotographersService } from './photographers.service';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [DatabaseModule, ReservationsModule],
  controllers: [PhotographersController],
  providers: [PhotographersService],
})
export class PhotographersModule {}
