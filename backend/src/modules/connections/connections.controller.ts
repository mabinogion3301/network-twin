import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { ConnectionsService } from './connections.service';
import { ConnectionQueryDto, CreateConnectionDto, UpdateConnectionDto } from './dto/connection.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('connections')
export class ConnectionsController {
  constructor(private service: ConnectionsService) {}

  @Get()
  @Permissions('connections.read')
  findAll(@Query() query: ConnectionQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('connections.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('connections.create')
  create(@Body() dto: CreateConnectionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('connections.update')
  update(@Param('id') id: string, @Body() dto: UpdateConnectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('connections.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
