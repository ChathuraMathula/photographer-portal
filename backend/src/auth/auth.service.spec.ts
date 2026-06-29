import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let jwtServiceMock: any;
  let emailServiceMock: any;
  let auditLogsServiceMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    emailServiceMock = {
      sendResetPasswordEmail: jest.fn(),
    };

    auditLogsServiceMock = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: AuditLogsService, useValue: auditLogsServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      userRepositoryMock.findOneBy.mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        isActive: true,
      };
      userRepositoryMock.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        isActive: true,
        role: UserRole.PHOTOGRAPHER,
        firstName: 'Sarah',
      };
      userRepositoryMock.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
