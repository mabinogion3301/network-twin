import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { EquipmentTypesService } from './equipment-types.service';
import { EquipmentTypesController } from './equipment-types.controller';

@Module({
  imports: [CommonModule],
  controllers: [EquipmentTypesController],
  providers: [EquipmentTypesService],
  exports: [EquipmentTypesService],
})
export class EquipmentTypesModule {}
