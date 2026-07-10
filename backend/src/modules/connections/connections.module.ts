import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule, CommonModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
})
export class ConnectionsModule {}
