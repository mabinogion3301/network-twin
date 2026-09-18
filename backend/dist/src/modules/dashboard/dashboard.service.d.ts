import { PrismaService } from '../../prisma.module';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
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
