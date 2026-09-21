export type StationImpactState = 'NORMAL' | 'DEGRADING' | 'IMPACTED' | 'ISOLATED';

export interface StationConnection {
  id: string;
  stationAId: string;
  stationBId: string;
}

export interface ImpactAnalysisInput {
  // Conexões entre estações (derivadas das conexões de equipamentos)
  stationConnections: StationConnection[];
  // Todas as estações da rede
  allStationIds: string[];
  // Estações marcadas como CORE (pontos de gerenciamento)
  coreStationIds: string[];
  // Conexões que estão DOWN (rompidas na simulação)
  failedConnectionIds: string[];
}

export interface ImpactAnalysisResult {
  // Estado de cada estação
  stationStates: Record<string, StationImpactState>;
  isolatedStationIds: string[];
  degradingStationIds: string[];
  impactedStationIds: string[];
  normalStationIds: string[];
  stats: {
    total: number;
    normal: number;
    degrading: number;
    impacted: number;
    isolated: number;
  };
}

// Mantidos para compatibilidade com partes do código que ainda usam o antigo
export interface GraphEdgeInput {
  connectionId: string;
  equipmentA: string;
  equipmentB: string;
}

export interface SimulateFailureInput {
  allEquipmentIds: string[];
  equipmentToStation: Record<string, string>;
  allEdges: GraphEdgeInput[];
  directStationLinks: Array<{ linkId: string; stationAId: string; stationBId: string }>;
  removedConnectionIds: string[];
  removedEquipmentIds: string[];
}

export interface SimulateFailureResult {
  unavailableStationPairs: Array<{ linkId: string; stationAId: string; stationBId: string }>;
  isolatedEquipmentIds: string[];
  impactedConnectionIds: string[];
  remainingEquipmentCount: number;
  remainingEdgeCount: number;
}
