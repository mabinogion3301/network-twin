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
      | { stats?: { normal: number; degrading: number; impacted: number; isolated: number }; removedConnectionIds?: string[] }
      | undefined;

    const linksInFailure = activeResult?.removedConnectionIds?.length ?? 0;
    const stationsIsolated = activeResult?.stats?.isolated ?? 0;
    const stationsDegrading = activeResult?.stats?.degrading ?? 0;
    const stationsImpacted = activeResult?.stats?.impacted ?? 0;

    return {
      stationsCount,
      equipmentsCount,
      connectionsCount,
      offlineConnections,
      offlineStations,
      offlineEquipments,
      linksInFailure,
      stationsIsolated,
      stationsDegrading,
      stationsImpacted,
      hasActiveSimulation: linksInFailure > 0 || stationsIsolated > 0,
      recentSimulations,
    };
  }
}
