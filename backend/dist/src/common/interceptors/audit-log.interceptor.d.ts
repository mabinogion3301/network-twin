import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma.module';
import { EventsGateway } from '../../modules/events-gateway/events.gateway';
export declare class AuditLogInterceptor implements NestInterceptor {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
