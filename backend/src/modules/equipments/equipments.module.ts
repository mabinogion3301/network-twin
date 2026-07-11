import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule],
  controllers: [EquipmentsController],
})
export class EquipmentsModule {}
