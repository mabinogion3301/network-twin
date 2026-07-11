import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { ManufacturersService } from './manufacturers.service';
import { CreateManufacturerDto, UpdateManufacturerDto } from './dto/manufacturer.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('manufacturers')
export class ManufacturersController {
  constructor(private service: ManufacturersService) {}

  @Get()
  @Permissions('equipments.read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('equipments.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('equipments.create')
  create(@Body() dto: CreateManufacturerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('equipments.update')
  update(@Param('id') id: string, @Body() dto: UpdateManufacturerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('equipments.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
