import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';

export interface TopologyNode {
  data: {
    id: string;
    label: string;
    type: 'station' | 'equipment';
    parent?: string; // id da estação — usado pelo Cytoscape para agrupar visualmente
    equipmentType?: string;
    stationId?: string;
    stationName?: string;
    city?: string;
    state?: string;
    status: string;
    ip?: string | null;
  };
  position?: { x: number; y: number };
}

export interface TopologyEdge {
  data: {
    id: string;
    source: string; // equipmentId de origem
    target: string; // equipmentId de destino
    label: string;
    status: string;
    type: string;
    isBackup: boolean;
  };
}

export interface TopologyFilters {
  city?: string;
  stationId?: string;
  typeId?: string;
  status?: string;
}

@Injectable()
export class TopologyService {
  constructor(private prisma: PrismaService) {}

  async getTopology(filters: TopologyFilters) {
    const stations = await this.prisma.station.findMany({
      where: {
        id: filters.stationId,
        city: filters.city ? { equals: filters.city, mode: 'insensitive' } : undefined,
      },
    });
    const stationIds = new Set(stations.map((s) => s.id));

    const equipments = await this.prisma.equipment.findMany({
      where: {
        stationId: { in: Array.from(stationIds) },
        typeId: filters.typeId,
        status: filters.status as any,
      },
      include: { station: true, type: true },
    });

    const equipmentIds = new Set(equipments.map((e) => e.id));

    const connections = await this.prisma.connection.findMany({
      where: {
        sourcePort: { equipmentId: { in: Array.from(equipmentIds) } },
        targetPort: { equipmentId: { in: Array.from(equipmentIds) } },
      },
      include: {
        sourcePort: true,
        targetPort: true,
      },
    });

    // Nó de cada ESTAÇÃO — desenhado como ícone de torre de telecom no mapa.
    // É um nó "composto" do Cytoscape: os equipamentos dela ficam visualmente
    // agrupados dentro dela (via campo `parent`).
    const stationNodes: TopologyNode[] = stations.map((st) => ({
      data: {
        id: st.id,
        label: st.name,
        type: 'station',
        city: st.city,
        state: st.state,
        status: st.status,
      },
      position:
        st.mapPositionX != null && st.mapPositionY != null
          ? { x: st.mapPositionX, y: st.mapPositionY }
          : undefined,
    }));

    const equipmentNodes: TopologyNode[] = equipments.map((eq) => ({
      data: {
        id: eq.id,
        label: eq.name,
        type: 'equipment',
        parent: eq.stationId,
        equipmentType: eq.type.name,
        stationId: eq.stationId,
        stationName: eq.station.name,
        city: eq.station.city,
        state: eq.station.state,
        status: eq.status,
        ip: eq.ip,
      },
    }));

    const edges: TopologyEdge[] = connections.map((conn) => ({
      data: {
        id: conn.id,
        source: conn.sourcePort.equipmentId,
        target: conn.targetPort.equipmentId,
        label: conn.name,
        status: conn.status,
        type: conn.type,
        isBackup: conn.isBackup,
      },
    }));

    return { nodes: [...stationNodes, ...equipmentNodes], edges };
  }

  // Lista de cidades/estações distintas, usada para popular os filtros do frontend
  async getFilterOptions() {
    const stations = await this.prisma.station.findMany({
      select: { id: true, name: true, city: true, state: true },
      orderBy: { name: 'asc' },
    });
    const types = await this.prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
    const cities = Array.from(new Set(stations.map((s) => s.city))).sort();

    return { stations, types, cities };
  }

  /**
   * Visão geográfica: estações com coordenadas GPS + as conexões físicas
   * que ligam uma estação a OUTRA estação (ignora conexões internas, que só
   * fazem sentido na visão de topologia detalhada por equipamento).
   */
  async getGeoTopology() {
    const stations = await this.prisma.station.findMany();

    const connections = await this.prisma.connection.findMany({
      include: {
        sourcePort: { include: { equipment: true } },
        targetPort: { include: { equipment: true } },
      },
    });

    const interStationLinks = connections
      .filter((conn) => conn.sourcePort.equipment.stationId !== conn.targetPort.equipment.stationId)
      .map((conn) => ({
        id: conn.id,
        name: conn.name,
        sourceStationId: conn.sourcePort.equipment.stationId,
        targetStationId: conn.targetPort.equipment.stationId,
        status: conn.status,
        type: conn.type,
        isBackup: conn.isBackup,
      }));

    return {
      stations: stations.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        state: s.state,
        latitude: s.latitude,
        longitude: s.longitude,
        status: s.status,
      })),
      links: interStationLinks,
    };
  }
}
