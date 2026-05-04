import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsService } from './incidents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getModelToken } from '@nestjs/mongoose';
import { Signal } from '../signals/schemas/signal.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IncidentStatus } from '@prisma/client';

describe('IncidentsService', () => {
  let service: IncidentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    workItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockSignalModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getModelToken(Signal.name), useValue: mockSignalModel },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should reject closing incident without RCA', async () => {
    mockPrismaService.workItem.findUnique.mockResolvedValue({
      id: '1',
      status: 'RESOLVED',
      rca: null,
    });

    await expect(service.updateStatus('1', IncidentStatus.CLOSED))
      .rejects.toThrow(BadRequestException);
  });

  it('should allow closing incident with RCA', async () => {
    const mockIncident = {
      id: '1',
      status: 'RESOLVED',
      startTime: new Date(Date.now() - 60000),
      rca: { id: 'rca1' },
    };
    mockPrismaService.workItem.findUnique.mockResolvedValue(mockIncident);
    mockPrismaService.workItem.update.mockResolvedValue({ ...mockIncident, status: 'CLOSED' });

    const result = await service.updateStatus('1', IncidentStatus.CLOSED);
    expect(result.status).toBe(IncidentStatus.CLOSED);
  });
});
