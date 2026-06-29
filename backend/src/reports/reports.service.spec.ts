import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let reservationRepositoryMock: any;
  let paymentRepositoryMock: any;
  let userRepositoryMock: any;

  beforeEach(async () => {
    reservationRepositoryMock = {
      find: jest.fn().mockResolvedValue([]),
    };

    paymentRepositoryMock = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    userRepositoryMock = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepositoryMock,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentRepositoryMock,
        },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should generate empty report data if database is empty', async () => {
    const data = await service.generateReportData('p1', 'monthly');
    expect(data.summary.totalBookings).toBe(0);
    expect(data.summary.conversionRate).toBe(0);
  });
});
