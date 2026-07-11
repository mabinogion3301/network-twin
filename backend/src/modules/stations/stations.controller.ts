import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { StationsService } from './stations.service';
import { CreateStationDto, StationQueryDto, UpdateStationDto } from './dto/station.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stations')
export class StationsController {
  constructor(private stationsService: StationsService) {}

  @Get()
  @Permissions('stations.read')
  findAll(@Query() query: StationQueryDto) {
    return this.stationsService.findAll(query);
  }

  @Get(':id')
  @Permissions('stations.read')
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @Permissions('stations.create')
  create(@Body() dto: CreateStationDto) {
    return this.stationsService.create(dto);
  }

  @Patch(':id')
  @Permissions('stations.update')
  update(@Param('id') id: string, @Body() dto: UpdateStationDto) {
    return this.stationsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('stations.delete')
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}
