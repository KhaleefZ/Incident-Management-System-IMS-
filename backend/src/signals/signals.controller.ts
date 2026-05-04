import { Controller, Post, Body } from '@nestjs/common';
import { SignalsService } from './signals.service';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post('ingest')
  async ingestSignal(
    @Body() dto: { componentId: string; severity: string; payload: any }
  ) {
    return this.signalsService.ingestSignal(dto);
  }
}
