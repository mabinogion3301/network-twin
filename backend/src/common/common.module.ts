import { Module } from '@nestjs/common';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { EventsGatewayModule } from '../modules/events-gateway/events-gateway.module';

@Module({
  imports: [EventsGatewayModule],
  providers: [AuditLogInterceptor],
  exports: [AuditLogInterceptor],
})
export class CommonModule {}
