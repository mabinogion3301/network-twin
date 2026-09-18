import { ConnectionsService } from './connections.service';
import { ConnectionQueryDto, CreateConnectionDto, UpdateConnectionDto } from './dto/connection.dto';
export declare class ConnectionsController {
    private service;
    constructor(service: ConnectionsService);
    findAll(query: ConnectionQueryDto): import(".prisma/client").Prisma.PrismaPromise<({
        sourcePort: {
            equipment: {
                station: {
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
        } & {
            number: number;
            id: string;
            name: string | null;
            status: import(".prisma/client").$Enums.PortStatus;
            type: import(".prisma/client").$Enums.PortType;
            equipmentId: string;
            speed: string | null;
        };
        targetPort: {
            equipment: {
                station: {
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
        } & {
            number: number;
            id: string;
            name: string | null;
            status: import(".prisma/client").$Enums.PortStatus;
            type: import(".prisma/client").$Enums.PortType;
            equipmentId: string;
            speed: string | null;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        sourcePort: {
            equipment: {
                station: {
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
        } & {
            number: number;
            id: string;
            name: string | null;
            status: import(".prisma/client").$Enums.PortStatus;
            type: import(".prisma/client").$Enums.PortType;
            equipmentId: string;
            speed: string | null;
        };
        targetPort: {
            equipment: {
                station: {
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
        } & {
            number: number;
            id: string;
            name: string | null;
            status: import(".prisma/client").$Enums.PortStatus;
            type: import(".prisma/client").$Enums.PortType;
            equipmentId: string;
            speed: string | null;
        };
    } & {
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
    }>;
    create(dto: CreateConnectionDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateConnectionDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
