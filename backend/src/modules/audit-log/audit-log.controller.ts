import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { AuditLogService } from './audit-log.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-log')
export class AuditLogController {
  constructor(private service: AuditLogService) {}

  @Get()
  @Permissions('users.read')
  findAll(@Query('entityType') entityType?: string, @Query('entityId') entityId?: string) {
    return this.service.findAll({ entityType, entityId });
  }
}
