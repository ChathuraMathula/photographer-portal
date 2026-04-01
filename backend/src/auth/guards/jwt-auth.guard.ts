import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This automatically invokes the 'jwt' strategy we defined in jwt.strategy.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
