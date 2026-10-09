export type StationImpactState = 'NORMAL' | 'DEGRADING' | 'IMPACTED' | 'ISOLATED';
export interface StationConnection {
    id: string;
    stationAId: string;
    stationBId: string;
}
export interface ImpactAnalysisInput {
    stationConnections: StationConnection[];
    allStationIds: string[];
    coreStationIds: string[];
    failedConnectionIds: string[];
}
export interface ImpactAnalysisResult {
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
export interface GraphEdgeInput {
    connectionId: string;
    equipmentA: string;
    equipmentB: string;
}
export interface SimulateFailureInput {
    allEquipmentIds: string[];
    equipmentToStation: Record<string, string>;
    allEdges: GraphEdgeInput[];
    directStationLinks: Array<{
        linkId: string;
        stationAId: string;
        stationBId: string;
    }>;
    removedConnectionIds: string[];
    removedEquipmentIds: string[];
}
export interface SimulateFailureResult {
    unavailableStationPairs: Array<{
        linkId: string;
        stationAId: string;
        stationBId: string;
    }>;
    isolatedEquipmentIds: string[];
    impactedConnectionIds: string[];
    remainingEquipmentCount: number;
    remainingEdgeCount: number;
}
