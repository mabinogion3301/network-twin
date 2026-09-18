import { PortsService } from './ports.service';
import { CreatePortDto, PortQueryDto, UpdatePortDto } from './dto/port.dto';
export declare class PortsController {
    private service;
    constructor(service: PortsService);
    findAll(query: PortQueryDto): import(".prisma/client").Prisma.PrismaPromise<({
        equipment: {
            id: string;
            name: string;
            stationId: string;
        };
    } & {
        number: number;
        id: string;
        name: string | null;
        status: import(".prisma/client").$Enums.PortStatus;
        type: import(".prisma/client").$Enums.PortType;
        equipmentId: string;
        speed: string | null;
    })[]>;
    findOne(id: string): Promise<{
        equipment: {
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
        };
        connectionsAsSource: {
            id: string;
            name: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ConnectionStatus;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ConnectionType;
            sourcePortId: string;
            targetPortId: string;
            distance: number | null;
            fiberCount: number | null;
            fibersUsed: number | null;
            isBackup: boolean;
        }[];
        connectionsAsTarget: {
            id: string;
            name: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ConnectionStatus;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ConnectionType;
            sourcePortId: string;
            targetPortId: string;
            distance: number | null;
            fiberCount: number | null;
            fibersUsed: number | null;
            isBackup: boolean;
        }[];
    } & {
        number: number;
        id: string;
        name: string | null;
        status: import(".prisma/client").$Enums.PortStatus;
        type: import(".prisma/client").$Enums.PortType;
        equipmentId: string;
        speed: string | null;
    }>;
    create(dto: CreatePortDto): Promise<{
        number: number;
        id: string;
        name: string | null;
        status: import(".prisma/client").$Enums.PortStatus;
        type: import(".prisma/client").$Enums.PortType;
        equipmentId: string;
        speed: string | null;
    }>;
    update(id: string, dto: UpdatePortDto): Promise<{
        number: number;
        id: string;
        name: string | null;
        status: import(".prisma/client").$Enums.PortStatus;
        type: import(".prisma/client").$Enums.PortType;
        equipmentId: string;
        speed: string | null;
    }>;
    remove(id: string): Promise<{
        number: number;
        id: string;
        name: string | null;
        status: import(".prisma/client").$Enums.PortStatus;
        type: import(".prisma/client").$Enums.PortType;
        equipmentId: string;
        speed: string | null;
    }>;
}
