import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ObservabilityService implements OnModuleInit {
  private readonly logger = new Logger(ObservabilityService.name);
  private redis = new Redis(); // Connects to ims_redis
  private readonly METRIC_KEY = 'signals_count';

  onModuleInit() {
    // Console throughput metrics every 5 seconds
    setInterval(async () => {
      const count = await this.redis.getset(this.METRIC_KEY, '0');
      const throughput = parseInt(count || '0', 10) / 5;
      this.logger.log(`Throughput: ${throughput.toFixed(2)} signals/sec`);
    }, 5000);
  }

  async incrementSignalCount() {
    await this.redis.incr(this.METRIC_KEY);
  }
}