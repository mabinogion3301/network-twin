import { Module } from '@nestjs/common';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';
import { EquipmentTypesService } from './equipment-types.service';
import { EquipmentTypesController } from './equipment-types.controller';

@Module({
  imports: [EventsGatewayModule, ],
  controllers: [EquipmentTypesController],
  exports: [EquipmentTypesService],
})
export class EquipmentTypesModule {}
