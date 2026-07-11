import { Module } from '@nestjs/common';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';
import { StationLinksService } from './station-links.service';
import { StationLinksController } from './station-links.controller';

@Module({
  imports: [EventsGatewayModule, ],
  controllers: [StationLinksController],
})
export class StationLinksModule {}
