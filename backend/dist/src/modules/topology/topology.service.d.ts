import { PrismaService } from '../../prisma.module';
export interface TopologyNode {
    data: {
        id: string;
        label: string;
        type: 'station' | 'equipment';
        parent?: string;
        equipmentType?: string;
        stationId?: string;
        stationName?: string;
        city?: string;
        state?: string;
        status: string;
        ip?: string | null;
    };
    position?: {
        x: number;
        y: number;
    };
}
export interface TopologyEdge {
    data: {
        id: string;
        source: string;
        target: string;
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
export declare class TopologyService {
    private prisma;
    constructor(prisma: PrismaService);
    getTopology(filters: TopologyFilters): Promise<{
        nodes: TopologyNode[];
        edges: TopologyEdge[];
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
