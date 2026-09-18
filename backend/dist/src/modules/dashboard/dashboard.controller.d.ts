import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private service;
    constructor(service: DashboardService);
    getOverview(): Promise<{
        stationsCount: number;
        equipmentsCount: number;
        connectionsCount: number;
        offlineConnections: number;
        offlineStations: number;
        offlineEquipments: number;
        linksInFailure: number;
        equipmentInFailure: number;
        stationsInFailure: number;
        hasActiveSimulation: boolean;
        recentSimulations: {
            id: string;
            createdAt: Date;
            notes: string | null;
            updatedAt: Date;
            triggeredByUserId: string;
            removedConnectionIds: string[];
            removedEquipmentIds: string[];
            resultJson: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
}
