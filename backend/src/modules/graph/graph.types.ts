export interface GraphEdgeInput {
  connectionId: string;
  equipmentA: string;
  equipmentB: string;
}

export interface SimulateFailureInput {
  allEquipmentIds: string[];
  equipmentToStation: Record<string, string>; // equipmentId -> stationId
  allEdges: GraphEdgeInput[];
  directStationLinks: Array<{ linkId: string; stationAId: string; stationBId: string }>;
  removedConnectionIds: string[];
  removedEquipmentIds: string[];
}

export interface UnavailableStationPair {
  linkId: string;
  stationAId: string;
  stationBId: string;
}

export interface SimulateFailureResult {
  unavailableStationPairs: UnavailableStationPair[];
  isolatedEquipmentIds: string[];
  impactedConnectionIds: string[];
  remainingEquipmentCount: number;
  remainingEdgeCount: number;
}
