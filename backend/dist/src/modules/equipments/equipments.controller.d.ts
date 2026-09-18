import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto, EquipmentQueryDto, UpdateEquipmentDto } from './dto/equipment.dto';
export declare class EquipmentsController {
    private service;
    constructor(service: EquipmentsService);
    findAll(query: EquipmentQueryDto): import(".prisma/client").Prisma.PrismaPromise<({
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
        type: {
            id: string;
            name: string;
        };
        model: {
            manufacturer: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            manufacturerId: string;
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
    })[]>;
    findOne(id: string): Promise<{
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
        type: {
            id: string;
            name: string;
        };
        model: {
            manufacturer: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            manufacturerId: string;
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
    }>;
    create(dto: CreateEquipmentDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateEquipmentDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
