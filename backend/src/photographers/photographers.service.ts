import { Injectable } from '@nestjs/common';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { PhotographerQueryService } from './services/photographer-query.service';
import { PhotographerUpdateService } from './services/photographer-update.service';

@Injectable()
export class PhotographersService {
  constructor(
    private readonly queryService: PhotographerQueryService,
    private readonly updateService: PhotographerUpdateService,
  ) {}

  async findAll() {
    return this.queryService.findAll();
  }

  async findOne(userId: string) {
    return this.queryService.findOne(userId);
  }

  async updateProfile(userId: string, updates: Partial<PhotographerProfile>) {
    return this.updateService.updateProfile(userId, updates);
  }

  async getBookingLink(userId: string, baseUrl: string) {
    return this.queryService.getBookingLink(userId, baseUrl);
  }

  async toggleAvailability(userId: string) {
    return this.updateService.toggleAvailability(userId);
  }
}
