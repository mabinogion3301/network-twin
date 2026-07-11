import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { StationLinksService } from './station-links.service';
import { CreateStationLinkDto, UpdateStationLinkDto } from './dto/station-link.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('station-links')
export class StationLinksController {
  constructor(private service: StationLinksService) {}

  @Get()
  @Permissions('stations.read')
  findAll(@Query('stationId') stationId?: string) {
    return this.service.findAll(stationId);
  }

  @Get(':id')
  @Permissions('stations.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('stations.update')
  create(@Body() dto: CreateStationLinkDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('stations.update')
  update(@Param('id') id: string, @Body() dto: UpdateStationLinkDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('stations.update')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
