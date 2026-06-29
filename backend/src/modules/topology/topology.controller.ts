import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { TopologyService } from './topology.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('topology')
export class TopologyController {
  constructor(private service: TopologyService) {}

  @Get()
  @Permissions('equipments.read')
  getTopology(
    @Query('city') city?: string,
    @Query('stationId') stationId?: string,
    @Query('typeId') typeId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getTopology({ city, stationId, typeId, status });
  }

  @Get('filters')
  @Permissions('equipments.read')
  getFilterOptions() {
    return this.service.getFilterOptions();
  }

  @Get('geo')
  @Permissions('equipments.read')
  getGeoTopology() {
    return this.service.getGeoTopology();
  }
}
