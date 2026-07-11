import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma.module';
import { EventsGateway } from '../../modules/events-gateway/events.gateway';

const TOPOLOGY_ENTITIES = new Set(['Stations', 'Equipments', 'Ports', 'Connections', 'StationLinks']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return next.handle();

    const entityType = context.getClass().name.replace('Controller', '');
    const user = request.user;
    const body = request.body;
    const paramId = request.params?.id;

    return next.handle().pipe(
      tap((result) => {
        if (!user?.sub) return;
        const action = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
        const entityId = result?.id ?? paramId ?? 'unknown';

        this.prisma.auditLog
          .create({ data: { entityType, entityId, action, userId: user.sub, diffJson: { input: body ?? null, result: result ?? null } } })
          .catch((err) => console.error('Falha ao gravar AuditLog:', err));

        if (TOPOLOGY_ENTITIES.has(entityType)) {
          this.eventsGateway.broadcastTopologyChanged();
        }
      }),
    );
  }
}
