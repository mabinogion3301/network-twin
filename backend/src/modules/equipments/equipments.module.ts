import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule, CommonModule],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
})
export class EquipmentsModule {}
