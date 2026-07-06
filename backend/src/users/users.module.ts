import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { EmailModule } from '../email/email.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [DatabaseModule, ReservationsModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService, UserProfileService],
  exports: [UsersService, UserProfileService],
})
export class UsersModule {}
