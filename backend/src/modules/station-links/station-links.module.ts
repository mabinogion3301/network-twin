import { Module } from '@nestjs/common';
import { StationLinksService } from './station-links.service';
import { StationLinksController } from './station-links.controller';

@Module({
  controllers: [StationLinksController],
  providers: [StationLinksService],
})
export class StationLinksModule {}
