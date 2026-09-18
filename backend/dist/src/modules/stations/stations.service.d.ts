import { PrismaService } from '../../prisma.module';
import { CreateStationDto, StationQueryDto, UpdateStationDto } from './dto/station.dto';
import { EventsGateway } from '../events-gateway/events.gateway';
export declare class StationsService {
    private prisma;
    private events;
    constructor(prisma: PrismaService, events: EventsGateway);
    findAll(query: StationQueryDto): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: string): Promise<{
        equipments: ({
            type: {
                id: string;
                name: string;
            };
            ports: {
                number: number;
                id: string;
                name: string | null;
                status: import(".prisma/client").$Enums.PortStatus;
                type: import(".prisma/client").$Enums.PortType;
                equipmentId: string;
                speed: string | null;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.EquipmentStatus;
            updatedAt: Date;
            stationId: string;
            typeId: string;
            manufacturerId: string | null;
            modelId: string | null;
            ip: string | null;
            mac: string | null;
            serial: string | null;
            rack: string | null;
            rackPosition: string | null;
            portCount: number;
        })[];
    } & {
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
    }>;
    create(dto: CreateStationDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateStationDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    private ensureExists;
}
