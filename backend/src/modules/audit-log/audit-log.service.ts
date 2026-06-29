import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { entityType?: string; entityId?: string }) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType: filters.entityType,
        entityId: filters.entityId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
