import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PhotographersController } from './photographers.controller';
import { PhotographersService } from './photographers.service';
import { PhotographerQueryService } from './services/photographer-query.service';
import { PhotographerUpdateService } from './services/photographer-update.service';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [DatabaseModule, ReservationsModule],
  controllers: [PhotographersController],
  providers: [
    PhotographersService,
    PhotographerQueryService,
    PhotographerUpdateService,
  ],
  exports: [
    PhotographersService,
    PhotographerQueryService,
    PhotographerUpdateService,
  ],
})
export class PhotographersModule {}
