import { Injectable } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileService } from './user-profile.service';
import { UserCreationService } from './services/user-creation.service';
import { UserSearchService } from './services/user-search.service';
import { UserStatusService } from './services/user-status.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly creationService: UserCreationService,
    private readonly searchService: UserSearchService,
    private readonly statusService: UserStatusService,
    private readonly profileService: UserProfileService,
  ) {}

  async create(dto: CreateUserDto, callerRole: UserRole) {
    return this.creationService.create(dto, callerRole);
  }

  async getProfile(userId: string) {
    return this.profileService.getProfile(userId);
  }

  async updateProfile(userId: string, updates: any) {
    return this.profileService.updateProfile(userId, updates);
  }

  async findAll(
    callerRole: UserRole,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    } = {},
  ) {
    return this.searchService.findAll(callerRole, query);
  }

  async toggleActive(id: string, callerRole: UserRole) {
    return this.statusService.toggleActive(id, callerRole);
  }

  async getSettings(userId: string) {
    return this.profileService.getSettings(userId);
  }

  async updateSettings(userId: string, updates: any) {
    return this.profileService.updateSettings(userId, updates);
  }

  async updateUserDetails(
    userId: string,
    updates: { firstName?: string; lastName?: string; bookingSlug?: string },
  ) {
    return this.statusService.updateUserDetails(userId, updates);
  }
}
