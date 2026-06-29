import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { PortsService } from './ports.service';
import { CreatePortDto, PortQueryDto, UpdatePortDto } from './dto/port.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('ports')
export class PortsController {
  constructor(private service: PortsService) {}

  @Get()
  @Permissions('ports.read')
  findAll(@Query() query: PortQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('ports.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('ports.create')
  create(@Body() dto: CreatePortDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('ports.update')
  update(@Param('id') id: string, @Body() dto: UpdatePortDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('ports.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
