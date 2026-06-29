/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Customer } from '../entities/customer.entity';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { Payment } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Message } from '../entities/message.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { EmailService } from '../email/email.service';
import { ChatGateway } from './chat.gateway';
import { BadRequestException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationRepositoryMock: any;
  let packageRepositoryMock: any;
  let customerRepositoryMock: any;
  let paymentRepositoryMock: any;
  let photographerProfileRepositoryMock: any;
  let userRepositoryMock: any;
  let messageRepositoryMock: any;
  let chatGatewayMock: any;

  beforeEach(async () => {
    reservationRepositoryMock = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    packageRepositoryMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    customerRepositoryMock = {
      findOneBy: jest.fn(),
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
    };

    paymentRepositoryMock = {
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
    };

    photographerProfileRepositoryMock = {
      findOneBy: jest.fn(),
    };

    userRepositoryMock = {
      findOneBy: jest.fn(),
    };

    messageRepositoryMock = {
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
    };

    chatGatewayMock = {
      server: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
      broadcastAvailabilityChange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepositoryMock,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: customerRepositoryMock,
        },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        {
          provide: getRepositoryToken(Package),
          useValue: packageRepositoryMock,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepositoryMock,
        },
        {
          provide: getRepositoryToken(PhotographerProfile),
          useValue: photographerProfileRepositoryMock,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentRepositoryMock,
        },
        { provide: ChatGateway, useValue: chatGatewayMock },
        {
          provide: EmailService,
          useValue: {
            sendNewBookingNotification: jest.fn(),
            sendProposalEmail: jest.fn(),
            sendDepositReceiptEmail: jest.fn(),
            sendQuotationProposed: jest.fn(),
          },
        },
        { provide: AuditLogsService, useValue: { logAction: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('proposeQuotation', () => {
    it('should throw BadRequestException if reservation is not PENDING or PROPOSED', async () => {
      const mockRes = { id: '1', status: ReservationStatus.CONFIRMED };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRes as any);

      await expect(
        service.proposeQuotation(
          '1',
          { packageIds: [], advancePaymentPriceInCents: 0 },
          {
            userId: 'p1',
            email: 'p@ex.com',
            role: 'photographer',
          } as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should keep existing paymentDeadline if proposal is updated', async () => {
      const existingDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
      const mockRes = {
        id: '1',
        status: ReservationStatus.PENDING,
        paymentDeadline: existingDeadline,
        photographerId: 'p1',
        date: new Date(),
        startTime: '10:00',
        endTime: '12:00',
        customer: {
          email: 'test@example.com',
          firstName: 'Amali',
          lastName: 'Silva',
        },
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRes as any);
      packageRepositoryMock.find.mockResolvedValue([
        { id: 'pkg1', priceInCents: 5000 },
      ]);

      const result = await service.proposeQuotation(
        '1',
        { packageIds: ['pkg1'], advancePaymentPriceInCents: 5000 },
        { userId: 'p1', email: 'p@ex.com', role: 'photographer' } as any,
      );
      expect(result.paymentDeadline).toBe(existingDeadline);
    });
  });
});
