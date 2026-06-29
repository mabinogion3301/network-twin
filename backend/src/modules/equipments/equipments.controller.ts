import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto, EquipmentQueryDto, UpdateEquipmentDto } from './dto/equipment.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('equipments')
export class EquipmentsController {
  constructor(private service: EquipmentsService) {}

  @Get()
  @Permissions('equipments.read')
  findAll(@Query() query: EquipmentQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('equipments.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('equipments.create')
  create(@Body() dto: CreateEquipmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('equipments.update')
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('equipments.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
