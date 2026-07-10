import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PortsService } from './ports.service';
import { PortsController } from './ports.controller';

@Module({
  imports: [CommonModule],
  controllers: [PortsController],
  providers: [PortsService],
})
export class PortsModule {}
