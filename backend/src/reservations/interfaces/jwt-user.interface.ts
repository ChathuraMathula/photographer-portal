import { UserRole } from '../../entities/user.entity';

export interface JwtUser {
  userId: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}
