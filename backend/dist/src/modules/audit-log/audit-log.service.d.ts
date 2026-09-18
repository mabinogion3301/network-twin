import { PrismaService } from '../../prisma.module';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters: {
        entityType?: string;
        entityId?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
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
