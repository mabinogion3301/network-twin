import { PrismaService } from '../../prisma.module';
import { CreateStationLinkDto, UpdateStationLinkDto } from './dto/station-link.dto';
export declare class StationLinksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(stationId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        stationA: {
            id: string;
            name: string;
            createdAt: Date;
            city: string;
            state: string;
            latitude: number | null;
            longitude: number | null;
            mapPositionX: number | null;
            mapPositionY: number | null;
            notes: string | null;
            trechos: string[];
            status: import(".prisma/client").$Enums.StationStatus;
            updatedAt: Date;
        };
        stationB: {
            id: string;
            name: string;
            createdAt: Date;
            city: string;
            state: string;
            latitude: number | null;
            longitude: number | null;
            mapPositionX: number | null;
            mapPositionY: number | null;
            notes: string | null;
            trechos: string[];
            status: import(".prisma/client").$Enums.StationStatus;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        stationBId: string;
        stationAId: string;
    })[]>;
    findOne(id: string): Promise<{
        stationA: {
            id: string;
            name: string;
            createdAt: Date;
            city: string;
            state: string;
            latitude: number | null;
            longitude: number | null;
            mapPositionX: number | null;
            mapPositionY: number | null;
            notes: string | null;
            trechos: string[];
            status: import(".prisma/client").$Enums.StationStatus;
            updatedAt: Date;
        };
        stationB: {
            id: string;
            name: string;
            createdAt: Date;
            city: string;
            state: string;
            latitude: number | null;
            longitude: number | null;
            mapPositionX: number | null;
            mapPositionY: number | null;
            notes: string | null;
            trechos: string[];
            status: import(".prisma/client").$Enums.StationStatus;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        stationBId: string;
        stationAId: string;
    }>;
    create(dto: CreateStationLinkDto): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        stationBId: string;
        stationAId: string;
    }>;
    update(id: string, dto: UpdateStationLinkDto): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        stationBId: string;
        stationAId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        stationBId: string;
        stationAId: string;
    }>;
    private ensureExists;
}
