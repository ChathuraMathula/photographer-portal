import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { EmailService } from '../../email/email.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { ChatGateway } from '../../reservations/chat.gateway';

@Injectable()
export class UserStatusService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly chatGateway: ChatGateway,
    private readonly emailService: EmailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async toggleActive(id: string, callerRole: UserRole) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admins can approve/activate pending accounts, but cannot suspend active accounts
    if (callerRole === UserRole.ADMIN) {
      if (user.role !== UserRole.PHOTOGRAPHER && user.role !== UserRole.STUDIO) {
        throw new ForbiddenException(
          'Admins can only review Photographers and Studios.',
        );
      }
      if (user.isActive) {
        throw new ForbiddenException(
          'Admins cannot suspend active accounts. Only Super Admins have suspension privileges.',
        );
      }
    }

    const wasActive = user.isActive;
    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    // If user was just DEACTIVATED: emit real-time event + send email
    if (wasActive && !user.isActive) {
      // Emit WebSocket event to the user's personal room so they get logged out in real-time
      try {
        this.chatGateway.server.to(`user_${id}`).emit('userDeactivated', {
          userId: id,
          message: 'Your account has been suspended by an administrator.',
        });
      } catch (err) {
        console.error('Failed to emit userDeactivated event:', err);
      }

      // Send deactivation email
      try {
        await this.emailService.sendAccountDeactivated(
          user.email,
          user.firstName,
        );
      } catch (err) {
        console.error('Failed to send account deactivated email:', err);
      }
    }

    await this.auditLogsService.logAction(
      'USER_STATUS_TOGGLED',
      `User ${user.email} active status toggled to ${user.isActive} by admin`,
      user.id,
      user.email,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async updateUserDetails(
    userId: string,
    updates: { firstName?: string; lastName?: string; bookingSlug?: string },
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    await this.userRepository.save(user);

    let finalSlug: string | null = null;
    const profile = await this.profileRepository.findOneBy({ userId });

    if (profile && updates.bookingSlug) {
      if (profile.bookingSlug !== updates.bookingSlug) {
        const existing = await this.profileRepository.findOneBy({
          bookingSlug: updates.bookingSlug,
        });
        if (existing) {
          throw new ConflictException('Booking slug is already in use');
        }
        profile.bookingSlug = updates.bookingSlug;
        await this.profileRepository.save(profile);
      }
      finalSlug = profile.bookingSlug;
    }

    await this.auditLogsService.logAction(
      'USER_DETAILS_UPDATED',
      `User ${userId} details (name/slug) were updated by super admin`,
      userId,
    );

    // Send email notification when user details are updated
    try {
      await this.emailService.sendUserDetailsUpdated(
        user.email,
        user.firstName,
      );
    } catch (err) {
      console.error('Failed to send user details updated email:', err);
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      bookingSlug: finalSlug,
    };
  }
}
