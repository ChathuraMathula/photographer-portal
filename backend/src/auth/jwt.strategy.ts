import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number; // 'Issued At' timestamp automatically added by JwtService
  exp?: number; // 'Expiration' timestamp automatically added by JwtService
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SUPER_SECRET_KEY_CHANGE_ME', // TODO: Move to .env
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
