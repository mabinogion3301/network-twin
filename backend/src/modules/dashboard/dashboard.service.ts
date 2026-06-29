import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      stationsCount,
      equipmentsCount,
      connectionsCount,
      offlineConnections,
      offlineStations,
      offlineEquipments,
      recentSimulations,
      latestSimulation,
    ] = await Promise.all([
      this.prisma.station.count(),
      this.prisma.equipment.count(),
      this.prisma.connection.count(),
      this.prisma.connection.count({ where: { status: 'OFFLINE' } }),
      this.prisma.station.count({ where: { status: 'OFFLINE' } }),
      this.prisma.equipment.count({ where: { status: 'OFFLINE' } }),
      this.prisma.failureSimulation.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.failureSimulation.findFirst({ orderBy: { createdAt: 'desc' } }),
    ]);

    // Números derivados da ÚLTIMA simulação ativa (não da última executada
    // necessariamente "com falha" — é o estado atual de verdade, incluindo
    // normalizações, já que "Normalizar" também grava um registro novo).
    const activeResult = latestSimulation?.resultJson as
      | {
          removedConnectionIds?: string[];
          isolatedEquipmentIds?: string[];
          unavailableStationPairs?: Array<{ stationAId: string; stationBId: string }>;
        }
      | undefined;

    const linksInFailure = activeResult?.removedConnectionIds?.length ?? 0;
    const equipmentInFailure = activeResult?.isolatedEquipmentIds?.length ?? 0;
    const stationsInFailure = new Set(
      (activeResult?.unavailableStationPairs ?? []).flatMap((p) => [p.stationAId, p.stationBId]),
    ).size;

    return {
      stationsCount,
      equipmentsCount,
      connectionsCount,
      offlineConnections,
      offlineStations,
      offlineEquipments,
      // Estado de falha ATIVO no momento (simulação atual), separado dos
      // contadores estáticos de cadastro acima:
      linksInFailure,
      equipmentInFailure,
      stationsInFailure,
      hasActiveSimulation: linksInFailure > 0 || equipmentInFailure > 0,
      recentSimulations,
    };
  }
}
