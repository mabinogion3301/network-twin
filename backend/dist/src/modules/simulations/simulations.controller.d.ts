import { SimulationsService } from './simulations.service';
import { RunSimulationDto } from './dto/simulation.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
export declare class SimulationsController {
    private service;
    constructor(service: SimulationsService);
    run(dto: RunSimulationDto, user: JwtPayload): Promise<{
        removedConnectionIds: string[];
        failedStationIds: string[];
        overheatStationIds: string[];
        stationStates: Record<string, import("../graph/graph.types").StationImpactState>;
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
        coreStationIds: string[];
        simulationId: string;
    }>;
    findHistory(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        updatedAt: Date;
        triggeredByUserId: string;
        removedConnectionIds: string[];
        removedEquipmentIds: string[];
        resultJson: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getCurrentState(): Promise<{
        simulationId: string;
        notes: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        updatedAt: Date;
        triggeredByUserId: string;
        removedConnectionIds: string[];
        removedEquipmentIds: string[];
        resultJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateNotes(id: string, body: {
        notes: string;
    }): Promise<{
        simulationId: string;
        notes: string;
    }>;
    updateConnectionNote(id: string, body: {
        connectionId: string;
        note: string;
    }): Promise<{
        simulationId: string;
        notes: string;
    }>;
}
