import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { EventsGateway } from '../events-gateway/events.gateway';
import { CreateFailureDto } from './dto/failure.dto';

@Injectable()
export class FailuresService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  async create(dto: CreateFailureDto, userId: string) {
    const failure = await this.prisma.failure.create({
      data: {
        type: dto.type as any,
        targetType: dto.targetType as any,
        targetId: dto.targetId,
        targetName: dto.targetName,
        severity: (dto.severity ?? 'HIGH') as any,
        note: dto.note,
        createdBy: userId,
      },
    });
    await this.broadcastImpact();
    return failure;
  }

  findActive() {
    return this.prisma.failure.findMany({
      where: { status: { not: 'RESTORED' } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findHistory() {
    return this.prisma.failure.findMany({
      where: { status: 'RESTORED' },
      orderBy: { restoredAt: 'desc' },
      take: 200,
    });
  }

  findAll() {
    return this.prisma.failure.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  }

  findOne(id: string) {
    return this.prisma.failure.findUnique({ where: { id } });
  }

  async acknowledge(id: string, userId: string) {
    const failure = await this.prisma.failure.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date(), acknowledgedBy: userId },
    });
    await this.broadcastImpact();
    return failure;
  }

  async restore(id: string, userId: string) {
    const failure = await this.prisma.failure.update({
      where: { id },
      data: { status: 'RESTORED', restoredAt: new Date(), restoredBy: userId },
    });
    await this.broadcastImpact();
    return failure;
  }

  async updateNote(id: string, note: string) {
    const failure = await this.prisma.failure.update({ where: { id }, data: { note } });
    await this.broadcastImpact();
    return failure;
  }

  // ─── Cálculo de impacto ──────────────────────────────────────────────────

  /**
   * Retorna os IDs de conexões que devem ser removidas do grafo,
   * com base nas falhas ATIVAS, para cálculo de impacto.
   */
  async getActiveRemovedConnectionIds(): Promise<string[]> {
    const active = await this.prisma.failure.findMany({
      where: { status: { not: 'RESTORED' } },
    });

    const removed = new Set<string>();

    // Falhas que afetam conexões diretamente
    const connFailures = active.filter((f) => f.targetType === 'CONNECTION' &&
      (f.type === 'NODE_RUPTURE' || f.type === 'NODE_ATTENUATION'));
    for (const f of connFailures) removed.add(f.targetId);

    // Falhas de gerência em estações → remove todas as conexões daquela estação
    const mgmtFailures = active.filter((f) => f.targetType === 'STATION' && f.type === 'MANAGEMENT_FAILURE');
    if (mgmtFailures.length > 0) {
      const stationIds = mgmtFailures.map((f) => f.targetId);
      const connections = await this.prisma.connection.findMany({
        include: {
          sourcePort: { include: { equipment: true } },
          targetPort: { include: { equipment: true } },
        },
      });
      for (const conn of connections) {
        const srcStation = conn.sourcePort.equipment.stationId;
        const tgtStation = conn.targetPort.equipment.stationId;
        if (stationIds.includes(srcStation) || stationIds.includes(tgtStation)) {
          removed.add(conn.id);
        }
      }
    }

    return [...removed];
  }

  /**
   * Retorna o estado atual de falhas para o frontend:
   * - lista de falhas ativas
   * - IDs de conexões removidas do grafo
   * - IDs de estações com superaquecimento / falta de energia / etc.
   */
  async getCurrentImpactState() {
    const active = await this.findActive();
    const removedConnectionIds = await this.getActiveRemovedConnectionIds();

    return {
      failures: active,
      removedConnectionIds,
      stationFailures: active.filter((f) => f.targetType === 'STATION').map((f) => ({
        stationId: f.targetId,
        type: f.type,
        failureId: f.id,
        severity: f.severity,
        status: f.status,
      })),
    };
  }

  // ─── Broadcast via WebSocket ─────────────────────────────────────────────

  private async broadcastImpact() {
    const state = await this.getCurrentImpactState();
    this.eventsGateway.broadcastFailureUpdate(state);
  }
}
