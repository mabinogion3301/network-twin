import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { StationLinksService } from './station-links.service';
import { StationLinksController } from './station-links.controller';

@Module({
  imports: [CommonModule],
  controllers: [StationLinksController],
  providers: [StationLinksService],
})
export class StationLinksModule {}
