import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PhotographersController } from './photographers.controller';
import { PhotographersService } from './photographers.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PhotographersController],
  providers: [PhotographersService],
})
export class PhotographersModule {}
