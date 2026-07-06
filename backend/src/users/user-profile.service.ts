import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    };
  }

  async updateProfile(userId: string, updates: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.firstName !== undefined) user.firstName = updates.firstName;
    if (updates.lastName !== undefined) user.lastName = updates.lastName;
    if (updates.phone !== undefined) user.phone = updates.phone;

    if (updates.password) {
      user.passwordHash = await bcrypt.hash(updates.password, 10);
    }

    await this.userRepository.save(user);

    await this.auditLogsService.logAction(
      'PROFILE_UPDATED',
      `User ${user.email} updated their profile settings`,
      user.id,
      user.email,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    };
  }

  async getSettings(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      reminderEmailsEnabled: user.reminderEmailsEnabled,
      inAppNotificationsEnabled: user.inAppNotificationsEnabled,
    };
  }

  async updateSettings(userId: string, updates: any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.emailNotificationsEnabled !== undefined) {
      user.emailNotificationsEnabled = updates.emailNotificationsEnabled;
    }
    if (updates.reminderEmailsEnabled !== undefined) {
      user.reminderEmailsEnabled = updates.reminderEmailsEnabled;
    }
    if (updates.inAppNotificationsEnabled !== undefined) {
      user.inAppNotificationsEnabled = updates.inAppNotificationsEnabled;
    }

    await this.userRepository.save(user);

    await this.auditLogsService.logAction(
      'SETTINGS_UPDATED',
      `User ${user.email} updated their settings (Email: ${user.emailNotificationsEnabled}, Reminders: ${user.reminderEmailsEnabled}, InApp: ${user.inAppNotificationsEnabled})`,
      user.id,
      user.email,
    );

    return {
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      reminderEmailsEnabled: user.reminderEmailsEnabled,
      inAppNotificationsEnabled: user.inAppNotificationsEnabled,
    };
  }
}
