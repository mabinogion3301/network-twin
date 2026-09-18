import { SimulationsService } from './simulations.service';
import { RunSimulationDto } from './dto/simulation.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
export declare class SimulationsController {
    private service;
    constructor(service: SimulationsService);
    run(dto: RunSimulationDto, user: JwtPayload): Promise<{
        removedConnectionIds: string[];
        removedEquipmentIds: string[];
        unavailableStationPairs: {
            stationAName: string;
            stationBName: string;
            linkId: string;
            stationAId: string;
            stationBId: string;
        }[];
        isolatedEquipment: {
            id: string;
            name: string;
        }[];
        impactedConnections: {
            id: string;
            name: string;
        }[];
        isolatedEquipmentIds: string[];
        impactedConnectionIds: string[];
        remainingEquipmentCount: number;
        remainingEdgeCount: number;
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
}
