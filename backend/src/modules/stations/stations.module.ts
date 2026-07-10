import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule, CommonModule],
  controllers: [StationsController],
  providers: [StationsService],
})
export class StationsModule {}
