import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { ChatGateway } from '../reservations/chat.gateway';
import { EmailService } from '../email/email.service';
import { NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let reservationRepositoryMock: any;
  let paymentRepositoryMock: any;
  let profileRepositoryMock: any;
  let chatGatewayMock: any;

  beforeEach(async () => {
    reservationRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
    };

    paymentRepositoryMock = {
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
      find: jest.fn().mockResolvedValue([]),
    };

    profileRepositoryMock = {
      findOneBy: jest.fn(),
    };

    chatGatewayMock = {
      server: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepositoryMock,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentRepositoryMock,
        },
        {
          provide: getRepositoryToken(PhotographerProfile),
          useValue: profileRepositoryMock,
        },
        { provide: ChatGateway, useValue: chatGatewayMock },
        {
          provide: EmailService,
          useValue: { sendDepositReceiptEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should throw NotFoundException if processPayment token not found', async () => {
    reservationRepositoryMock.findOne.mockResolvedValue(null);
    await expect(
      service.processPayment({
        token: 'invalid',
        email: 'a@a.com',
        packageId: '1',
        cardNumber: '4000',
        expiryDate: '12/26',
        cvv: '123',
      } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
