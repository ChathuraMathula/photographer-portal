import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ReportsAggregationService } from './services/reports-aggregation.service.js';

describe('ReportsService', () => {
  let service: ReportsService;
  let reportsAggregationServiceMock: any;

  beforeEach(async () => {
    reportsAggregationServiceMock = {
      generateReportData: jest.fn().mockResolvedValue({
        summary: { totalBookings: 0, conversionRate: 0 },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: {},
        },
        {
          provide: ReportsAggregationService,
          useValue: reportsAggregationServiceMock,
        },
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
