import { Controller, Patch, Post, Body, Param, Get } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentStatus } from '@prisma/client';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async findAll() {
    // Fetches all incidents for the Live Feed[cite: 1]
    return this.incidentsService.getAllIncidents(); 
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: IncidentStatus) {
    return this.incidentsService.updateStatus(id, status);
  }

  @Get(':id/signals')
async getSignals(@Param('id') id: string) {
  return this.incidentsService.getSignalsForIncident(id);
}

  @Post(':id/rca')
  async createRCA(@Param('id') id: string, @Body() rcaData: any) {
    return this.incidentsService.submitRCA(id, rcaData);
  }
}