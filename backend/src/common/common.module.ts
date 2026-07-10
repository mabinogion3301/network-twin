import { Module } from '@nestjs/common';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { EventsGatewayModule } from '../../modules/events-gateway/events-gateway.module';

/**
 * Módulo compartilhado: expõe o AuditLogInterceptor com todas as suas
 * dependências (PrismaService via PrismaModule global + EventsGateway)
 * já resolvidas, para ser importado pelos módulos que usam @UseInterceptors.
 */
@Module({
  imports: [EventsGatewayModule],
  providers: [AuditLogInterceptor],
  exports: [AuditLogInterceptor],
})
export class CommonModule {}
