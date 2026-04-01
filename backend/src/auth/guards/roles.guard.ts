import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express'; // Import Express Request
import { UserRole } from '../../schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

// 1. Define our custom Request type that includes the User payload
export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    // 2. Cast the request to our strict interface instead of letting it be 'any'
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // 3. Safety check: If for some reason there is no user, deny access
    if (!user) {
      throw new ForbiddenException('No user found on request');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
