import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';

export async function aggregateSystemStats(
  userRepository: Repository<User>,
): Promise<
  {
    totalPhotographers: number;
    totalAdmins: number;
    totalSuspended: number
  }
> {
  const [
    totalPhotographers,
    totalAdmins,
    totalSuspended
  ] = await Promise.all([
    userRepository.count({
      where: { role: UserRole.PHOTOGRAPHER, isActive: true }
    }),
    userRepository.count({
      where: { role: UserRole.ADMIN, isActive: true }
    }),
    userRepository.count({
      where: { isActive: false }
    }),
  ]);

  return {
    totalPhotographers,
    totalAdmins,
    totalSuspended,
  };
}
