import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Package } from '../entities/package.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PackagesService', () => {
  let service: PackagesService;
  let packageRepositoryMock: any;

  beforeEach(async () => {
    packageRepositoryMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getRepositoryToken(Package),
          useValue: packageRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException if package is not found', async () => {
      packageRepositoryMock.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('invalid', 'p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if photographerId does not match', async () => {
      packageRepositoryMock.findOneBy.mockResolvedValue({
        id: 'pkg1',
        photographerId: 'p2',
      });
      await expect(service.findOne('pkg1', 'p1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return package if found and belongs to photographer', async () => {
      const mockPkg = { id: 'pkg1', photographerId: 'p1' };
      packageRepositoryMock.findOneBy.mockResolvedValue(mockPkg);
      const result = await service.findOne('pkg1', 'p1');
      expect(result).toBe(mockPkg);
    });
  });
});
