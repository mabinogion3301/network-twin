import { Module } from '@nestjs/common';
import { FailuresService } from './failures.service';
import { FailuresController } from './failures.controller';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule],
  providers: [FailuresService],
  controllers: [FailuresController],
  exports: [FailuresService],
})
export class FailuresModule {}
