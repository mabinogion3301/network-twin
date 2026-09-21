import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { GraphService } from '../graph/graph.service';
import { RunSimulationDto } from './dto/simulation.dto';
import { EventsGateway } from '../events-gateway/events.gateway';

@Injectable()
export class SimulationsService {
  constructor(
    private prisma: PrismaService,
    private graphService: GraphService,
    private eventsGateway: EventsGateway,
  ) {}

  async run(dto: RunSimulationDto, triggeredByUserId: string) {
    const connectionIds = dto.connectionIds ?? [];
    const failedStationIds = dto.failedStationIds ?? [];

    // Resolve nomes de conexão → IDs reais
    const resolvedConnections = connectionIds.length
      ? await this.prisma.connection.findMany({
          where: { OR: [{ id: { in: connectionIds } }, { name: { in: connectionIds } }] },
          select: { id: true, name: true },
        })
      : [];
    const resolvedConnectionIds = resolvedConnections.map((c) => c.id);

    // Carrega dados para construir o grafo de estações
    const [allStations, allConnections] = await Promise.all([
      this.prisma.station.findMany({ select: { id: true, name: true, isCore: true } }),
      this.prisma.connection.findMany({
        where: { status: { not: 'DISABLED' } },
        include: {
          sourcePort: { include: { equipment: true } },
          targetPort: { include: { equipment: true } },
        },
      }),
    ]);

    // Monta conexões entre ESTAÇÕES (não equipamentos) para o grafo
    const stationConnections = allConnections
      .map((conn) => ({
        id: conn.id,
        stationAId: conn.sourcePort?.equipment?.stationId ?? '',
        stationBId: conn.targetPort?.equipment?.stationId ?? '',
      }))
      .filter((c) => c.stationAId && c.stationBId && c.stationAId !== c.stationBId);

    console.log(`[Impact] ${allStations.length} estações, ${stationConnections.length} conexões inter-estação, ${allFailedConnectionIds.length} falhas, ${coreStationIds.length} COREs`);

    const allStationIds = allStations.map((s) => s.id);
    const coreStationIds = allStations.filter((s) => s.isCore).map((s) => s.id);

    // Conexões rompidas = as explicitamente passadas + todas que tocam estações
    // com perda de gerência (simular queda da estação)
    const stationFailureConnIds = failedStationIds.length > 0
      ? stationConnections
          .filter((c) => failedStationIds.includes(c.stationAId) || failedStationIds.includes(c.stationBId))
          .map((c) => c.id)
      : [];

    const allFailedConnectionIds = [...new Set([...resolvedConnectionIds, ...stationFailureConnIds])];

    // Executa o motor de impacto
    const impact = this.graphService.computeImpact({
      stationConnections,
      allStationIds,
      coreStationIds,
      failedConnectionIds: allFailedConnectionIds,
    });

    const result = {
      removedConnectionIds: resolvedConnectionIds,
      failedStationIds,
      stationStates: impact.stationStates,
      isolatedStationIds: impact.isolatedStationIds,
      degradingStationIds: impact.degradingStationIds,
      impactedStationIds: impact.impactedStationIds,
      normalStationIds: impact.normalStationIds,
      stats: impact.stats,
      coreStationIds,
    };

    const simulation = await this.prisma.failureSimulation.create({
      data: {
        triggeredByUserId,
        removedConnectionIds: resolvedConnectionIds,
        removedEquipmentIds: [],
        resultJson: result as any,
      },
    });

    const fullResult = { simulationId: simulation.id, ...result };
    this.eventsGateway.broadcastSimulationResult(fullResult);
    return fullResult;
  }

  findHistory() {
    return this.prisma.failureSimulation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    return this.prisma.failureSimulation.findUnique({ where: { id } });
  }

  async getCurrentState() {
    const latest = await this.prisma.failureSimulation.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!latest) return null;
    return { simulationId: latest.id, notes: latest.notes ?? '', ...(latest.resultJson as Record<string, unknown>) };
  }

  async updateNotes(id: string, notes: string) {
    const updated = await this.prisma.failureSimulation.update({ where: { id }, data: { notes } });
    const result = { simulationId: updated.id, notes: updated.notes ?? '', ...(updated.resultJson as Record<string, unknown>) };
    this.eventsGateway.broadcastSimulationResult(result);
    return result;
  }

  async updateConnectionNote(simulationId: string, connectionId: string, note: string) {
    const simulation = await this.prisma.failureSimulation.findUnique({ where: { id: simulationId } });
    if (!simulation) return null;
    const result = simulation.resultJson as Record<string, any>;
    const connectionNotes = result.connectionNotes ?? {};
    connectionNotes[connectionId] = note;
    const updated = await this.prisma.failureSimulation.update({
      where: { id: simulationId },
      data: { resultJson: { ...result, connectionNotes } },
    });
    const fullResult = { simulationId: updated.id, notes: updated.notes ?? '', ...(updated.resultJson as Record<string, unknown>) };
    this.eventsGateway.broadcastSimulationResult(fullResult);
    return fullResult;
  }
}
