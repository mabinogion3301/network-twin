import { TopologyService } from './topology.service';
export declare class TopologyController {
    private service;
    constructor(service: TopologyService);
    getTopology(city?: string, stationId?: string, typeId?: string, status?: string): Promise<{
        nodes: import("./topology.service").TopologyNode[];
        edges: import("./topology.service").TopologyEdge[];
    }>;
    getFilterOptions(): Promise<{
        stations: {
            id: string;
            name: string;
            city: string;
            state: string;
        }[];
        types: {
            id: string;
            name: string;
        }[];
        cities: string[];
    }>;
    getGeoTopology(): Promise<{
        stations: {
            id: string;
            name: string;
            city: string;
            state: string;
            latitude: number;
            longitude: number;
            status: import(".prisma/client").$Enums.StationStatus;
            trechos: string[];
        }[];
        links: {
            id: string;
            name: string;
            sourceStationId: string;
            targetStationId: string;
            sourceEquipmentId: string;
            sourceEquipmentName: string;
            targetEquipmentId: string;
            targetEquipmentName: string;
            status: import(".prisma/client").$Enums.ConnectionStatus;
            type: import(".prisma/client").$Enums.ConnectionType;
            isBackup: boolean;
        }[];
    }>;
}
