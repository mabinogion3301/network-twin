import { Module } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { GraphModule } from '../graph/graph.module';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [GraphModule, EventsGatewayModule],
  controllers: [SimulationsController],
  providers: [SimulationsService],
})
export class SimulationsModule {}
