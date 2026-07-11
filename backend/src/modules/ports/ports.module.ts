import { Module } from '@nestjs/common';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';
import { PortsService } from './ports.service';
import { PortsController } from './ports.controller';

@Module({
  imports: [EventsGatewayModule, ],
  controllers: [PortsController],
})
export class PortsModule {}
