import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
