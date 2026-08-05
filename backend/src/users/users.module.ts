import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { EmailModule } from '../email/email.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfileService } from './user-profile.service';
import { UserSlugService } from './services/user-slug.service';
import { UserSearchService } from './services/user-search.service';
import { UserCreationService } from './services/user-creation.service';
import { UserStatusService } from './services/user-status.service';

import { UserDeletionService } from './services/user-deletion.service';

@Module({
  imports: [DatabaseModule, ReservationsModule, EmailModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserProfileService,
    UserSlugService,
    UserSearchService,
    UserCreationService,
    UserStatusService,
    UserDeletionService,
  ],
  exports: [
    UsersService,
    UserProfileService,
    UserSlugService,
    UserSearchService,
    UserCreationService,
    UserStatusService,
    UserDeletionService,
  ],
})
export class UsersModule {}
