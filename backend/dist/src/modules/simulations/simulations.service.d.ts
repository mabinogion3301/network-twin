import { PrismaService } from '../../prisma.module';
import { GraphService } from '../graph/graph.service';
import { RunSimulationDto } from './dto/simulation.dto';
import { EventsGateway } from '../events-gateway/events.gateway';
export declare class SimulationsService {
    private prisma;
    private graphService;
    private eventsGateway;
    constructor(prisma: PrismaService, graphService: GraphService, eventsGateway: EventsGateway);
    run(dto: RunSimulationDto, triggeredByUserId: string): Promise<{
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
    getCurrentState(): Promise<{
        simulationId: string;
        notes: string;
    }>;
    updateNotes(id: string, notes: string): Promise<{
        simulationId: string;
        notes: string;
    }>;
    updateConnectionNote(simulationId: string, connectionId: string, note: string): Promise<{
        simulationId: string;
        notes: string;
    }>;
}
