import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { GraphService } from '../graph/graph.service';
import { GraphEdgeInput } from '../graph/graph.types';
import { RunSimulationDto } from './dto/simulation.dto';
import { EventsGateway } from '../events-gateway/events.gateway';

@Injectable()
export class SimulationsService {
  constructor(
    private prisma: PrismaService,
    private graphService: GraphService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Roda a simulação com a lista de falhas ATIVAS no momento (cumulativa —
   * quem chama decide o que está ativo, somando ou removendo itens antes de
   * chamar). Listas vazias são válidas: representam o estado "tudo normal"
   * (usado pelo botão "Normalizar"), e ainda assim são persistidas e
   * transmitidas via WebSocket, para o estado ficar consistente entre todos
   * os usuários conectados e sobreviver à navegação entre telas.
   */
  async run(dto: RunSimulationDto, triggeredByUserId: string) {
    const connectionIds = dto.connectionIds ?? [];
    const equipmentIds = dto.equipmentIds ?? [];

    // Resolve connectionIds que podem ter sido informados por NOME (ex: "FO-023")
    // em vez de UUID — é assim que o operador vai descrever a falha no dia a dia.
    const resolvedConnections = connectionIds.length
      ? await this.prisma.connection.findMany({
          where: { OR: [{ id: { in: connectionIds } }, { name: { in: connectionIds } }] },
          select: { id: true, name: true },
        })
      : [];
    const resolvedConnectionIds = resolvedConnections.map((c) => c.id);

    // Carrega todo o grafo ativo: equipamentos, conexões e vínculos diretos entre estações
    const [allEquipments, allConnections, allStationLinks] = await Promise.all([
      this.prisma.equipment.findMany({ select: { id: true, stationId: true } }),
      this.prisma.connection.findMany({
        where: { status: { not: 'DISABLED' } },
        include: { sourcePort: true, targetPort: true },
      }),
      this.prisma.stationLink.findMany(),
    ]);

    const equipmentToStation: Record<string, string> = {};
    for (const eq of allEquipments) equipmentToStation[eq.id] = eq.stationId;

    const allEdges: GraphEdgeInput[] = allConnections.map((conn) => ({
      connectionId: conn.id,
      equipmentA: conn.sourcePort.equipmentId,
      equipmentB: conn.targetPort.equipmentId,
    }));

    const directStationLinks = allStationLinks.map((link) => ({
      linkId: link.id,
      stationAId: link.stationAId,
      stationBId: link.stationBId,
    }));

    const result = this.graphService.simulateFailure({
      allEquipmentIds: allEquipments.map((e) => e.id),
      equipmentToStation,
      allEdges,
      directStationLinks,
      removedConnectionIds: resolvedConnectionIds,
      removedEquipmentIds: equipmentIds,
    });

    // Enriquece o resultado com nomes (para exibir no frontend sem round-trip extra)
    const [stationsById, equipmentsById] = await Promise.all([
      this.prisma.station.findMany({ select: { id: true, name: true } }).then((rows) => Object.fromEntries(rows.map((r) => [r.id, r.name]))),
      this.prisma.equipment.findMany({ select: { id: true, name: true } }).then((rows) => Object.fromEntries(rows.map((r) => [r.id, r.name]))),
    ]);

    const enrichedResult = {
      ...result,
      removedConnectionIds: resolvedConnectionIds,
      removedEquipmentIds: equipmentIds,
      unavailableStationPairs: result.unavailableStationPairs.map((pair) => ({
        ...pair,
        stationAName: stationsById[pair.stationAId],
        stationBName: stationsById[pair.stationBId],
      })),
      isolatedEquipment: result.isolatedEquipmentIds.map((id) => ({ id, name: equipmentsById[id] })),
      impactedConnections: resolvedConnections.filter((c) => result.impactedConnectionIds.includes(c.id)),
    };

    const simulation = await this.prisma.failureSimulation.create({
      data: {
        triggeredByUserId,
        removedConnectionIds: resolvedConnectionIds,
        removedEquipmentIds: equipmentIds,
        resultJson: enrichedResult as any,
      },
    });

    const fullResult = { simulationId: simulation.id, ...enrichedResult };
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

  /**
   * Estado ATUAL da rede (última simulação executada, incluindo normalizações).
   * Usado pelo frontend ao entrar/voltar para o Mapa, para restaurar o que
   * estava ativo em vez de começar sempre do zero.
   */
  async getCurrentState() {
    const latest = await this.prisma.failureSimulation.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!latest) return null;
    return { simulationId: latest.id, ...(latest.resultJson as Record<string, unknown>) };
  }
}
