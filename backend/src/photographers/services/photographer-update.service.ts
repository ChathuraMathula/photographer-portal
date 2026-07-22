import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { ChatGateway } from '../../reservations/chat.gateway';

@Injectable()
export class PhotographerUpdateService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async updateProfile(userId: string, updates: Partial<PhotographerProfile>) {
    const allowed = [
      'bio',
      'specializations',
      'portfolioUrl',
      'profileImageUrl',
      'baseLocation',
      'isAvailableForBooking',
      'allowedEventTypes',
      'allowCustomEventTypes',
      'universalDepositType',
      'universalDepositValue',
      'offlineMessage',
      'showManualBookingInTopbar',
      'showAcceptBookingsInTopbar',
      'city',
      'district',
      'locationMapLink',
      'showMapPreviewOnBookingPage',
    ];
    const safe = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k)),
    );

    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    Object.assign(profile, safe);
    const saved = await this.profileRepository.save(profile);

    this.chatGateway.broadcastProfileUpdate(saved.bookingSlug, {
      bookingSlug: saved.bookingSlug,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      bio: saved.bio,
      specializations: saved.specializations,
      portfolioUrl: saved.portfolioUrl,
      profileImageUrl: saved.profileImageUrl,
      baseLocation: saved.baseLocation,
      city: saved.city,
      district: saved.district,
      locationMapLink: saved.locationMapLink,
      showMapPreviewOnBookingPage: saved.showMapPreviewOnBookingPage,
      isAvailableForBooking: saved.isAvailableForBooking,
      allowedEventTypes: saved.allowedEventTypes,
      allowCustomEventTypes: saved.allowCustomEventTypes,
      offlineMessage: saved.offlineMessage,
    });

    return saved;
  }

  async toggleAvailability(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    profile.isAvailableForBooking = !profile.isAvailableForBooking;
    const saved = await this.profileRepository.save(profile);

    this.chatGateway.broadcastProfileUpdate(saved.bookingSlug, {
      bookingSlug: saved.bookingSlug,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      bio: saved.bio,
      specializations: saved.specializations,
      portfolioUrl: saved.portfolioUrl,
      profileImageUrl: saved.profileImageUrl,
      baseLocation: saved.baseLocation,
      city: saved.city,
      district: saved.district,
      locationMapLink: saved.locationMapLink,
      showMapPreviewOnBookingPage: saved.showMapPreviewOnBookingPage,
      isAvailableForBooking: saved.isAvailableForBooking,
      allowedEventTypes: saved.allowedEventTypes,
      allowCustomEventTypes: saved.allowCustomEventTypes,
      offlineMessage: saved.offlineMessage,
    });

    return saved;
  }
}
