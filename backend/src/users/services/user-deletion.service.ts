import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class UserDeletionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async deleteUser(targetUserId: string, callerRole: UserRole) {
    if (callerRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only Super Admins have permission to delete user accounts.',
      );
    }

    const user = await this.userRepository.findOneBy({ id: targetUserId });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.userRepository.remove(user);

    await this.auditLogsService.logAction(
      'USER_DELETED',
      `Super Admin deleted user ${user.email} (${user.role})`,
      user.id,
      user.email,
    );

    return {
      message: `User ${user.email} was successfully deleted.`,
    };
  }
}
