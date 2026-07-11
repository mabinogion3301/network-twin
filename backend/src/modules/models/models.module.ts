import { Module } from '@nestjs/common';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';

@Module({
  imports: [EventsGatewayModule, ],
  controllers: [ModelsController],
  exports: [ModelsService],
})
export class ModelsModule {}
