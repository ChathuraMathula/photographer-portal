import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../schemas/user.schema';

// This creates a key 'roles' in the request metadata
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
