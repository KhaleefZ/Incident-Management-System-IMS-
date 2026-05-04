import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ObservabilityService } from './observability.service';

@Module({
  controllers: [HealthController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class CommonModule {}
