import { FailuresService } from './failures.service';
import { CreateFailureDto, UpdateNoteDto } from './dto/failure.dto';
export declare class FailuresController {
    private readonly service;
    constructor(service: FailuresService);
    create(dto: CreateFailureDto, req: any): Promise<any>;
    findActive(): any;
    findHistory(): any;
    getCurrentImpactState(): Promise<{
        failures: any;
        removedConnectionIds: string[];
        stationFailures: any;
    }>;
    findOne(id: string): any;
    acknowledge(id: string, req: any): Promise<any>;
    restore(id: string, req: any): Promise<any>;
    updateNote(id: string, dto: UpdateNoteDto): Promise<any>;
}
