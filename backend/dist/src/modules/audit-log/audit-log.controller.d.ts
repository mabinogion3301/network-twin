import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private service;
    constructor(service: AuditLogService);
    findAll(entityType?: string, entityId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        action: string;
        userId: string;
        diffJson: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
