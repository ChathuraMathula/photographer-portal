import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation } from '../entities/reservation.entity';
import { Message } from '../entities/message.entity';
import { Payment } from '../entities/payment.entity';
import { ChatGateway } from '../reservations/chat.gateway';
import { EmailService } from '../email/email.service';
import { NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let profileRepositoryMock: any;
  let customerRepositoryMock: any;

  beforeEach(async () => {
    profileRepositoryMock = {
      findOne: jest.fn(),
    };

    customerRepositoryMock = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(PhotographerProfile),
          useValue: profileRepositoryMock,
        },
        { provide: getRepositoryToken(User), useValue: {} },
        {
          provide: getRepositoryToken(Customer),
          useValue: customerRepositoryMock,
        },
        { provide: getRepositoryToken(Reservation), useValue: {} },
        { provide: getRepositoryToken(Message), useValue: {} },
        { provide: getRepositoryToken(Payment), useValue: {} },
        { provide: ChatGateway, useValue: {} },
        { provide: EmailService, useValue: {} },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('getPhotographerProfile', () => {
    it('should throw NotFoundException if profile does not exist', async () => {
      profileRepositoryMock.findOne.mockResolvedValue(null);
      await expect(service.getPhotographerProfile('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if photographer is inactive', async () => {
      profileRepositoryMock.findOne.mockResolvedValue({
        user: { isActive: false },
      });
      await expect(
        service.getPhotographerProfile('inactive-slug'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
