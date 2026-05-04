import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../../prisma/prisma.service';
import { IncidentStatus } from '@prisma/client';
import { CriticalAlertStrategy, StandardAlertStrategy } from './strategies/alert.strategy';
import { Signal } from '../signals/schemas/signal.schema';

@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(Signal.name) private signalModel: Model<Signal>,
  ) {}

  // Fetches all incidents for the dashboard feed
  async getAllIncidents() {
    return this.prisma.workItem.findMany({
      orderBy: {
        startTime: 'desc',
      },
      include: {
        rca: true,
      },
    });
  }

  // Manages state transitions and the Mandatory RCA rule
  async updateStatus(id: string, newStatus: IncidentStatus) {
    const incident = await this.prisma.workItem.findUnique({
      where: { id },
      include: { rca: true },
    });

    if (!incident) throw new NotFoundException('Incident not found');

    // Reject closure if RCA is missing
    if (newStatus === IncidentStatus.CLOSED && !incident.rca) {
      throw new BadRequestException('Cannot CLOSE incident without a completed RCA.');
    }

    let mttr = incident.mttr;
    let endTime = incident.endTime;

    // Calculate MTTR automatically on closure
    if (newStatus === IncidentStatus.CLOSED) {
      endTime = new Date();
      const diffInMs = endTime.getTime() - incident.startTime.getTime();
      mttr = diffInMs / (1000 * 60); // minutes
    }

    const updated = await this.prisma.workItem.update({
      where: { id },
      data: { status: newStatus, endTime, mttr },
    });

    // Alerting Strategy Pattern execution
    if (newStatus === IncidentStatus.RESOLVED) {
      const strategy = (updated.severity === 'P0' || updated.severity === 'P1')
        ? new CriticalAlertStrategy()
        : new StandardAlertStrategy();

      await strategy.sendAlert(updated.componentId, updated.severity);
    }

    return updated;
  }

  // Inside IncidentsService
  async getSignalsForIncident(workItemId: string) {
    // Queries the signal collection via Mongoose (MongoDB)
    return this.signalModel.find({ workItemId }).sort({ timestamp: -1 }).exec();
  }

  // Persists the Root Cause Analysis record
  async submitRCA(workItemId: string, rcaData: any) {
    return this.prisma.rCA.create({
      data: {
        workItemId,
        rootCauseCategory: rcaData.rootCauseCategory,
        fixApplied: rcaData.fixApplied,
        preventionSteps: rcaData.preventionSteps,
      },
    });
  }
}