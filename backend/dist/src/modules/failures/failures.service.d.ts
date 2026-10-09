import { PrismaService } from '../../prisma.module';
import { EventsGateway } from '../events-gateway/events.gateway';
import { CreateFailureDto } from './dto/failure.dto';
export declare class FailuresService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(dto: CreateFailureDto, userId: string): Promise<any>;
    findActive(): any;
    findHistory(): any;
    findAll(): any;
    findOne(id: string): any;
    acknowledge(id: string, userId: string): Promise<any>;
    restore(id: string, userId: string): Promise<any>;
    updateNote(id: string, note: string): Promise<any>;
    getActiveRemovedConnectionIds(): Promise<string[]>;
    getCurrentImpactState(): Promise<{
        failures: any;
        removedConnectionIds: string[];
        stationFailures: any;
    }>;
    private broadcastImpact;
}
